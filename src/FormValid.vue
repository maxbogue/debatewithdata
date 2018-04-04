<template>
<form @submit.prevent.stop="submit">
  <slot></slot>
</form>
</template>

<script>
export default {
  methods: {
    submit: function () {
      if (this.$el.checkValidity()) {
        this.$emit('submit');
      } else {
        this.$el.reportValidity();
      }
    },
  },
};
</script>
