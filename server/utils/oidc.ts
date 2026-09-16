import * as client from "openid-client";
import { serverConfig } from "./config";

let _config: client.Configuration | undefined;

/** Discover and cache the OIDC provider configuration. */
export async function getOidcConfig(): Promise<client.Configuration> {
  if (_config) return _config;
  const cfg = serverConfig();
  if (!cfg.oidcIssuer || !cfg.oidcClientId || !cfg.oidcClientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "OIDC is not configured (set OIDC_ISSUER, OIDC_CLIENT_ID and OIDC_CLIENT_SECRET).",
    });
  }
  _config = await client.discovery(
    new URL(cfg.oidcIssuer),
    cfg.oidcClientId,
    cfg.oidcClientSecret,
  );
  return _config;
}

export function getRedirectUri(): string {
  return `${serverConfig().publicUrl}/auth/callback`;
}

/** Build the provider authorize URL with PKCE, CSRF state, and OIDC nonce. */
export async function buildLoginUrl(): Promise<{
  url: string;
  state: string;
  codeVerifier: string;
  nonce: string;
}> {
  const config = await getOidcConfig();
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: getRedirectUri(),
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
  });

  return { url: url.href, state, codeVerifier, nonce };
}

export interface OidcIdentity {
  issuer: string;
  subject: string;
  email: string | null;
  name: string | null;
}

/** Exchange the authorization code and validate state, PKCE, and nonce. */
export async function handleCallback(
  currentUrl: URL,
  codeVerifier: string,
  expectedState: string,
  expectedNonce: string,
): Promise<OidcIdentity> {
  const config = await getOidcConfig();
  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
    expectedNonce,
  });
  const claims = tokens.claims();
  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: "No subject in token" });
  }
  return {
    issuer: claims.iss,
    subject: claims.sub,
    email: (claims.email as string) ?? null,
    name: ((claims.name ?? claims.given_name) as string) ?? null,
  };
}
