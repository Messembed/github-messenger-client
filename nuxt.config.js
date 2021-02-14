export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'github-messenger-client',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '@primer/css/forms/index.scss',
    '@primer/css/buttons/index.scss',
    'bootstrap/scss/bootstrap-grid.scss',
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  // plugins: ['~plugins/bootstrap-vue.ts'],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    ...(process.env.NODE_ENV === 'development' ? ['@nuxtjs/proxy'] : []),
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  server: {
    port: process.env.PORT,
    host: process.env.HOST,
  },

  ...(process.env.NODE_ENV === 'development'
    ? {
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            pathRewrite: { '^/api': '' },
          },
        },
      }
    : {}),
}
