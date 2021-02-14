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
