import { getUserFromSession, getSessionCookie } from "../utils/session";

// Attach the authenticated user (or null) to the request context for API routes.
export default defineEventHandler(async (event) => {
  const path = event.path || "";
  if (!path.startsWith("/api")) return;
  event.context.user = await getUserFromSession(getSessionCookie(event));
});
