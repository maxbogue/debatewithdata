<!--
  A feature-limited regex-based Markdown rendering template. Only supports
  links with the schema http(s) and paragraph breaks.
-->

<template>
<div :class="$style.md">
  <p v-for="(paragraph, i) in paragraphs" :key="`p-${i}`">
  <template v-for="([text, url], j) in paragraph">
    <a v-if="url"
       :href="url"
       :key="`p-${i}-${j}`"
       target="_blank"
       rel="noopener">
      <span :class="$style.text">{{ text }}</span>
      <span :class="$style.link" class="fas fa-external-link-alt"></span>
    </a>
    <template v-else>{{ text }}</template>
  </template>
  </p>
</div>
</template>

<script>
const MD_LINK_WHOLE = /(\[.*?\]\(http[s]?:\/\/.*?\))/;
const MD_LINK_PARTS = /\[(.*?)\]\((http[s]?:\/\/.*?)\)/;

function splitLinks(p) {
  return p.split(MD_LINK_WHOLE).map((s) => {
    let parts = s.match(MD_LINK_PARTS);
    return parts ? [parts[1], parts[2]] : [s];
  });
}

export default {
  props: {
    text: { type: String, required: true },
  },
  computed: {
    paragraphs: function () {
      return this.text.split('\n\n').map(splitLinks);
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.md {
  a {
    &:hover {
      text-decoration: none;

      .text {
        text-decoration: underline;
      }
    }

    .link {
      font-size: 0.7em;
    }
  }
}
</style>
