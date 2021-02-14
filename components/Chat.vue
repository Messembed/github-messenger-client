<template>
  <div class="chat">
    <div class="header">
      <table class="header-table">
        <tbody>
          <tr>
            <td class="companion-name-cell">
              {{
                chat &&
                (chat.companion.externalMetadata.name ||
                  chat.companion.externalMetadata.username)
              }}
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
                <div>
                  No messages here yet...<br />
                  Say <b>Hi!</b>
                </div>
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
              v-model="messageInput.content"
              class="message-input form-control input-dark"
              autocapitalize="on"
              size="100"
              type="text"
              autocomplete="off"
              spellcheck="true"
              placeholder="Write a message..."
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
import Message from './Message.vue'

export default Vue.extend({
  components: {
    Message,
  },

  data: () => ({
    scrolledDown: true,
    messageInput: {
      content: '',
    },
  }),
  computed: {
    ...mapGetters({
      chatId: 'chat/chatId',
      messages: 'chat/messages',
      unreadMessages: 'chat/unreadMessages',
      messagesLoaded: 'chat/messagesLoaded',
    }),
    chat() {
      const chat = this.$store.getters['chat/chats'].find(
        (chat: any) => chat._id === this.chatId
      )
      console.log(chat)
      return chat
    },
  },

  watch: {
    async messagesLoaded(newVal: boolean) {
      console.log('messagesLoaded', newVal)
      if (!newVal) {
        return
      }
      await this.$nextTick()

      const messagesScrollable = this.$refs.messagesScrollable as HTMLDivElement
      messagesScrollable.scrollTop = messagesScrollable.scrollHeight
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
      if (!this.messageInput.content) {
        return
      }

      const messageContent = this.messageInput.content

      await this.$store.dispatch('chat/sendMessage', messageContent)

      this.messageInput.content = ''
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
      height: 100%
      width: 100%
      .companion-name-cell
        padding-left: 16.5px
        color: #c9d1d9


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
