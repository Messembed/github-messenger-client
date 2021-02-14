<template>
  <div class="container-fluid">
    <div class="row" style="height: 100vh">
      <sidebar class="col-3 p-0" />
      <div class="col-9 p-0 maincontent">
        <nuxt-child />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import Sidebar from '~/components/Sidebar.vue'
// import Chat from '~/components/Chat.vue'
import { PersonalChat } from '~/../messembed-sdk/dist'
// import { MessembedSDK } from 'messembed-sdk'

export default Vue.extend({
  components: {
    Sidebar,
    // Chat,
  },
  data: () => ({
    accessToken: undefined as string | undefined,
    personalChats: null as null | object[],
    currentUser: null as null | object,
  }),
  computed: {
    ...mapGetters({
      currentOpenedChatId: 'chat/chatId',
      chats: 'chat/chats',
    }),
  },
  watch: {
    $route() {
      if (this.$route.params.username) {
        const foundChat = this.chats.find(
          (chat: PersonalChat) =>
            chat.companion.externalMetadata.username ===
            this.$route.params.username
        )

        if (!foundChat) {
          // TODO show NOT FOUND error
          return
        }

        this.$store.dispatch('chat/openChat', foundChat._id)
      }
    },
  },
  async mounted() {
    await this.$store.dispatch('chat/fetchChats')
    if (this.$route.params.username) {
      const foundChat = this.chats.find(
        (chat: PersonalChat) =>
          chat.companion.externalMetadata.username ===
          this.$route.params.username
      )

      if (!foundChat) {
        // TODO show NOT FOUND error
        return
      }

      this.$store.dispatch('chat/openChat', foundChat._id)
    }
  },
})
</script>

<style>
html,
body {
  height: 100%;
}

.maincontent {
  background-color: #0d1117;
}
</style>
