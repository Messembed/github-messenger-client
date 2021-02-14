import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { Message, MessembedSDK, PersonalChat, Update } from 'messembed-sdk'
import _ from 'lodash'
import { RootState } from '~/store'

export const state = () => ({
  chatOpened: false,
  chatId: null as string | null,
  messages: [] as Message[],
  unreadMessages: [] as Message[],
  messagesLoaded: false,
  updatingInterval: undefined as any,
  lastUpdateDate: undefined as Date | void,
  chats: [] as PersonalChat[],
})

export type AnotherModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnotherModuleState, RootState> = {
  chats: (state) => state.chats,
  chatId: (state) => state.chatId,
  messages: (state) => state.messages,
  unreadMessages: (state) => state.unreadMessages,
  messagesLoaded: (state) => state.messagesLoaded,
  lastUpdateDate: (state) => state.lastUpdateDate,
}

export const mutations: MutationTree<AnotherModuleState> = {
  SET_CHATS: (state, chats: any[]) => (state.chats = chats),
  MARK_CHAT_AS_OPENED: (state) => (state.chatOpened = true),
  SET_CHAT_ID: (state, chatId: string) => (state.chatId = chatId),
  SET_MESSAGES: (state, messages: Message[]) => (state.messages = messages),
  SET_LAST_UPDATE_DATE: (state, lastUpdateDate: Date) =>
    (state.lastUpdateDate = lastUpdateDate),
  SET_UPDATING_INTERVAL: (state, updatingInterval: any) =>
    (state.updatingInterval = updatingInterval),
  PUSH_UPDATE_ABOUT_NEW_MESSAGE: (state, update: Update) => {
    const chat = state.chats.find((chat) => chat._id === update.chatId)
    if (chat) {
      // TODO: fix the sdk
      chat.lastMessage = update.message as any
      _.pull(state.chats, chat)
      state.chats.unshift(chat)

      if (state.chatId === chat._id) {
        state.unreadMessages.push(update.message as any)
      }
    }
  },
  MERGE_UNREAD_MESSAGES: (state) => {
    state.messages.push(...state.unreadMessages)
    state.unreadMessages = []
  },
  MARK_MESSAGES_LOADED: (state, value: boolean) =>
    (state.messagesLoaded = value),
}

export const actions: ActionTree<AnotherModuleState, RootState> = {
  async fetchChats({ commit }) {
    this.dispatch('initMessembedSdk')

    const personalChats = await (this.getters
      .messembedSdk as MessembedSDK).getPersonalChats()

    commit('SET_CHATS', personalChats)
    this.dispatch('chat/ensureUpdatingInterval')
  },
  async openChat({ commit }, chatId: string) {
    commit('MARK_MESSAGES_LOADED', false)

    this.dispatch('initMessembedSdk')

    const messasgesResult = await (this.getters
      .messembedSdk as MessembedSDK).findMessages({ chatId })

    commit('SET_CHAT_ID', chatId)
    commit('MARK_CHAT_AS_OPENED')
    commit('SET_MESSAGES', messasgesResult.messages)
    commit('MARK_MESSAGES_LOADED', true)
  },
  async sendMessage(_ctx, messageContent: string): Promise<void> {
    this.dispatch('initMessembedSdk')
    const messembedSdk = this.getters.messembedSdk as MessembedSDK
    const chatId = this.getters['chat/chatId'] as string

    await messembedSdk.createMessage({
      chatId,
      content: messageContent,
    })
  },
  ensureUpdatingInterval({ state, commit }) {
    this.dispatch('initMessembedSdk')
    const messembedSdk = this.getters.messembedSdk as MessembedSDK

    if (state.updatingInterval) {
      return
    }

    if (!state.lastUpdateDate) {
      const chats: PersonalChat[] = this.getters['chat/chats']
      const createdAt: Date = _.maxBy(chats, 'lastMessage.createdAt')
        ?.lastMessage.createdAt
      commit('SET_LAST_UPDATE_DATE', createdAt)
    }

    const updatingInterval = setInterval(async () => {
      const lastUpdateDate = this.getters['chat/lastUpdateDate']
      const updates = await messembedSdk.getUpdates(lastUpdateDate)

      if (!_.isEmpty(updates)) {
        commit('SET_LAST_UPDATE_DATE', _.last(updates)?.createdAt)
        updates.forEach((update) => {
          if (update.type === 'new_message') {
            commit('PUSH_UPDATE_ABOUT_NEW_MESSAGE', update)
          }
        })
      }
    }, 1000)

    commit('SET_UPDATING_INTERVAL', updatingInterval)
  },
  mergeUnreadMessages({ commit }) {
    commit('MERGE_UNREAD_MESSAGES')
  },
}
