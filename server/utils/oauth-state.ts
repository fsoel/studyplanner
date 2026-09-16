import type { H3Event } from "h3";
import { serverConfig } from "./config";

export const OAUTH_STATE_TTL_SECONDS = 60 * 10;

const OAUTH_STATE_COOKIE = "sp_oauth_state";

function isSecure(): boolean {
  return serverConfig().publicUrl.startsWith("https://");
}

/** Bind the OIDC state to the browser that started the login. */
export function setOAuthStateCookie(event: H3Event, state: string): void {
  setCookie(event, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(),
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
}

export function getOAuthStateCookie(event: H3Event): string | undefined {
  return getCookie(event, OAUTH_STATE_COOKIE);
}

export function clearOAuthStateCookie(event: H3Event): void {
  deleteCookie(event, OAUTH_STATE_COOKIE, { path: "/" });
}
