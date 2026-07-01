import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { handleCallback } from "../../utils/oidc";
import { createSession, setSessionCookie } from "../../utils/session";
import { useDb } from "../../utils/db";
import { serverConfig } from "../../utils/config";
import { oauthState, users } from "../../utils/schema";

// OIDC redirect target: validate state, exchange the code, upsert the user, start a session.
export default defineEventHandler(async (event) => {
  const db = useDb();
  const state = String(getQuery(event).state || "");

  const stateRow = await db
    .select()
    .from(oauthState)
    .where(eq(oauthState.state, state))
    .get();
  if (state) {
    await db.delete(oauthState).where(eq(oauthState.state, state));
  }
  if (!stateRow) {
    throw createError({ statusCode: 400, statusMessage: "Invalid OAuth state" });
  }
  if (stateRow.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 400, statusMessage: "OAuth state expired" });
  }

  // Reconstruct the full callback URL against the trusted public base URL.
  const currentUrl = new URL(
    event.node.req.url || "/auth/callback",
    serverConfig().publicUrl,
  );
  const identity = await handleCallback(
    currentUrl,
    stateRow.codeVerifier,
    state,
  );

  const existing = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.issuer, identity.issuer),
        eq(users.subject, identity.subject),
      ),
    )
    .get();

  let userId: string;
  if (existing) {
    userId = existing.id;
    await db
      .update(users)
      .set({ email: identity.email, name: identity.name })
      .where(eq(users.id, existing.id));
  } else {
    userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      issuer: identity.issuer,
      subject: identity.subject,
      email: identity.email,
      name: identity.name,
    });
  }

  const token = await createSession(userId);
  setSessionCookie(event, token);
  return sendRedirect(event, "/", 302);
});
