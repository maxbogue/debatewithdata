<template>
  <router-link :to="url + '/edit'" class="fas fa-edit click" />
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
