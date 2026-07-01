// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],
  runtimeConfig: {
    // Server-only settings are read directly from process.env at runtime via
    // server/utils/config.ts (so plain env var names work in Docker). Only the
    // public flag lives here, since it must be serialized to the client.
    public: {
      // 'backend' (default, uses the Nitro API) or 'local' (localStorage only, offline dev)
      storageMode: process.env.NUXT_PUBLIC_STORAGE_MODE || "backend",
    },
  },
})

