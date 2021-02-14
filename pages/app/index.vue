<template>
  <div class="container-fluid">
    <div class="row" style="height: 100vh">
      <sidebar class="col-3 p-0" />
      <div class="col-9 p-0 maincontent">
        <chat />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Chat from '~/components/Chat.vue'
// import { MessembedSDK } from 'messembed-sdk'

export default Vue.extend({
  components: {
    Sidebar,
    Chat,
  },
  data: () => ({
    accessToken: undefined as string | undefined,
    personalChats: null as null | object[],
    currentUser: null as null | object,
  }),
  mounted() {},
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
