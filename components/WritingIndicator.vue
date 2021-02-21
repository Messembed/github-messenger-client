<template>
  <div class="writing-indicator">
    <div class="text">writing</div>
    <div class="dots">
      <div class="dot first"></div>
      <div class="dot second"></div>
      <div class="dot third"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({})
</script>

<style lang="scss" scoped>
@keyframes flickerAnimation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.writing-indicator {
  color: #8b949e;

  .text {
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
      sans-serif, Apple Color Emoji, Segoe UI Emoji;
  }

  .dots {
    display: inline-block;

    .dot {
      display: inline-block;
      height: 6px;
      width: 6px;
      border-radius: 50%;
      background-color: #8b949e;
      transition: opacity 0.5s;

      &.first {
        animation: flickerAnimation 1s infinite;
      }

      &.second {
        animation: flickerAnimation 1s infinite;
        animation-delay: 0.1s;
      }

      &.third {
        animation: flickerAnimation 1s infinite;
        animation-delay: 0.2s;
      }
    }
  }
}
</style>
