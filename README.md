# Study Planner

A study planner for tracking modules, credit points (CP), and semesters against a
course template. Built with **Nuxt 4** (Vue 3 + Pinia) with a **Nitro backend** that
persists plans in **SQLite** and authenticates users via **OpenID Connect**.

The whole app — UI and API — is a single Nuxt server, so it ships as **one Docker image**.

## Storage modes

The frontend persistence layer is pluggable via `NUXT_PUBLIC_STORAGE_MODE`:

- **`backend`** (default): plans are stored in the database via the API; users log in with OIDC.
- **`local`**: plans are stored only in the browser's `localStorage` (the original offline
  behavior). No backend or login required — handy for development.

## Quick start (local development)

```bash
npm install
cp .env.example .env      # fill in OIDC credentials for backend mode
npm run dev               # http://localhost:3000
```

For pure offline UI work without configuring OIDC:

```bash
NUXT_PUBLIC_STORAGE_MODE=local npm run dev
```

Database migrations are applied automatically on server startup. To generate a new migration
after changing `server/utils/schema.ts`:

```bash
npm run db:generate
```

## Configuration

See [.env.example](.env.example). Key variables:

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_STORAGE_MODE` | `backend` (default) or `local` |
| `DATABASE_URL` | libSQL/SQLite location, e.g. `file:./data/studyplanner.db` |
| `PUBLIC_URL` | Public base URL; OIDC redirect is `${PUBLIC_URL}/auth/callback` |
| `OIDC_ISSUER` | Your OIDC provider's issuer URL (discovery-based) |
| `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` | OAuth client credentials |

### Setting up your OIDC provider

The app works with any standards-compliant OpenID Connect provider (Keycloak, Authentik,
Auth0, Zitadel, Okta, Ory, Google, etc.). In your provider, register an OAuth **Web
application** / confidential client and configure:

1. **Issuer URL** → set `OIDC_ISSUER` to it. It must serve a discovery document at
   `${OIDC_ISSUER}/.well-known/openid-configuration`.
2. **Redirect URI** → `${PUBLIC_URL}/auth/callback`
   (e.g. `http://localhost:3000/auth/callback` for local dev).
3. **Scopes** → the app requests `openid email profile`.
4. Copy the client ID/secret into `.env` (`OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET`).

## Deployment (Docker)

The app builds to a single image and runs as one process. The SQLite database is kept on a
named volume so it survives restarts.

```bash
cp .env.example .env      # set PUBLIC_URL + OIDC credentials for your domain
docker compose up --build
```

The app is served on `http://localhost:3000` (map/proxy as needed). Set `PUBLIC_URL` to the
externally reachable URL and register that `${PUBLIC_URL}/auth/callback` with your OIDC provider.

## Architecture

```
app/                 Vue SPA (components, stores, composables)
  repositories/      pluggable persistence (localStorage vs API)
server/              Nitro backend
  routes/auth/       OIDC login / callback / logout
  api/               session-guarded REST (plans, me)
  utils/             drizzle schema + client, sessions, OIDC config
  middleware/        attach the authenticated user to requests
  plugins/           apply DB migrations on startup
drizzle/             generated SQL migrations
```
