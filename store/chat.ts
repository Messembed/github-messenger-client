import { GetterTree, ActionTree, MutationTree } from 'vuex'
import {
  Message,
  MessembedSDK,
  PersonalChat,
  Update,
  User,
} from 'messembed-sdk'
import _ from 'lodash'
import io, { Socket } from 'socket.io-client'
import jsCookie from 'js-cookie'
import { RootState } from '~/store'

let socket: typeof Socket | null = null

export const state = () => ({
  chatOpened: false,
  isDryChat: false,
  dryChatCompanion: null as User | null,
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
  isDryChat: (state) => state.isDryChat,
  dryChatCompanion: (state) => state.dryChatCompanion,
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
        chat.unreadMessagesCount = 0
        // @ts-ignore
      } else if (!update.message!.fromMe) {
        chat.unreadMessagesCount++
      }
    }
  },
  ADD_NEW_CHAT: (state, chat) => {
    const existingChat = state.chats.find((_chat) => _chat._id === chat._id)
    if (existingChat) {
      return
    }

    state.chats.unshift(chat)
  },
  MERGE_UNREAD_MESSAGES: (state) => {
    state.messages.push(...state.unreadMessages)
    state.unreadMessages = []
  },
  MARK_MESSAGES_LOADED: (state, value: boolean) =>
    (state.messagesLoaded = value),
  SET_IS_DRY_CHAT: (state, isDryChat: boolean) => (state.isDryChat = isDryChat),
  SET_DRY_CHAT_COMPANION: (state, dryChatCompanion: User) =>
    (state.dryChatCompanion = dryChatCompanion),
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
    commit('SET_IS_DRY_CHAT', false)
    commit('SET_DRY_CHAT_COMPANION', null)

    this.dispatch('initMessembedSdk')

    const messasgesResult = await (this.getters
      .messembedSdk as MessembedSDK).findMessages({ chatId })

    commit('SET_CHAT_ID', chatId)
    commit('MARK_CHAT_AS_OPENED')
    commit('SET_MESSAGES', messasgesResult.messages)
    commit('MARK_MESSAGES_LOADED', true)
  },
  async sendMessage({ commit }, messageContent: string): Promise<void> {
    this.dispatch('initMessembedSdk')
    const messembedSdk = this.getters.messembedSdk as MessembedSDK

    if (this.getters['chat/isDryChat']) {
      const dryChatCompanion = this.getters['chat/dryChatCompanion']
      const chat = await messembedSdk.createChat(dryChatCompanion._id)

      commit('ADD_NEW_CHAT', chat)
      commit('SET_CHAT_ID', chat._id)
      commit('SET_IS_DRY_CHAT', false)
      commit('SET_DRY_CHAT_COMPANION', null)
    }

    const chatId = this.getters['chat/chatId'] as string

    socket!.emit('send_message', {
      content: messageContent,
      chatId,
    })
  },
  ensureUpdatingInterval({ commit }) {
    this.dispatch('initMessembedSdk')

    if (socket) {
      return
    }

    const messembedAccessToken = jsCookie.get('messembedAccessToken')
    socket = io('ws://localhost:3000', {
      query: {
        token: messembedAccessToken!,
      },
    })

    socket.on('connect', () => {
      console.log('Socket connected', socket)
    })

    socket.on('new_update', (update: Update) => {
      if (update.type === 'new_message') {
        commit('PUSH_UPDATE_ABOUT_NEW_MESSAGE', update)
      } else if (update.type === 'new_chat') {
        commit('ADD_NEW_CHAT', update.chat)
      }
    })
  },
  mergeUnreadMessages({ commit }) {
    commit('MERGE_UNREAD_MESSAGES')
  },
  async openDryChat({ commit }, messembedUserId: string) {
    commit('MARK_MESSAGES_LOADED', false)
    this.dispatch('initMessembedSdk')
    const messembedSdk = this.getters.messembedSdk as MessembedSDK

    const companion = await messembedSdk.getUser(messembedUserId)

    commit('SET_MESSAGES', [])
    commit('SET_IS_DRY_CHAT', true)
    commit('SET_DRY_CHAT_COMPANION', companion)
    commit('MARK_CHAT_AS_OPENED')
    commit('MARK_MESSAGES_LOADED', true)
  },
}
