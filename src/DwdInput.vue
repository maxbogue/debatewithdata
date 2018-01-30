<template>
<textarea rows="1"
          autocomplete="off"
          :value="value"
          @input="emit($event.target.value)"
          @keydown.enter.prevent></textarea>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
      default: '',
    },
    error: {
      type: String,
    },
    focus: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    emit: function (input) {
      this.$emit('input', String(input));
    },
  },
  watch: {
    value: function () {
      this.$el.style.height = 'auto';
      this.$el.style.height = this.$el.scrollHeight + 'px';
    },
    error: function () {
      this.$el.setCustomValidity(this.error);
    },
    focus: function () {
      if (this.focus) {
        this.$el.focus();
      }
    },
  },
  mountedTriggersWatchers: true,
};
</script>
