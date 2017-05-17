<template>
<form class="register" @submit.prevent="submit">
  <input type="text"
         label="User name"
         class="form-control"
         autocomplete="off"
         placeholder="username"
         v-model="username" />
  <input type="password"
         class="form-control"
         placeholder="password"
         v-model="password" />
  <input type="text"
         class="form-control"
         placeholder="email address"
         v-model="email" />
  <button type="submit" class="btn btn-default">
    Submit
  </button>
</form>
</template>

<script>
export default {
  data: () => ({
    'username': '',
    'password': '',
    'email': '',
  }),
  methods: {
    submit: function () {
      let payload = {
        'username': this.username,
        'password': this.password,
        'email': this.email,
      }
      this.$http.post('/api/register', payload).then(response => {
        localStorage.setItem('auth_token', response.data.auth_token);
        window.location.replace('/');
      }, response => {
        console.log(response.data.message);
      })
    }
  },
};
</script>

<style>
.register > * {
  height: 3em;
  width: 300px;
  margin-bottom: 5px;
}
</style>
