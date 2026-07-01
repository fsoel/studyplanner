# Build the self-contained Nuxt/Nitro server (UI + API in one output).
FROM node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime image: only the built server + migrations are needed.
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NUXT_PUBLIC_STORAGE_MODE=backend

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
