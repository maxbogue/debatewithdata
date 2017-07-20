<template>
<div class="comments">
  <template v-if="loaded">
    <ul>
      <li v-for="comment in comments"><strong>{{ comment.author }}</strong>: {{ comment.text }}</li>
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

export default {
  props: ['url'],
  computed: {
    commentsUrl: function () {
      return this.url + '/comments';
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
  margin-bottom: 4px;
}
.comments textarea {
  padding: 2px 0.5em;
}
</style>
