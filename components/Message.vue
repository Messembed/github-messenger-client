<template>
  <div class="message-container">
    <div class="message" :style="{ float: message.fromMe ? 'right' : 'left' }">
      <div class="content">
        {{ message.content }}
      </div>
      <div class="date">
        {{ formatMessageDate(message.createdAt) }}
      </div>
    </div>
    <div style="clear: both"></div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'

export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },

  methods: {
    formatMessageDate(message: any): string {
      const date = moment(message.createdAt)
      const createdToday = date.isSame(new Date(), 'day')
      if (createdToday) {
        return date.format('HH:mm')
      }

      return date.calendar()
    },
  },
}
</script>

<style lang="sass" scoped>
.message-container
  margin-top: 10px
  clear: both
  .message
    padding: 15px
    background: #161b22
    border-radius: 6px
    color: #c9d1d9
    max-width: 300px

    .date
      font-size: 15px
      text-align: right
      color: #c9d1d9
      opacity: 0.5
</style>
