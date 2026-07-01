import { revokeSession, getSessionCookie, clearSessionCookie } from "../../utils/session";

// End the session: revoke the token server-side and clear the cookie.
export default defineEventHandler(async (event) => {
  const token = getSessionCookie(event);
  if (token) await revokeSession(token);
  clearSessionCookie(event);
  return { ok: true };
});
