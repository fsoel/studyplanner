import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { H3Event } from "h3";
import { useDb } from "./db";
import { serverConfig } from "./config";
import { sessions, users, type UserRow } from "./schema";

const COOKIE_NAME = "sp_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function isSecure(): boolean {
  return serverConfig().publicUrl.startsWith("https://");
}

/** Create a new opaque session token for a user and persist it. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await useDb().insert(sessions).values({ id: token, userId, expiresAt });
  return token;
}

/** Resolve a session token to its user, deleting the session if expired. */
export async function getUserFromSession(
  token: string | undefined,
): Promise<UserRow | null> {
  if (!token) return null;
  const db = useDb();
  const row = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .get();

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }
  return row.user;
}

export async function revokeSession(token: string): Promise<void> {
  await useDb().delete(sessions).where(eq(sessions.id, token));
}

export function getSessionCookie(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME);
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(),
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}

/** Return the authenticated user or throw a 401. */
export function requireUser(event: H3Event): UserRow {
  const user = event.context.user as UserRow | null | undefined;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return user;
}
