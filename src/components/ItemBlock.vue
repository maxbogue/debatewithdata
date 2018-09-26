<!-- Renders blocks for all item types. -->

<template>
<div :class="blockClasses">
  <router-link v-if="isLink"
               :to="urlWithTrail"
               class="bubble click">
    <item-content :class="$style.contentSpacing"
                  :item="item"
                  :type="type"
                  :abbreviated="abbreviated"
                  is-link />
  </router-link>
  <item-content v-else
                class="bubble"
                :item="item"
                :type="type"
                :abbreviated="abbreviated" />
  <template v-if="!abbreviated">
    <div class="info">
      <claim-data-analysis v-if="type === ItemType.CLAIM" :claim="item" />
      <span v-else class="id mono">{{ id }}</span>
      <span class="controls">
        <icon-star :type="type" :item="item" />
        <icon-watch v-if="$store.state.user" :type="type" :item="item" />
        <icon-comment @click.native="showComments = !showComments"
                      :count="item.commentCount" />
        <icon-history :url="urlWithTrail" />
        <icon-edit :url="urlWithTrail" />
      </span>
    </div>
    <dwd-comments :type="type" :id="id" :show="showComments" />
  </template>
</div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import ClaimDataAnalysis from './ClaimDataAnalysis.vue';
import DwdComments from './DwdComments.vue';
import IconComment from './IconComment.vue';
import IconEdit from './IconEdit.vue';
import IconHistory from './IconHistory.vue';
import IconStar from './IconStar.vue';
import IconWatch from './IconWatch.vue';
import ItemContent from './ItemContent.vue';
import { ItemType } from '@/common/constants';

const ANIMATION_DURATION_MS = 300;
const ANIMATION_DURATION_SECS = ANIMATION_DURATION_MS / 1000;

export default {
  components: {
    ClaimDataAnalysis,
    DwdComments,
    IconComment,
    IconEdit,
    IconHistory,
    IconStar,
    IconWatch,
    ItemContent,
  },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
    trail: { type: Array, default: () => [] },
    // Style as a point for/against (if non-null).
    isFor: { type: Boolean, default: null },
    // Display as a link to the item.
    isLink: { type: Boolean, default: false },
    // Reduce content and hide the controls bar.
    abbreviated: { type: Boolean, default: false },
    // Display with a smaller font.
    mini: { type: Boolean, default: false },
    // Display half-width.
    half: { type: Boolean, default: false },
    // Always use a fade in animation.
    fadeOnly: { type: Boolean, default: false },
  },
  data: () => ({
    ItemType,
    showComments: false,
  }),
  computed: {
    blockClasses() {
      return [
        this.type,
        this.$options.filters.toSideString(this.isFor),
        {
          [this.$style.mini]: this.mini,
          [this.$style.half]: this.half,
        },
      ];
    },
    id() {
      return this.item.id;
    },
    url() {
      return this.itemUrl(this.type, this.id);
    },
    urlWithTrail() {
      return this.itemUrl(this.type, this.id, this.trail);
    },
    animateFrom() {
      return this.$store.state.itemLocations[this.id];
    },
  },
  watch: {
    $route() {
      this.animate();
    },
  },
  mounted() {
    this.$store.commit('registerItemBlock', this);
    this.$el.addEventListener('transitionend', () => {
      this.$el.classList.remove(this.$style.animating);
      this.$el.style.overflow = '';
      this.$el.style.transition = '';
      this.$el.style.transform = '';
      this.$el.style.transformOrigin = '';
      this.$el.style.opacity = '';
      this.$el.style.height = '';
    });
    this.$nextTick(this.animate);
  },
  beforeDestroy() {
    this.$store.commit('unregisterItemBlock', this);
  },
  methods: {
    animate() {
      if (isEmpty(this.$store.state.itemLocations)) {
        return;
      }

      if (this.fadeOnly) {
        this.animateFade();
        return;
      }

      if (this.animateFrom) {
        this.animateSlide();
        return;
      }

      // Wait for nextTick to let any sliding blocks mark itemBlockSliding.
      this.$nextTick(() => {
        if (this.mini && this.$store.state.itemBlockSliding) {
          this.animateOpen();
        } else {
          this.animateFade();
        }
      });
    },
    animateFade() {
      let delay = 0;
      if (this.$store.state.itemBlockSliding) {
        // Delay fade if a block is sliding.
        delay = ANIMATION_DURATION_MS;
      }

      this.$el.classList.add(this.$style.animating);
      this.$el.style.opacity = 0;

      setTimeout(() => {
        this.$el.style.transition = `opacity ${ANIMATION_DURATION_SECS * 2}s`;
        this.$el.style.opacity = '';
      }, delay);
    },
    animateOpen() {
      this.$el.classList.add(this.$style.animating);
      const height = this.$el.scrollHeight;
      this.$el.style.height = 0;
      this.$el.style.overflow = 'hidden';

      setTimeout(() => {
        this.$el.style.transition = `height ${ANIMATION_DURATION_SECS * 2}s`;
        this.$el.style.height = height + 'px';
      }, ANIMATION_DURATION_MS);
    },
    animateSlide() {
      this.$store.commit('itemBlockSliding');

      const from = this.animateFrom;
      const to = this.$el.getBoundingClientRect();

      const dx = from.left - to.left;
      const dy = from.top - to.top;
      const sx = from.width / to.width;
      const sy = from.height / to.height;

      if (dx === 0 && dy === 0 && sx === 1 && sy === 1) {
        // Exit early if the item doesn't move, otherwise the animating class
        // never gets removed.
        return;
      }

      this.$el.classList.add(this.$style.animating);
      this.$el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      this.$el.style.transformOrigin = 'top left';

      setTimeout(() => {
        this.$el.style.overflow = 'hidden';
        this.$el.style.transition = `transform ${ANIMATION_DURATION_SECS}s`;
        this.$el.style.transform = 'translate(0, 0) scale(1, 1)';
      }, 0);
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.contentSpacing > :not(:first-child) {
  margin-top: $block-content-spacing;
}

.half {
  &:global(.topic),
  &:global(.claim),
  &:global(.source) {
    width: 50%;
  }
}

.mini {
  &:global(.topic),
  &:global(.claim),
  &:global(.source) {
    margin: $mini-block-spacing auto 0;
    font-size: 1em;

    &:last-child {
      margin-bottom: -$mini-block-spacing;
    }

    :global(.bubble) {
      padding: 0.8em 1em;
      text-decoration: none;
    }
  }
}

.animating::after {
  display: none;
}
</style>
