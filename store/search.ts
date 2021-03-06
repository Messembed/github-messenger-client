import { GetterTree, ActionTree, MutationTree } from 'vuex'
import jsCookie from 'js-cookie'
import { User } from 'messembed-sdk'
import { RootState } from '~/store'

export const state = () => ({
  searchMode: false,
  users: [] as User[],
})

export type AnotherModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnotherModuleState, RootState> = {
  searchMode: (state) => state.searchMode,
  users: (state) => state.users,
}

export const mutations: MutationTree<AnotherModuleState> = {
  TURN_ON_SEARCH_MODE: (state) => (state.searchMode = true),
  TURN_OFF_SEARCH_MODE: (state) => (state.searchMode = false),
  SET_SEARCH_RESULT: (state, users) => (state.users = users),
}

export const actions: ActionTree<AnotherModuleState, RootState> = {
  async searchUsers({ commit }, q: string) {
    commit('TURN_ON_SEARCH_MODE')

    const backendAccessToken = jsCookie.get('backendAccessToken')

    const response = await this.$axios.get(
      process.env.GITHUB_MESSENGER_BACKEND_URL + '/github-users',
      {
        params: { q },
        headers: { authorization: `Bearer ${backendAccessToken}` },
      }
    )

    console.log(response)
    commit('SET_SEARCH_RESULT', response.data.data.items)
  },

  turnOffSearchMode({ commit }) {
    commit('TURN_OFF_SEARCH_MODE')
  },

  async ensureGithubUserIntegrity(
    _ctx,
    options: { githubUserId?: number; githubUsername?: string }
  ): Promise<User> {
    const backendAccessToken = jsCookie.get('backendAccessToken')

    const messembedUserId = await this.$axios.post<{ _id: string }>(
      process.env.GITHUB_MESSENGER_BACKEND_URL +
        '/ensure-github-user-integrity',
      options,
      {
        headers: { authorization: `Bearer ${backendAccessToken}` },
      }
    )

    const user = await this.$messembed.sdk?.getUser(messembedUserId.data._id)

    return user!
  },
}
