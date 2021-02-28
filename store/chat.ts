import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { Message, PersonalChat, User } from 'messembed-sdk'
import _ from 'lodash'
import { RootState } from '~/store'

interface PersonalChatWithAdditionalInfo {
  chatId: string
  writing: boolean
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
  overallUnreadMessagesSum: (state) =>
    _.sumBy(state.chats, (chat) => chat.unreadMessagesCount),
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
  SET_CHAT_ID: (state, chatId: string | null) => (state.chatId = chatId),
  SET_MESSAGES: (state, messages: Message[]) => (state.messages = messages),
  PUSH_UPDATE_ABOUT_NEW_MESSAGE: (state, message: Message) => {
    const chat = state.chats.find((chat) => chat._id === message.chat)
    if (chat) {
      // TODO: fix the sdk
      chat.lastMessage = message!
      _.pull(state.chats, chat)
      state.chats.unshift(chat)

      // @ts-ignore
      if (state.chatId === chat._id || !message!.fromMe) {
        if (state.chatsWithAdditionalInfo[chat._id]) {
          // drop the writing indicator if new message is received
          state.chatsWithAdditionalInfo[chat._id].writing = false
        }
        if (state.chatId === chat._id) {
          state.unreadMessages.push(message!)
          chat.unreadMessagesCount = 0

          // @ts-ignore
        } else if (!message!.fromMe) {
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
  SET_WRITING: (state, params: { chatId: string; writing: boolean }) => {
    state.chatsWithAdditionalInfo[params.chatId].writing = params.writing
  },
}

export const actions: ActionTree<AnotherModuleState, RootState> = {
  async fetchChats({ commit }) {
    const personalChats = await this.$messembed.sdk?.getPersonalChats()

    commit('SET_CHATS', personalChats)
    this.dispatch('chat/ensureWebSocketConnection')
  },
  async openChat({ commit }, chatId: string) {
    commit('MARK_MESSAGES_LOADED', false)
    commit('SET_IS_DRY_CHAT', false)
    commit('SET_DRY_CHAT_COMPANION', null)

    const messagesResult = await this.$messembed.sdk?.findMessages({ chatId })

    commit('SET_CHAT_ID', chatId)
    commit('MARK_CHAT_AS_OPENED')
    commit('SET_MESSAGES', messagesResult?.messages)
    commit('MARK_MESSAGES_LOADED', true)
    commit('SET_CHAT_UNREAD_COUNT', { chatId, unreadMessagesCount: 0 })
    await this.$messembed.sdk?.readChat(chatId)
  },
  async sendMessage({ commit }, messageContent: string): Promise<void> {
    if (this.getters['chat/isDryChat']) {
      const dryChatCompanion = this.getters['chat/dryChatCompanion']
      const chat = await this.$messembed.sdk?.createChat(dryChatCompanion._id)

      commit('ADD_NEW_CHAT', chat)
      commit('SET_CHAT_ID', chat?._id)
      commit('SET_IS_DRY_CHAT', false)
      commit('SET_DRY_CHAT_COMPANION', null)
    }

    const chatId = this.getters['chat/chatId'] as string

    await this.$messembed.sdk?.sendMessageOverWS({
      content: messageContent,
      chatId,
    })
  },
  ensureWebSocketConnection({ state, commit }) {
    this.$messembed.sdk
      ?.onNewMessage((message) => {
        // when new message comes then mark the whole chat as read
        // so new message will be marked as read
        if (message.chat === state.chatId) {
          // do not await
          this.$messembed.sdk?.readChat(message.chat)
        }

        commit('PUSH_UPDATE_ABOUT_NEW_MESSAGE', message)

        if (!message?.fromMe) {
          this.dispatch('notifications/playNotificationSound')
        }
      })
      ?.onNewChat((chat) => {
        commit('ADD_NEW_CHAT', chat)
      })
      ?.onWriting((chatId) => {
        commit('SET_WRITING', {
          chatId,
          writing: true,
        })
      })
      ?.onWritingEnd((chatId) => {
        commit('SET_WRITING', { chatId, writing: false })
      })
  },
  sendWritingIndicator({ state }) {
    this.$messembed.sdk?.sendWritingIndicator(state.chatId!)
  },
  mergeUnreadMessages({ commit }) {
    commit('MERGE_UNREAD_MESSAGES')
  },
  async openDryChat({ commit }, messembedUserId: string) {
    commit('MARK_MESSAGES_LOADED', false)

    const companion = await this.$messembed.sdk?.getUser(messembedUserId)

    commit('SET_MESSAGES', [])
    commit('SET_CHAT_ID', null)
    commit('SET_IS_DRY_CHAT', true)
    commit('SET_DRY_CHAT_COMPANION', companion)
    commit('MARK_CHAT_AS_OPENED')
    commit('MARK_MESSAGES_LOADED', true)
  },
}
