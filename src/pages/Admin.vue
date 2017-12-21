<template>
<div class="center">
  <dwd-loader ref="loader"></dwd-loader>
  <template v-if="invites">
    <h2>Invite Codes</h2>
    <form class="auth" @submit.prevent="submit">
      <input type="text"
             placeholder="note"
             v-model="note" />
      <button type="submit"
              class="btn btn-primary"
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
  methods: {
    submit: function () {
      axios.post('/api/admin/invite', { note: this.note }).then((res) => {
        this.invites.push(res.data);
      });
    },
  },
  mounted: function () {
    let loader = this.$refs.loader;
    axios.get('/api/admin/invite', { loader }).then((res) => {
      this.invites = res.data;
    });
  },
};
</script>

<style lang="sass" module>
@import "../style/constants"

.invites
  list-style: none
  margin-top: 10px
  padding: 0

  li
    padding: 4px

  .used
    color: $text-dark-accent
    text-decoration: line-through
</style>
