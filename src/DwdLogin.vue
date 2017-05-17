<template>
<form class="login" @submit.prevent="submit">
  <input type="text"
         label="User name"
         class="form-control"
         autocomplete="off"
         placeholder="username"
         v-model="username" />
  <input type="password"
         class="form-control"
         v-model="password" />
  <button type="submit" class="btn btn-default">
    Submit
  </button>
</form>
</template>

<script>
export default {
  data: () => ({
    'username': '',
    'password': ''
  }),
  methods: {
    submit: function () {
      let payload = {
        'username': this.username,
        'password': this.password
      };
      this.$http.post('/api/login', payload).then(response => {
        localStorage.setItem('auth_token', response.data.auth_token);
        let next = new URLSearchParams(window.document.URL).get('next');
        window.location.replace(next || '/');
      }, response => {
        console.log(response.data.message);
      });
    }
  },
};
</script>

<style>
.login > * {
  height: 3em;
  width: 300px;
  margin-bottom: 5px;
}
</style>
