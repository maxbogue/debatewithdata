<template>
<div class="comments">
  <template v-if="loaded">
    <ul>
      <li v-for="comment in comments" class="flex-row">
        <div><strong>{{ comment.author }}</strong>: {{ comment.text }}</div>
        <div class="timestamp">{{ comment.created | timestamp }}</div>
        <div v-if="user && comment.author === user.username"
              class="delete click glyphicon glyphicon-trash"
              aria-hidden="true"
              @click="deleteComment(comment.id)"></div>
      </li>
      <li v-if="comments.length === 0">No comments.</li>
    </ul>
    <textarea v-if="$store.state.user"
              rows="1"
              autocomplete="off"
              placeholder="new comment"
              @keydown.enter.prevent=""
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
  props: ['url'],
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
      axios.delete(this.commentsUrl + '/' + id).then((response) => {
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
      } else {
        return dateFormat(date, 'yyyy-mm-dd');
      }
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

<style>
.comments {
	padding: 16px;
	background-color: #eee;
	border-radius: 5px;
	border: 1px solid #ddd;
}
.comments ul {
  margin: 0;
  padding: 0 0.5em;
}
.comments li {
  list-style: none;
}
.comments li:not(:first-child) {
  margin-top: 4px;
}
.comments li :first-child {
  flex: 1;
}
.comments li :not(:first-child) {
  margin-left: 8px;
}
.comments textarea {
  padding: 2px 0.5em;
}
.comments li:not(:hover) .delete {
  display: none;
}
.timestamp {
  color: #aaa;
}
</style>
