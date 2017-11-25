<template>
<div :class="$style.comments">
  <template v-if="loaded">
    <ul>
      <li v-for="comment in comments" class="flex-row" :key="comment.id">
        <div><strong>{{ comment.author }}</strong>: {{ comment.text }}</div>
        <div :class="$style.timestamp">{{ comment.created | timestamp }}</div>
        <div v-if="user && comment.author === user.username"
              :class="$style.delete"
              class="click glyphicon glyphicon-trash"
              aria-hidden="true"
              @click="deleteComment(comment.id)"></div>
      </li>
      <li v-if="comments.length === 0">No comments yet.</li>
    </ul>
    <textarea v-if="$store.state.user"
              rows="1"
              autocomplete="off"
              placeholder="new comment"
              @keydown.enter.prevent
              @keyup.enter="submit"
              v-model="newComment"
              v-auto-resize></textarea>
  </template>
  <div v-else>Loading...</div>
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  computed: {
    commentsUrl: function () {
      return this.url + '/comment';
    },
    user: function () {
      return this.$store.state.user;
    },
  },
  data: () => ({
    loaded: false,
    comments: [],
    newComment: '',
  }),
  methods: {
    submit: function () {
      if (!this.newComment) {
        return;
      }

      let payload = {
        text: this.newComment,
      };
      axios.post(this.commentsUrl, payload).then((response) => {
        this.newComment = '';
        this.comments.push(response.data.comment);
      });
    },
    deleteComment: function (id) {
      axios.delete(this.commentsUrl + '/' + id).then(() => {
        let i = this.comments.findIndex((c) => c.id === id);
        if (i >= 0) {
          this.comments.splice(i, 1);
        }
      });
    },
  },
  filters: {
    timestamp: function (seconds) {
      let date = new Date(seconds * 1000);
      if (Date.now() - date < ONE_DAY_MS) {
        return dateFormat(date, 'h:MMtt');
      }
      return dateFormat(date, 'yyyy-mm-dd');
    },
  },
  mounted: function () {
    this.loaded = false;
    axios.get(this.commentsUrl).then((response) => {
      this.loaded = true;
      this.comments = response.data;
    });
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.comments
  font-size: 12px
  padding: 1em

  ul
    margin: 0
    padding: 0

  li
    list-style: none

    &:not(:first-child)
      margin-top: 4px

    &:not(:hover) .delete
      display: none

    & :first-child
      flex: 1

    & :not(:first-child)
      margin-left: 8px

  textarea
    margin-top: 12px
    padding: 2px 0.5em

.timestamp
  color: $text-light-accent
</style>
