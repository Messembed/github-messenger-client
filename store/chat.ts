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

interface PersonalChatWithAdditionalInfo {
  chatId: string
  writing: boolean
  clearWritingTimeout?: any
}

export const state = () => ({
  chatOpened: false,
  isDryChat: false,
  dryChatCompanion: null as User | null,
  chatId: null as string | null,
  messages: [] as Message[],
  unreadMessages: [] as Message[],
  messagesLoaded: false,
  chats: [] as PersonalChat[],
  chatsWithAdditionalInfo: {} as {
    [chatId: string]: PersonalChatWithAdditionalInfo
  },
})

export type AnotherModuleState = ReturnType<typeof state>

export const getters: GetterTree<AnotherModuleState, RootState> = {
  chats: (state) => state.chats,
  chatsWithAdditionalInfo: (state) => state.chatsWithAdditionalInfo,
  isDryChat: (state) => state.isDryChat,
  dryChatCompanion: (state) => state.dryChatCompanion,
  chatId: (state) => state.chatId,
  messages: (state) => state.messages,
  unreadMessages: (state) => state.unreadMessages,
  messagesLoaded: (state) => state.messagesLoaded,
}

export const mutations: MutationTree<AnotherModuleState> = {
  SET_CHATS: (state, chats: PersonalChat[]) => {
    state.chats = chats
    state.chatsWithAdditionalInfo = chats.reduce(
      (acc, chat) => ({
        ...acc,
        [chat._id]: { chatId: chat._id, writing: false },
      }),
      {}
    )
  },
  MARK_CHAT_AS_OPENED: (state) => (state.chatOpened = true),
  SET_CHAT_ID: (state, chatId: string) => (state.chatId = chatId),
  SET_MESSAGES: (state, messages: Message[]) => (state.messages = messages),
  PUSH_UPDATE_ABOUT_NEW_MESSAGE: (state, update: Update) => {
    const chat = state.chats.find((chat) => chat._id === update.chatId)
    if (chat) {
      // TODO: fix the sdk
      chat.lastMessage = update.message!
      _.pull(state.chats, chat)
      state.chats.unshift(chat)

      // @ts-ignore
      if (state.chatId === chat._id || !update.message!.fromMe) {
        if (state.chatsWithAdditionalInfo[chat._id]) {
          // drop the writing indicator if new message is received
          state.chatsWithAdditionalInfo[chat._id].writing = false
        }
        if (state.chatId === chat._id) {
          state.unreadMessages.push(update.message!)
          chat.unreadMessagesCount = 0

          // @ts-ignore
        } else if (!update.message!.fromMe) {
          chat.unreadMessagesCount++
        }
      }
    }
  },
  ADD_NEW_CHAT: (state, chat: PersonalChat) => {
    const existingChat = state.chats.find((_chat) => _chat._id === chat._id)
    if (existingChat) {
      return
    }

    state.chats.unshift(chat)
    state.chatsWithAdditionalInfo[chat._id] = {
      chatId: chat._id,
      writing: false,
    }
  },
  SET_CHAT_UNREAD_COUNT: (
    state,
    payload: { chatId: string; unreadMessagesCount: number }
  ) => {
    const chat = state.chats.find((_chat) => _chat._id === payload.chatId)
    if (!chat) {
      return
    }

    chat.unreadMessagesCount = payload.unreadMessagesCount
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
  SET_WRITING: (
    state,
    params: { chatId: string; writing: boolean; clearWritingTimeout: any }
  ) => {
    state.chatsWithAdditionalInfo[params.chatId].writing = params.writing
    state.chatsWithAdditionalInfo[params.chatId].clearWritingTimeout =
      params.clearWritingTimeout
  },
}

export const actions: ActionTree<AnotherModuleState, RootState> = {
  async fetchChats({ commit }) {
    this.dispatch('initMessembedSdk')

    const personalChats = await (this.getters
      .messembedSdk as MessembedSDK).getPersonalChats()

    commit('SET_CHATS', personalChats)
    this.dispatch('chat/ensureWebSocketConnection')
  },
  async openChat({ commit }, chatId: string) {
    commit('MARK_MESSAGES_LOADED', false)
    commit('SET_IS_DRY_CHAT', false)
    commit('SET_DRY_CHAT_COMPANION', null)

    this.dispatch('initMessembedSdk')
    const messembedSdk: MessembedSDK = await (this.getters
      .messembedSdk as MessembedSDK)

    const messasgesResult = await messembedSdk.findMessages({ chatId })

    commit('SET_CHAT_ID', chatId)
    commit('MARK_CHAT_AS_OPENED')
    commit('SET_MESSAGES', messasgesResult.messages)
    commit('MARK_MESSAGES_LOADED', true)
    commit('SET_CHAT_UNREAD_COUNT', { chatId, unreadMessagesCount: 0 })
    await messembedSdk.readChat(chatId)
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
  ensureWebSocketConnection({ state, commit }) {
    this.dispatch('initMessembedSdk')
    const messembedSdk = this.getters.messembedSdk as MessembedSDK

    if (socket) {
      return
    }

    const messembedAccessToken = jsCookie.get('messembedAccessToken')
    const messembedUrl = new URL(process.env.MESSEMBED_URL!)

    socket = io(messembedUrl.origin, {
      path:
        messembedUrl.pathname === '/'
          ? '/socket.io'
          : messembedUrl.pathname + '/socket.io',
      query: {
        token: messembedAccessToken!,
      },
    })

    socket.on('connect', () => {
      console.log('Socket connected', socket)
    })

    socket.on('new_update', (update: Update) => {
      if (update.type === 'new_message') {
        // when new message comes then mark the whole chat as read
        // so new message will be marked as read
        if (update.chatId === state.chatId) {
          messembedSdk.readChat(update.chatId)
        }
        commit('PUSH_UPDATE_ABOUT_NEW_MESSAGE', update)
      } else if (update.type === 'new_chat') {
        commit('ADD_NEW_CHAT', update.chat)
      }
    })

    socket.on('writing', (writing: { chatId: string }) => {
      if (state.chatsWithAdditionalInfo[writing.chatId].clearWritingTimeout) {
        clearTimeout(
          state.chatsWithAdditionalInfo[writing.chatId].clearWritingTimeout
        )
      }

      const clearWritingTimeout = setTimeout(() => {
        commit('SET_WRITING', { chatId: writing.chatId, writing: false })
      }, 1500)

      commit('SET_WRITING', {
        chatId: writing.chatId,
        writing: true,
        clearWritingTimeout,
      })
    })
  },
  sendWritingIndicator({ state }) {
    socket?.emit('send_writing', { chatId: state.chatId })
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
