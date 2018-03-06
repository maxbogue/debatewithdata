<template>
<dwd-drawer :show="show">
  <div :class="$style.comments">
    <template v-if="loaded">
      <ul>
        <li v-for="comment in comments" class="flex-row" :key="comment.id">
          <div><strong>{{ comment.author }}</strong>: {{ comment.text }}</div>
          <div :class="$style.timestamp">{{ comment.created | timestamp }}</div>
          <div v-if="user && comment.author === user.username"
               :class="$style.delete"
               class="click fas fa-trash"
               @click="deleteComment(comment.id)"></div>
        </li>
        <li v-if="comments.length === 0">No comments yet.</li>
      </ul>
      <dwd-input v-if="$store.state.user"
                 v-model="newComment"
                 placeholder="new comment"
                 @keyup.enter.native="submit" />
    </template>
    <div v-else>Loading...</div>
  </div>
</dwd-drawer>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';

import DwdDrawer from './DwdDrawer.vue';
import DwdInput from './DwdInput.vue';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export default {
  components: {
    DwdDrawer,
    DwdInput,
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
  props: {
    url: { type: String, required: true },
    show: { type: Boolean, required: true },
    // Triggers an eager load the first time it flips to true.
    hint: { type: Boolean, default: false },
  },
  data: () => ({
    canLoad: true,
    loaded: false,
    comments: [],
    newComment: '',
  }),
  computed: {
    commentsUrl: function () {
      return this.url + '/comment';
    },
    user: function () {
      return this.$store.state.user;
    },
  },
  watch: {
    // Load the first time hint triggers or when shown after being hidden.
    show: function () {
      if (this.show) {
        this.load();
      } else {
        this.canLoad = true;
      }
    },
    hint: function () {
      if (this.hint && !this.loaded) {
        this.load();
      }
    },
  },
  methods: {
    load: function () {
      if (!this.canLoad) {
        return;
      }
      this.canLoad = false;
      axios.get(this.commentsUrl).then((response) => {
        this.loaded = true;
        this.comments = response.data;
      });
    },
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
};
</script>

<style lang="scss" module>
@import "style/constants";

.comments {
  font-size: 12px;
  padding: 1em;

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    list-style: none;

    &:not(:first-child) {
      margin-top: 4px;
    }

    &:not(:hover) .delete {
      display: none;
    }

    & :first-child {
      flex: 1;
    }

    & :not(:first-child) {
      margin-left: 8px;
    }
  }

  textarea {
    margin-top: 12px;
    padding: 2px 0.5em;
  }
}

.timestamp {
  color: $text-light-accent;
}
</style>
