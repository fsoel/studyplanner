# Study Planner

A self-hostable web app to plan your studies - track modules, credit points, and semesters
against a course template. Log in with your own OpenID Connect provider; your plans are saved
to a database and sync across devices.

Everything runs as **one Docker container**.

## Self-hosting

You need [Docker](https://docs.docker.com/get-docker/) and an OpenID Connect provider
(e.g. Authentik, Keycloak, Auth0, Google - see [Login setup](#login-setup)).

1. Download [docker-compose.yml](docker-compose.yml) to your server.
2. Open it and set these values under `environment:`
   - `PUBLIC_URL` - the address you'll open the app at, e.g. `https://study.example.com`
   - `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` - from your login provider
3. Start it:

   ```bash
   docker compose up -d
   ```

The app is now at `http://localhost:3000` (put it behind a reverse proxy for HTTPS and your
real domain). Your data is stored in a Docker volume, so it survives restarts and updates.

To update to the latest version:

```bash
docker compose pull && docker compose up -d
```

## Login setup

The app uses OpenID Connect, so you sign in with your own identity provider. In your provider,
create a **confidential web application** and:

1. Set the redirect URI to **`<PUBLIC_URL>/auth/callback`**
   (e.g. `https://study.example.com/auth/callback`). It must match `PUBLIC_URL` exactly.
2. Note the **issuer URL** (it serves `<issuer>/.well-known/openid-configuration`) and the
   **client ID / secret**.
3. Put those into `docker-compose.yml` as shown above.

## Configuration

| Setting | Purpose |
| --- | --- |
| `PUBLIC_URL` | Public address of the app; the login redirect is `<PUBLIC_URL>/auth/callback` |
| `OIDC_ISSUER` | Your provider's issuer URL |
| `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` | Credentials from your provider |
| `DATABASE_URL` | Database location (default is the mounted volume — leave as-is) |
| `NUXT_PUBLIC_STORAGE_MODE` | `backend` (default). Set `local` to store plans in the browser only, with no login |

## Development

Built with Nuxt 4 (Vue 3 + Pinia); the UI and API are a single Nuxt/Nitro server using SQLite.

```bash
npm install
cp .env.example .env      # set PUBLIC_URL + OIDC values
npm run dev               # http://localhost:3000
```

- `NUXT_PUBLIC_STORAGE_MODE=local npm run dev` - work on the UI with no backend or login.
- `docker compose -f docker-compose.dev.yml up --build` - run the full stack from local source.
