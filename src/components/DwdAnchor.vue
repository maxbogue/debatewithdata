<template>
  <a
    :name="name"
    :href="'#' + name"
    :class="$style.anchor"
    class="fas fa-link"
  ></a>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

a.anchor {
  visibility: hidden;
  color: $text-light-accent;
  font-size: 0.75em;

  &:hover {
    color: $text-dark;
  }
}

*:hover > a.anchor {
  visibility: visible;
}
</style>
