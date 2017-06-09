<template>
<div class="center">
  <div class="for construction">
    <p>Username: {{ user.username }}</p>
    <p>Created on: {{ user.created.toDateString() }}</p>
    <p>Email address: {{ user.email }}</p>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState([
    'user',
  ]),
};
</script>

<style>
</style>
