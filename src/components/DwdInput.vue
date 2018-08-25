<template>
<div>
  <textarea rows="1"
            autocomplete="off"
            ref="input"
            v-model="displayValue"
            :placeholder="placeholder"
            :class="inputClasses"
            @invalid="maskError = false"
            @keydown.enter="handleEnter"></textarea>
  <div v-if="showError"
       class="error"
       :class="$style.error">{{ innerError }}</div>
</div>
</template>

<script>
import { ValidationError } from '@/common/validate';

function uppercaseFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const NORMAL = 'normal';
const LOADING = 'loading';
const SUCCESS = 'success';

export default {
  NORMAL, LOADING, SUCCESS,
  props: {
    value: { type: String, required: true },
    placeholder: { type: String, default: '' },
    // Error message to show for the input.
    error: { type: String, default: '' },
    // Alternative to |error|; performs input validation.
    validate: { type: Function, default: null },
    // Allows overriding the state of the input. If set, an error will only be
    state: { type: String, default: '' },
    // Focuses the input box whenever set to true.
    focus: { type: Boolean, default: false },
    // Makes the input text a monospaced font.
    mono: { type: Boolean, default: false },
    allowNewlines: { type: Boolean, default: false },
  },
  data() {
    return {
      // Used to make sure whitespace isn't stripped while the user is typing,
      // since we don't want to update value itself with anything untrimmed.
      displayValue: this.value,
      // Used to hide errors for an initial empty value.
      maskError: !this.value,
    };
  },
  computed: {
    trimmedValue() {
      return this.displayValue.trim();
    },
    innerError() {
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
    showError() {
      return !this.state && this.innerError && !this.maskError;
    },
    inputClasses() {
      let classes = [];
      if (this.mono) {
        classes.push('mono');
      }
      if (this.state) {
        if (this.state === SUCCESS) {
          classes.push(this.state);
        } else if (this.state === LOADING) {
          classes.push(this.$style.loading);
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
    value() {
      if (this.value !== this.trimmedValue) {
        this.displayValue = this.value;
      }
      if (this.value) {
        this.maskError = false;
      }
    },
    trimmedValue() {
      if (this.trimmedValue !== this.value) {
        this.$emit('input', this.trimmedValue);
      }
    },
    displayValue() {
      // Disallow pasted in tabs and newlines.
      if (!this.allowNewlines && /\t|\n/.test(this.displayValue)) {
        this.displayValue = this.displayValue.replace(/\t|\n/g, ' ');
        return;
      }
      if (this.allowNewlines && /\t/.test(this.displayValue)) {
        this.displayValue = this.displayValue.replace(/\t/g, ' ');
        return;
      }
      this.$refs.input.style.height = 'auto';
      this.$nextTick(() => {
        if (this.$refs.input.scrollHeight > 0) {
          this.$refs.input.style.height = this.$refs.input.scrollHeight + 'px';
        }
      });
    },
    innerError() {
      this.$refs.input.setCustomValidity(this.innerError);
    },
    focus() {
      if (this.focus) {
        this.$refs.input.focus();
      }
    },
  },
  mountedTriggersWatchers: true,
  methods: {
    handleEnter(event) {
      if (this.allowNewlines) {
        event.stopPropagation();
      } else {
        event.preventDefault();
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.error {
  font-size: 12px;
}

@keyframes dwd-border {
  0% {
    border-color: $amber-dark-primary;
  }

  20% {
    border-color: $purple-dark-primary;
  }

  40% {
    border-color: $green-dark-primary;
  }

  60% {
    border-color: $blue-dark-primary;
  }

  80% {
    border-color: $pink-dark-primary;
  }

  100% {
    border-color: $amber-dark-primary;
  }
}

.loading {
  animation: dwd-border 3s infinite ease;
}
</style>
