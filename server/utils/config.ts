/**
 * Server-only configuration read from the process environment at runtime.
 *
 * Note: these are intentionally read directly from `process.env` (not Nuxt
 * `runtimeConfig`) so plain, unprefixed variable names like `DATABASE_URL` work
 * when set at container runtime. Nuxt only maps `NUXT_`-prefixed env vars onto
 * runtimeConfig at runtime, which would be surprising for a Docker `.env`.
 */
let warnedAboutHttpPublicUrl = false;

export function serverConfig() {
  const publicUrl = (process.env.PUBLIC_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );

  if (!warnedAboutHttpPublicUrl && publicUrl.startsWith("http://")) {
    console.warn(
      "[security] PUBLIC_URL is using HTTP. HTTPS is strongly recommended in production; HTTP is acceptable for local development only.",
    );
    warnedAboutHttpPublicUrl = true;
  }

  return {
    databaseUrl: process.env.DATABASE_URL || "file:./data/studyplanner.db",
    oidcIssuer: process.env.OIDC_ISSUER || "",
    oidcClientId: process.env.OIDC_CLIENT_ID || "",
    oidcClientSecret: process.env.OIDC_CLIENT_SECRET || "",
    publicUrl,
  };
}
