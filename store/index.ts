import { GetterTree, ActionTree, MutationTree } from 'vuex'
import jsCookie from 'js-cookie'
import { MessembedSDK, User } from '~/../messembed-sdk/dist'

export const state = () => ({
  messembedSdk: null as MessembedSDK | null,
  messembedAccount: null as User | null,
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  messembedSdk: (state) => state.messembedSdk,
  messembedAccount: (state) => state.messembedAccount,
}

export const mutations: MutationTree<RootState> = {
  SET_MESSEMBED_SDK_INSTANCE: (state, messembedSdk: MessembedSDK) =>
    (state.messembedSdk = messembedSdk),
  SET_MESSEMBED_ACCOUNT: (state, messembedAccount: User) =>
    (state.messembedAccount = messembedAccount),
}

export const actions: ActionTree<RootState, RootState> = {
  initMessembedSdk({ commit }) {
    if (this.getters.messembedSdk) {
      return
    }

    // const backendAccessToken = jsCookie.get('backendAccessToken')
    const messembedAccessToken = jsCookie.get('messembedAccessToken')

    if (!messembedAccessToken) {
      throw new Error('No access token for messembed found')
    }

    const messembedSdk = new MessembedSDK({
      baseUrl: 'http://localhost:3000',
      accessToken: messembedAccessToken,
    })

    commit('SET_MESSEMBED_SDK_INSTANCE', messembedSdk)
    this.dispatch('fetchMessembedAccount')
  },
  async fetchMessembedAccount({ commit }) {
    const messembedAccount = await (this.getters
      .messembedSdk as MessembedSDK).getMe()
    commit('SET_MESSEMBED_ACCOUNT', messembedAccount)
  },
}
