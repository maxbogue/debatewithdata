<template>
  <button type="button" class="btn btn-danger" @click="click">{{ text }}</button>
</template>

<script>
export default {
  props: ['noun'],
  data: () => ({
    awaitingConfirmation: false,
  }),
  computed: {
    text: function () {
      return this.awaitingConfirmation ? 'Really Delete?' : 'Delete ' + this.noun;
    },
  },
  methods: {
    click: function () {
      if (this.awaitingConfirmation) {
        this.$emit('delete');
        return;
      }
      setTimeout(() => {
        this.awaitingConfirmation = true;
        setTimeout(() => { this.awaitingConfirmation = false; }, 2000);
      }, 200);
    },
  },
};
</script>

<style>
</style>
