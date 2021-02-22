<template>
  <div class="container-fluid">
    <div class="row" style="height: 100vh">
      <sidebar class="col-3 p-0" />
      <div class="col-9 p-0 maincontent">
        <nuxt-child />
      </div>
    </div>
    <audio id="notification-audio" src="~assets/notification.mp3" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { User, PersonalChat } from 'messembed-sdk'
import Sidebar from '~/components/Sidebar.vue'

export default Vue.extend({
  components: {
    Sidebar,
  },
  computed: {
    ...mapGetters({
      chats: 'chat/chats',
      overallUnreadMessagesSum: 'chat/overallUnreadMessagesSum',
    }),
  },
  data: () => ({
    title: 'GitHub Messenger',
  }),
  watch: {
    async $route() {
      await this.openChat()
    },
  },
  async mounted() {
    await this.$store.dispatch('chat/fetchChats')
    await this.openChat()
  },
  methods: {
    async openChat() {
      if (this.$route.params.username) {
        const foundChat = this.chats.find(
          (chat: PersonalChat) =>
            chat.companion.externalMetadata.username ===
            this.$route.params.username
        )

        if (!foundChat) {
          const messembedUser: User = await this.$store.dispatch(
            'search/ensureGithubUserIntegrity',
            {
              githubUsername: this.$route.params.username,
            }
          )

          await this.$store.dispatch('chat/openDryChat', messembedUser._id)
          console.log('messembedUser', messembedUser)
          console.log(
            'messembedUser.externalMetadata',
            messembedUser.externalMetadata
          )
          this.title =
            (messembedUser.externalMetadata?.name ||
              messembedUser.externalMetadata?.username ||
              '') + ' - GitHub Messenger'
          return
        }

        this.$store.dispatch('chat/openChat', foundChat._id)
        this.title =
          (foundChat.companion.externalMetadata.name ||
            foundChat.companion.externalMetadata.username ||
            '') + ' - GitHub Messenger'
      }
    },
  },
  head() {
    return {
      title: this.overallUnreadMessagesSum
        ? '(' + this.overallUnreadMessagesSum + ') ' + this.title
        : this.title,
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
