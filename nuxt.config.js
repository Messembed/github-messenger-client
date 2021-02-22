export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'github-messenger-client',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
    script: [
      {
        hid: 'yandex-metrica-script',
        innerHTML: `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      
          ym(72817591, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              trackHash:true
          });
        `,
        type: 'text/javascript',
      },
    ],
    noscript: [
      {
        hid: 'yandex-metrica-noscript',
        innerHTML: `
          <div><img src="https://mc.yandex.ru/watch/72817591" style="position:absolute; left:-9999px;" alt="" /></div>
        `,
      },
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'yandex-metrica-script': ['innerHTML'],
      'yandex-metrica-noscript': ['innerHTML'],
    },
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
  build: {
    extend(config) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      })
    },
  },

  env: {
    MESSEMBED_URL: process.env.MESSEMBED_URL,
    GITHUB_MESSENGER_BACKEND_URL: process.env.GITHUB_MESSENGER_BACKEND_URL,
  },

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
