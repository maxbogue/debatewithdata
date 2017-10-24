<template>
<navbar placement="top" type="inverse">
  <router-link slot="brand"
               to="/"
               title="Home"
               class="navbar-brand">DebateWithData</router-link>
  <li><router-link to="/claims" title="Claims">Claims</router-link></li>
  <li><router-link to="/sources" title="Sources">Sources</router-link></li>
  <template v-if="user">
    <li slot="right">
      <router-link to="/account" title="Account">
        <span class="glyphicon glyphicon-user"aria-hidden="true"></span>
        <span> {{ user.username }}</span>
      </router-link>
    </li>
    <li slot="right">
      <router-link to="/logout" title="Logout">Logout</router-link>
    </li>
  </template>
  <template v-else>
    <li slot="right">
      <router-link :to="loginUrl" title="Login">Login</router-link>
    </li>
    <li slot="right">
      <router-link to="/register" title="Register">Register</router-link>
    </li>
  </template>
</navbar>
</template>

<script>
import Navbar from 'vue-strap/src/Navbar.vue';
import { mapState } from 'vuex';

export default {
  components: {
    Navbar,
  },
  computed: {
    ...mapState([
      'user',
    ]),
    loginUrl: function () {
      let path = this.$route.fullPath;
      if (path === '/' || path.startsWith('/login')) {
        return '/login';
      }
      return '/login?next=' + path;
    },
  },
};
</script>
