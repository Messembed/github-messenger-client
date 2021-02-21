<template>
  <div class="chat">
    <div class="header">
      <table class="header-table">
        <tbody>
          <tr class="name-row">
            <td class="companion-name-cell">
              {{
                isDryChat
                  ? (dryChatCompanion &&
                      dryChatCompanion.externalMetadata.name) ||
                    dryChatCompanion.externalMetadata.username
                  : chat &&
                    (chat.companion.externalMetadata.name ||
                      chat.companion.externalMetadata.username)
              }}
            </td>
          </tr>
          <tr class="info-row">
            <td class="info-cell">
              <WritingIndicator v-if="companionIsWriting" />
              <div v-else-if="chatId">last seen recently</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="messages-container">
      <div v-if="messages && messages.length === 0" class="messages-empty-hero">
        <table class="messages-empty-hero-content">
          <tbody>
            <tr>
              <td>
                <div class="octocat-image"></div>
              </td>
              <td>
                <div v-if="messagesLoaded">
                  No messages here yet...<br />
                  Say <b>Hi!</b>
                </div>
                <div v-else>Choose who do you would want to DM</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        ref="messagesScrollable"
        class="messages-bottom-sticker"
        @scroll="scrollHandler"
      >
        <message
          v-for="message in messages"
          :key="message._id"
          :message="message"
        />
        <message
          v-for="message in unreadMessages"
          :key="message._id"
          :message="message"
        />
      </div>
    </div>
    <div class="message-input-row">
      <div class="container-fluid">
        <div class="row">
          <div class="col message-input-col">
            <input
              ref="messageInputElem"
              v-model="messageInput.content"
              class="message-input form-control input-dark"
              autocapitalize="on"
              size="100"
              type="text"
              autocomplete="off"
              spellcheck="true"
              placeholder="Write a message..."
              @keyup.enter="sendMessage"
            />
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary" @click="sendMessage">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { Chat } from 'messembed-sdk'
import Message from './Message.vue'
import WritingIndicator from './WritingIndicator.vue'

export default Vue.extend({
  components: {
    Message,
    WritingIndicator,
  },

  data: () => ({
    scrolledDown: true,
    messageInput: {
      content: '',
    },
    throttledSendWritingIndicator: (() => undefined) as _.DebouncedFunc<
      () => void
    >,
  }),
  computed: {
    ...mapGetters({
      chatId: 'chat/chatId',
      messages: 'chat/messages',
      unreadMessages: 'chat/unreadMessages',
      messagesLoaded: 'chat/messagesLoaded',
      isDryChat: 'chat/isDryChat',
      dryChatCompanion: 'chat/dryChatCompanion',
      chatsWithAdditionalInfo: 'chat/chatsWithAdditionalInfo',
    }),
    chat() {
      if (this.isDryChat) {
        return null
      }
      const chat = this.$store.getters['chat/chats'].find(
        (chat: Chat) => chat._id === this.chatId
      )
      return chat
    },
    companionIsWriting(): boolean {
      if (!this.chatId) {
        return false
      }
      const currentChatWithAdditionalInfo = this.chatsWithAdditionalInfo[
        this.chatId
      ]
      if (!currentChatWithAdditionalInfo) {
        return false
      }

      return currentChatWithAdditionalInfo.writing
    },
    messageInputElem(): HTMLInputElement {
      return this.$refs.messageInputElem as HTMLInputElement
    },
  },

  watch: {
    'messageInput.content'() {
      this.throttledSendWritingIndicator()
    },

    async messagesLoaded(newVal: boolean) {
      if (!newVal) {
        return
      }
      await this.$nextTick()

      const messagesScrollable = this.$refs.messagesScrollable as HTMLDivElement
      messagesScrollable.scrollTop = messagesScrollable.scrollHeight
      ;(this.messageInputElem as HTMLInputElement).focus()
    },

    async unreadMessages(newVal) {
      if (!newVal || !newVal.length) {
        return
      }

      if (this.scrolledDown) {
        this.$store.dispatch('chat/mergeUnreadMessages')
        await this.$nextTick()
        const messagesScrollable = this.$refs
          .messagesScrollable as HTMLDivElement
        messagesScrollable.scrollTop = messagesScrollable.scrollHeight
      }
    },
  },

  created() {
    this.throttledSendWritingIndicator = _.throttle(() => {
      if (!this.messageInput.content) {
        return
      }
      ;(this as any).sendWritingIndicator()
    }, 1000)
  },

  methods: {
    scrollHandler() {
      const messagesScrollable = this.$refs.messagesScrollable as HTMLDivElement
      if (
        messagesScrollable.scrollTop + messagesScrollable.offsetHeight ===
        messagesScrollable.scrollHeight
      ) {
        this.scrolledDown = true
      } else {
        this.scrolledDown = false
      }
    },
    async sendMessage() {
      if (!this.messageInput.content || (!this.chatId && !this.isDryChat)) {
        return
      }

      const messageContent = this.messageInput.content

      // cancel any pending "send writing indicator" function
      // before sending the actual message
      this.throttledSendWritingIndicator.cancel()
      await this.$store.dispatch('chat/sendMessage', messageContent)

      this.messageInput.content = ''
    },

    async sendWritingIndicator(): Promise<void> {
      await this.$store.dispatch('chat/sendWritingIndicator')
    },
  },
})
</script>
<style lang="sass" scoped>
table, caption, tbody, tfoot, thead, tr, th, td
  margin: 0
  padding: 0
  border: 0
  outline: 0
  font-size: 100%
  background: transparent
  border-collapse: collapse

.chat
  height: 100%
  position: relative

  .header
    height: 62px
    width: 100%
    top: 0
    position: absolute
    background-color: #161b22
    box-shadow: rgb(33, 38, 45) 0px -1px 0px 0px inset

    .header-table
      height: 62px
      width: 100%
      td
        padding-left: 16.5px

      .name-row
        height: 35px
        color: #c9d1d9

        .companion-name-cell
          padding-top: 13px

      .info-row
        height: 27px

        .info-cell
          padding-bottom: 10px
          font-size: 15px
          color: #8b949e


  .messages-container
    position: absolute
    top: 62px
    left: 0
    width: 100%
    height: calc(100% - 62px - 62px)

    .messages-bottom-sticker
      max-height: 100%
      overflow: auto
      padding-bottom: 15px
      padding-left: 15px
      padding-right: 15px
      position: absolute
      width: 100%
      bottom: 0

      &::-webkit-scrollbar
        width: 10px

      &::-webkit-scrollbar-thumb
        background: #1b2129
        border-radius: 5px
        transition: 0.2s

      &::-webkit-scrollbar-thumb:hover
        background: #1e252e

    .messages-empty-hero
      height: 100%
      width: 100%
      position: relative

      .messages-empty-hero-content
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)
        color: #c9d1d9
        font-size: 30px

        .octocat-image
          width: 200px
          height: 200px
          background-size: contain
          background-position: center
          background-repeat: no-repeat
          background-image: url(~assets/octocat.png)

  .message-input-row
    padding-top: 15px
    padding-bottom: 15px
    position: absolute
    width: 100%
    bottom: 0
    background-color: #161b22

    .message-input
      width: 100%
</style>
