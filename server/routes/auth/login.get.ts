import { getRequestIP } from "h3";
import { buildLoginUrl } from "../../utils/oidc";
import { useDb } from "../../utils/db";
import { oauthState } from "../../utils/schema";
import { lt } from "drizzle-orm";
import {
  OAUTH_STATE_TTL_SECONDS,
  setOAuthStateCookie,
} from "../../utils/oauth-state";
import { consumeLoginRateLimit } from "../../utils/rate-limit";

// Start the OIDC login: store CSRF state + PKCE verifier, then redirect to the provider.
export default defineEventHandler(async (event) => {
  // Do not trust a caller-supplied X-Forwarded-For value for throttling.
  const clientKey = getRequestIP(event) || "unknown";
  if (!consumeLoginRateLimit(clientKey)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many login attempts",
    });
  }

  const db = useDb();
  await db.delete(oauthState).where(lt(oauthState.expiresAt, new Date()));

  const { url, state, codeVerifier, nonce } = await buildLoginUrl();
  const expiresAt = new Date(
    Date.now() + OAUTH_STATE_TTL_SECONDS * 1000,
  );
  await db.insert(oauthState).values({ state, codeVerifier, nonce, expiresAt });
  setOAuthStateCookie(event, state);
  return sendRedirect(event, url, 302);
});
