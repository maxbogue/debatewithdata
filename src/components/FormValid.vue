<template>
<form @submit.prevent.stop="submit"
      @keydown.enter="submit">
  <slot></slot>
</form>
</template>

<script>
export default {
  methods: {
    submit() {
      if (this.$el.checkValidity()) {
        this.$emit('submit');
      } else {
        this.$el.reportValidity();
      }
    },
  },
};
</script>
