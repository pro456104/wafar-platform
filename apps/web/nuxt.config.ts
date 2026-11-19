// The Nuxt application: the layer, the UI module, the API proxy, and the
// right-to-left Arabic document the platform always renders (FR-026).
export default defineNuxtConfig({
  extends: ['@wafar/ui'],
  modules: ['@nuxt/ui'],
  css: ['~/assets/main.css'],
  devtools: { enabled: false },
  // The merchant page is a client-side surface: the session and quota resources
  // are provided by the layer's client plugin, so the route renders in the
  // browser and the merchant door decides there (FR-002-FR-004, FR-015).
  routeRules: {
    '/upload': { ssr: false },
  },
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { dir: 'rtl', lang: 'ar' },
      titleTemplate: '%s — منصة وفر',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env['API_BASE'] ?? 'http://localhost:3001',
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'gray', 'slate', 'success', 'error'],
    },
  },
});
