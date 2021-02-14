<template>
  <div class="chat-item">
    <table class="chat-table">
      <tbody>
        <tr>
          <td class="avatar-cell">
            <div style="width: 48px; height: 48px">
              <img
                :src="chat && chat.companion.externalMetadata.avatar"
                class="avatar"
              />
            </div>
          </td>

          <td>
            <table class="chat-info-table">
              <tbody>
                <tr class="name-row">
                  <td class="name-cell">
                    {{
                      chat &&
                      (chat.companion.externalMetadata.name ||
                        chat.companion.externalMetadata.username)
                    }}
                  </td>
                </tr>
                <tr class="messages-row">
                  <td class="last-msg-content-cell">
                    <div class="last-msg-content">
                      {{ chat && chat.lastMessage && chat.lastMessage.content }}
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
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  props: {
    chatId: {
      type: String,
      required: true,
    },
  },

  computed: {
    chat() {
      const chat = this.$store.getters['chat/chats'].find(
        (chat) => chat._id === this.chatId
      )
      console.log(chat)
      return chat
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
