<template>
  <nuxt-link class="chat-item_nuxt-link" :to="'/app/' + companionUsername">
    <div class="chat-item">
      <table class="chat-table">
        <tbody>
          <tr>
            <td class="avatar-cell">
              <div style="width: 48px; height: 48px">
                <img :src="avatar" class="avatar" />
              </div>
            </td>

            <td>
              <table class="chat-info-table">
                <tbody>
                  <tr class="name-row">
                    <td class="name-cell">
                      {{ companionName }}
                    </td>
                  </tr>
                  <tr class="messages-row">
                    <td class="last-msg-content-cell">
                      <div class="last-msg-content">
                        {{ lastMessage }}
                      </div>
                    </td>
                    <td class="unread-msg-count-cell">
                      <span v-if="chat && chat.unreadMessagesCount !== 0">
                        {{ chat && chat.unreadMessagesCount }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </nuxt-link>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  props: {
    chatId: {
      type: String,
      required: false,
      default: null,
    },
    user: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    chat() {
      if (!this.chatId) {
        return null
      }
      const chat = this.$store.getters['chat/chats'].find(
        (chat) => chat._id === this.chatId
      )
      return chat
    },
    companionUsername() {
      if (this.user) {
        return this.user.login
      } else if (this.chat) {
        return this.chat.companion.externalMetadata.username
      }
      return null
    },
    avatar() {
      if (this.user) {
        return this.user.avatar_url
      } else if (this.chat) {
        return this.chat.companion.externalMetadata.avatar
      }

      return null
    },
    lastMessage() {
      if (this.user) {
        return ''
      } else if (this.chat) {
        return this.chat.lastMessage && this.chat.lastMessage.content
      }
      return null
    },
    companionName() {
      if (this.user) {
        return this.user.name || this.user.login
      } else if (this.chat) {
        return (
          this.chat.companion.externalMetadata.name ||
          this.chat.companion.externalMetadata.username
        )
      }
      return null
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

.chat-item_nuxt-link
  text-decoration: none

.chat-item
  height: 81px
  color: #c9d1d9
  cursor: pointer

  .chat-table
    width: 100%
    height: 100%

    .avatar-cell
      width: 81px
      padding-left: 16.5px
      padding-right: 16.5px

      .avatar
        height: 48px
        border-radius: 50%

    .chat-info-table
      width: 100%

      .name-row
        width: 100%

        .name-cell
          padding-top: 16.5px

      .messages-row
        .last-msg-content-cell
          padding-bottom: 16.5px
          max-width: 0
          width: 100%

          .last-msg-content
            color: #8b949e
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap


        .unread-msg-count-cell
          padding-bottom: 16.5px
          padding-right: 10px

          span
            display: inline-block
            background-color: #21262d
            min-width: 30px
            padding: 2px
            height: 20px
            border-radius: 10px
            text-align: center

.chat-item:hover
  background-color: #1a2027
</style>
