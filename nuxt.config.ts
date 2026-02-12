export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-01-01',

  modules: ['@pinia/nuxt', '@nuxtjs/supabase'],

  supabase: {
    auth: { enabled: false },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
    },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Claude Tasks',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A designer task manager powered by Claude AI' },
        { name: 'theme-color', content: '#1a1815' },
      ],
      htmlAttrs: { lang: 'en' },
    },
  },

  devtools: { enabled: false },
})
