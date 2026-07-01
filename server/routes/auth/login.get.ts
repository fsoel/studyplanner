import { buildLoginUrl } from "../../utils/oidc";
import { useDb } from "../../utils/db";
import { oauthState } from "../../utils/schema";

// Start the OIDC login: store CSRF state + PKCE verifier, then redirect to the provider.
export default defineEventHandler(async (event) => {
  const { url, state, codeVerifier } = await buildLoginUrl();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
  await useDb().insert(oauthState).values({ state, codeVerifier, expiresAt });
  return sendRedirect(event, url, 302);
});
