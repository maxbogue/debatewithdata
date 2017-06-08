<template>
<navbar placement="top" type="inverse">
  <router-link slot="brand" to="/" title="Home" class="navbar-brand">DebateWithData</router-link>
  <li>
    <router-link to="/claims" title="Claims">Claims</router-link>
  </li>
  <template v-if="!username">
    <li slot="right">
      <router-link to="/login" title="Login">Login</router-link>
    </li>
    <li slot="right">
      <router-link to="/register" title="Register">Register</router-link>
    </li>
  </template>
  <template v-else>
    <li slot="right">
      <router-link to="/account" title="Account">
        <span class="glyphicon glyphicon-user" aria-hidden="true"></span><span> {{ username }}</span>
      </router-link>
    </li>
    <li slot="right">
      <router-link to="/logout" title="Logout">Logout</router-link>
    </li>
  </template>
</navbar>
</template>

<script>
import { navbar } from 'vue-strap';
import auth from './auth';

export default {
  components: {
    navbar,
  },
  data: () => ({
    username: '',
  }),
  created: function () {
    this.username = auth.getUsername();
  },
  watch: {
    '$route': function () {
      this.username = auth.getUsername();
    },
  },
};
</script>

<style>
</style>
