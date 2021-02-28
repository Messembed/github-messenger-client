import { MessembedSDK } from 'messembed-sdk'
import jsCookie from 'js-cookie'
import { Inject, NuxtApp } from '@nuxt/types/app'

interface MessembedSdkPluginPayload {
  sdk: MessembedSDK | null
}

declare module 'vue/types/vue' {
  // this.$messembed inside Vue components
  interface Vue {
    $messembed: MessembedSdkPluginPayload
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$messembed inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $messembed: MessembedSdkPluginPayload
  }
  // nuxtContext.$messembed
  interface Context {
    $messembed: MessembedSdkPluginPayload
  }
}

declare module 'vuex/types/index' {
  // this.$messembed inside Vuex stores
  interface Store<S> {
    $messembed: MessembedSdkPluginPayload
  }
}

export default function messembedSdkPlugin(_app: NuxtApp, inject: Inject) {
  console.log('messembedSdkPlugin')
  const messembedAccessToken = jsCookie.get('messembedAccessToken')

  const payload: MessembedSdkPluginPayload = {
    sdk: messembedAccessToken
      ? new MessembedSDK({
          accessToken: messembedAccessToken,
          baseUrl: process.env.MESSEMBED_URL!,
        })
      : null,
  }

  inject('messembed', payload)
}
