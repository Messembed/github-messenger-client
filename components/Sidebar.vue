<template>
  <div class="sidebar">
    <div class="search">
      <div class="container-fluid">
        <div class="row">
          <div class="col">
            <input
              v-model="searchInput"
              class="search-input form-control input-dark"
              autocapitalize="on"
              type="text"
              autocomplete="off"
              spellcheck="true"
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="chat-list">
      <div v-if="searchMode">
        <chat-item
          v-for="(user, i) in searchResultingUsers"
          :key="i"
          :user="user"
        />
      </div>
      <div v-else>
        <chat-item v-for="(chat, i) in chats" :key="i" :chat-id="chat._id" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import ChatItem from '~/components/ChatItem.vue'

export default Vue.extend({
  components: {
    ChatItem,
  },
  data: () => ({
    searchInput: '',
    debouncedSearch: () => null as any,
  }),
  computed: {
    ...mapGetters({
      chats: 'chat/chats',
      searchMode: 'search/searchMode',
      searchResultingUsers: 'search/users',
    }),
  },
  watch: {
    searchInput() {
      if (this.searchInput) {
        this.debouncedSearch()
      } else {
        this.$store.dispatch('search/turnOffSearchMode')
      }
    },
  },
  created() {
    this.debouncedSearch = _.debounce(() => {
      // if the search mode is still turned on
      if (this.searchInput) {
        this.search()
      }
    }, 500)
  },
  methods: {
    search() {
      this.$store.dispatch('search/searchUsers', this.searchInput)
    },
  },
})
</script>

<style lang="sass" scoped>
.sidebar
  background-color: #161b22
  box-shadow: rgb(33, 38, 45) -1px 0px 0px 0px inset
  height: 100%

  .search
    height: 62px
    padding-top: 15px
    padding-bottom: 15px
    box-shadow: rgb(33, 38, 45) 0px -1px 0px 0px inset

    .search-input
      width: 100%

  .chat-list
    height: calc(100% - 62px)
    overflow-y: auto

    &::-webkit-scrollbar
      width: 10px

    &::-webkit-scrollbar-thumb
      background: #1b2129
      border-radius: 5px
      transition: 0.2s

    &::-webkit-scrollbar-thumb:hover
      background: #1e252e
</style>
