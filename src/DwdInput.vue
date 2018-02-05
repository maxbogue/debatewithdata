<template>
<div>
  <textarea rows="1"
            autocomplete="off"
            ref="input"
            :value="value"
            :class="{ 'error': showError }"
            @input="emit($event.target.value.trim())"
            @invalid="maskError = false"
            @keydown.enter.prevent></textarea>
  <div v-if="showError"
       class="error"
       :class="$style.error">{{ innerError }}</div>
</div>
</template>

<script>
import { ValidationError } from '../common/validate';

function uppercaseFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
    validate: {
      type: Function,
    },
    focus: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return { maskError: !this.value };
  },
  computed: {
    innerError: function () {
      if (this.error) {
        return this.error;
      }
      if (this.validate) {
        try {
          this.validate(this.value);
        } catch (e) {
          if (e instanceof ValidationError) {
            let stripKey = e.message.match(/"\w*" (.*)/);
            return uppercaseFirstLetter(stripKey ? stripKey[1] : e.message);
          }
          throw e;
        }
      }
      return '';
    },
    showError: function () {
      return this.innerError && !this.maskError;
    },
  },
  methods: {
    emit: function (input) {
      this.$emit('input', String(input));
    },
  },
  watch: {
    value: function () {
      if (this.value) {
        this.maskError = false;
      }
      this.$refs.input.style.height = 'auto';
      this.$refs.input.style.height = this.$refs.input.scrollHeight + 'px';
    },
    innerError: function () {
      this.$refs.input.setCustomValidity(this.innerError);
    },
    focus: function () {
      if (this.focus) {
        this.$refs.input.focus();
      }
    },
  },
  mountedTriggersWatchers: true,
};
</script>

<style lang="sass" module>
.error
  font-size: 12px
</style>
