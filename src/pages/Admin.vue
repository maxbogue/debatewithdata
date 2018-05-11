<template>
<div class="center auth">
  <dwd-loader ref="loader" />
  <template v-if="invites">
    <h2>Invite Codes</h2>
    <form @submit.prevent.stop="invite">
      <input type="text"
             placeholder="note"
             v-model="note">
      <button type="submit"
              class="dwd-btn dwd-btn-primary"
              :disabled="!note">New Invite</button>
    </form>
    <ul :class="$style.invites" class="mono">
      <li v-for="invite in sortedInvites" :key="invite.code">
        <template v-if="invite.user">
          <span :class="$style.used">{{ invite.code }}</span>
          <br><span>{{ invite.note }} =&gt; {{ invite.user }}</span>
        </template>
        <template v-else>
          <router-link :to="'/register?invite=' + invite.code">
            {{ invite.code }}
          </router-link>
          <br><span>{{ invite.note }}</span>
        </template>
      </li>
    </ul>
  </template>
  <h2>Fixes</h2>
  <button type="button"
          class="dwd-btn dwd-btn-primary"
          @click="topicRoots">Init topic roots</button>
</div>
</template>

<script>
import axios from 'axios';
import sortBy from 'lodash/sortBy';

import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    note: '',
    invites: null,
  }),
  computed: {
    sortedInvites: function () {
      return sortBy(this.invites, (i) => -i.created);
    },
  },
  mounted: function () {
    let loader = this.$refs.loader;
    axios.get('/api/admin/invite', { loader }).then((res) => {
      this.invites = res.data;
    });
  },
  methods: {
    invite: function () {
      axios.post('/api/admin/invite', { note: this.note }).then((res) => {
        this.invites.push(res.data);
      });
    },
    topicRoots: function () {
      if (window.confirm('Are you sure?')) {
        axios.post('/api/admin/fix/topic-roots').then((res) => {
          window.alert(res.data.count + ' topics made root.');
        });
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.invites {
  margin-top: 10px;
  padding: 0;
  list-style: none;

  li {
    padding: 4px;
  }

  .used {
    color: $text-dark-accent;
    text-decoration: line-through;
  }
}
</style>
