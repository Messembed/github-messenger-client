<template>
  <div>
    <div>{{ backendAccessToken }}</div>
    <div>{{ messembedAccessToken }}</div>
    <dir>
      <button @click="signinViaGitHub">Sign In via GitHub</button>
    </dir>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import jsCookie from 'js-cookie'

export default Vue.extend({
  data: () => ({
    backendAccessToken: undefined as string | void,
    messembedAccessToken: undefined as string | void,
  }),
  mounted() {
    this.backendAccessToken = jsCookie.get('backendAccessToken')
    this.messembedAccessToken = jsCookie.get('messembedAccessToken')
  },
  methods: {
    signinViaGitHub() {
      window.location.href =
        process.env.GITHUB_MESSENGER_BACKEND_URL + '/oauth/github'
    },
  },
})
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
