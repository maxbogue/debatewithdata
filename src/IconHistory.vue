<template>
  <router-link :to="url + '/history'" class="fas fa-clock click" />
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>
