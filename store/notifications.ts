import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

export const state = () => ({})

export type AnotherModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnotherModuleState, RootState> = {}

export const mutations: MutationTree<AnotherModuleState> = {}

export const actions: ActionTree<AnotherModuleState, RootState> = {
  playNotificationSound() {
    const sound = document.getElementById(
      'notification-audio'
    ) as HTMLAudioElement
    sound.pause()
    sound.currentTime = 0
    sound.play()
  },
}
