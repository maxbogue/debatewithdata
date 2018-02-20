<template>
<button type="button"
        class="dwd-btn red-dark"
        @click="click">{{ text }}</button>
</template>

<script>
export default {
  props: {
    noun: { type: String, required: true },
  },
  data: () => ({
    awaitingConfirmation: false,
  }),
  computed: {
    text: function () {
      if (this.awaitingConfirmation) {
        return 'Really Delete?';
      }
      return 'Delete ' + this.noun;
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
        setTimeout(() => {
          this.awaitingConfirmation = false;
        }, 2000);
      }, 200);
    },
  },
};
</script>
