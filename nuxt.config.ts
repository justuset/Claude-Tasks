export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-01-01',

  modules: ['@pinia/nuxt'],

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

  ssr: false,

  nitro: {
    output: {
      publicDir: 'dist',
    },
  },

  devtools: { enabled: false },
})
