<template>
<div>
  <textarea rows="1"
            autocomplete="off"
            ref="input"
            v-model="displayValue"
            :placeholder="placeholder"
            :class="inputClasses"
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

const NORMAL = 'normal';
const ERROR = 'error';
const WARNING = 'warning';
const SUCCESS = 'success';

export default {
  NORMAL, ERROR, WARNING, SUCCESS,
  props: {
    value: { type: String, required: true },
    placeholder: { type: String, default: '' },
    // Error message to show for the input.
    error: { type: String, default: '' },
    // Alternative to |error|; performs input validation.
    validate: { type: Function, default: null },
    // Allows overriding the state of the input. If set, an error will only be
    // shown if state is ERROR. WARNING and SUCCESS will pass styling on to the
    // input.
    state: { type: String, default: '' },
    // Focuses the input box whenever set to true.
    focus: { type: Boolean, default: false },
    // Makes the input text a monospaced font.
    mono: { type: Boolean, default: false },
  },
  data: function () {
    return {
      // Used to make sure whitespace isn't stripped while the user is typing,
      // since we don't want to update value itself with anything untrimmed.
      displayValue: this.value,
      // Used to hide errors for an initial empty value.
      maskError: !this.value,
    };
  },
  computed: {
    trimmedValue: function () {
      return this.displayValue.trim();
    },
    innerError: function () {
      if (this.error) {
        return this.error;
      }
      if (this.validate) {
        try {
          this.validate(this.value);
        } catch (e) {
          if (e instanceof ValidationError) {
            let stripKey = e.message.match(/^"\w*" (.*)$/);
            return uppercaseFirstLetter(stripKey ? stripKey[1] : e.message);
          }
          throw e;
        }
      }
      return '';
    },
    showError: function () {
      if (this.state) {
        return this.state === ERROR && this.innerError;
      }
      return this.innerError && !this.maskError;
    },
    inputClasses: function () {
      let classes = [];
      if (this.mono) {
        classes.push('mono');
      }
      if (this.state) {
        if ([ERROR, WARNING, SUCCESS].includes(this.state)) {
          classes.push(this.state);
        }
      } else {
        if (this.showError) {
          classes.push('error');
        }
      }
      return classes;
    },
  },
  watch: {
    value: function () {
      if (this.value !== this.trimmedValue) {
        this.displayValue = this.value;
      }
      if (this.value) {
        this.maskError = false;
      }
      this.$refs.input.style.height = 'auto';
      if (this.$refs.input.scrollHeight > 0) {
        this.$refs.input.style.height = this.$refs.input.scrollHeight + 'px';
      }
    },
    trimmedValue: function () {
      if (this.trimmedValue !== this.value) {
        this.$emit('input', this.trimmedValue);
      }
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
