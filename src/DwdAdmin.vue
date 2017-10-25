<template>
<div class="center">
  <dwd-loader ref="loader"></dwd-loader>
  <template v-if="invites">
    <h2>Invite Codes</h2>
    <button type="button"
            class="btn btn-primary"
            @click="createInvite">New Invite</button>
    <ul class="invites">
      <li v-for="invite in sortedInvites" :key="invite.code">
        <template v-if="invite.user">
          <span class="mono used">{{ invite.code }}</span>
          <br><span>{{ invite.user }}</span>
        </template>
        <router-link v-else
                     :to="'/register?invite=' + invite.code"
                     class="mono">{{ invite.code }}</router-link>
      </li>
    </ul>
  </template>
</div>
</template>

<script>
import axios from 'axios';
import sortBy from 'lodash/sortBy';

import DwdLoader from './DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    invites: null,
  }),
  computed: {
    sortedInvites: function () {
      return sortBy(this.invites, (i) => i.created);
    },
  },
  methods: {
    createInvite: function () {
      axios.post('/api/admin/invite').then((res) => {
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

<style scoped>
.invites {
  list-style: none;
  margin-top: 10px;
  padding: 0;
}
.invites li {
  padding: 4px;
}
.invites .used {
  color: #aaa;
  text-decoration: line-through;
}
</style>
