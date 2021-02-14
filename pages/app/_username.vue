<template>
  <chat />
</template>

<script lang="ts">
import Vue from 'vue'
import Chat from '~/components/Chat.vue'

export default Vue.extend({
  components: {
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
