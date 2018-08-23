<template>
<dwd-drawer :show="show">
  <div :class="$style.comments">
    <template v-if="loaded">
      <ul>
        <li v-for="comment in comments" class="flex-row" :key="comment.id">
          <div><strong>{{ comment.author }}</strong>: {{ comment.text }}</div>
          <div :class="$style.timestamp"
               >{{ comment.created | shortTimestamp }}</div>
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
import DwdDrawer from './DwdDrawer.vue';
import DwdInput from './DwdInput.vue';

export default {
  components: {
    DwdDrawer,
    DwdInput,
  },
  props: {
    type: { type: String, required: true },
    id: { type: String, required: true },
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
    user() {
      return this.$store.state.user;
    },
  },
  watch: {
    // Load the first time hint triggers or when shown after being hidden.
    show() {
      if (this.show) {
        this.load();
      } else {
        this.canLoad = true;
      }
    },
    hint() {
      if (this.hint && !this.loaded) {
        this.load();
      }
    },
  },
  methods: {
    async load() {
      if (!this.canLoad) {
        return;
      }
      this.canLoad = false;
      this.comments = await this.$store.dispatch('getComments', {
        type: this.type,
        id: this.id,
      });
      this.loaded = true;
    },
    async submit() {
      if (!this.newComment) {
        return;
      }
      const data = await this.$store.dispatch('createComment', {
        type: this.type,
        id: this.id,
        text: this.newComment,
      });
      this.newComment = '';
      this.comments.push(data.comment);
    },
    async deleteComment(commentId) {
      await this.$store.dispatch('deleteComment', {
        type: this.type,
        id: this.id,
        commentId,
      });
      let i = this.comments.findIndex((c) => c.id === commentId);
      if (i >= 0) {
        this.comments.splice(i, 1);
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.comments {
  padding: 1em;
  font-size: 12px;

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
