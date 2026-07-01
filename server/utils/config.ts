/**
 * Server-only configuration read from the process environment at runtime.
 *
 * Note: these are intentionally read directly from `process.env` (not Nuxt
 * `runtimeConfig`) so plain, unprefixed variable names like `DATABASE_URL` work
 * when set at container runtime. Nuxt only maps `NUXT_`-prefixed env vars onto
 * runtimeConfig at runtime, which would be surprising for a Docker `.env`.
 */
export function serverConfig() {
  return {
    databaseUrl: process.env.DATABASE_URL || "file:./data/studyplanner.db",
    // OIDC issuer URL (must expose /.well-known/openid-configuration). No default:
    // set this to your own provider's issuer.
    oidcIssuer: process.env.OIDC_ISSUER || "",
    oidcClientId: process.env.OIDC_CLIENT_ID || "",
    oidcClientSecret: process.env.OIDC_CLIENT_SECRET || "",
    // Trailing slashes stripped so `${publicUrl}/auth/callback` never doubles up
    // (a mismatching redirect_uri is a common OIDC failure).
    publicUrl: (process.env.PUBLIC_URL || "http://localhost:3000").replace(
      /\/+$/,
      "",
    ),
  };
}
