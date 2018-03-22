<template>
<div :class="blockClasses">
  <router-link v-if="isLink"
               :to="urlWithTrail"
               class="bubble click">
    <item-content :item="item"
                  :type="type"
                  :abbreviated="abbreviated" />
  </router-link>
  <item-content v-else
                class="bubble"
                :item="item"
                :type="type"
                :abbreviated="abbreviated" />
  <template v-if="!abbreviated">
    <div class="info">
      <span class="id mono">{{ id }}</span>
      <icon-star :star="item.star" :url="'/api' + url" />
      <icon-history :url="urlWithTrail" />
      <icon-edit :url="urlWithTrail" />
      <icon-comment @click.native="showComments = !showComments"
                    :count="item.commentCount" />
    </div>
    <dwd-comments :url="'/api' + url"
                  :show="showComments" />
  </template>
</div>
</template>

<script>
import DwdComments from './DwdComments.vue';
import IconComment from './IconComment.vue';
import IconEdit from './IconEdit.vue';
import IconHistory from './IconHistory.vue';
import IconStar from './IconStar.vue';
import ItemContent from './ItemContent.vue';

const ANIMATION_DURATION_MS = 300;
const ANIMATION_DURATION_SECS = ANIMATION_DURATION_MS / 1000;

export default {
  components: {
    DwdComments,
    IconComment,
    IconEdit,
    IconHistory,
    IconStar,
    ItemContent,
  },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
    trail: { type: Array, default: () => [] },
    isFor: { type: Boolean, default: null },
    isLink: { type: Boolean, default: false },
    abbreviated: { type: Boolean, default: false },
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    blockClasses: function () {
      return [
        this.type,
        this.$options.filters.toSideString(this.isFor),
      ];
    },
    id: function () {
      return this.item.id;
    },
    url: function () {
      return this.itemUrl(this.type, this.id);
    },
    urlWithTrail: function () {
      return this.itemUrl(this.type, this.id, this.trail);
    },
    animateFrom: function () {
      return this.$store.state.itemLocations[this.id];
    },
  },
  watch: {
    '$route': function () {
      this.animate();
    },
  },
  mounted: function () {
    this.$store.commit('registerItemBlock', this);
    this.$el.addEventListener('transitionend', () => {
      this.$el.style.overflow = '';
      this.$el.style.transition = '';
      this.$el.style.transform = '';
      this.$el.style.transformOrigin = '';
      this.$el.style.opacity = '';
    });
    this.$nextTick(this.animate);
  },
  beforeDestroy: function () {
    this.$store.commit('unregisterItemBlock', this);
  },
  methods: {
    animate: function () {
      if (this.animateFrom) {
        this.animateSlide();
      } else {
        this.animateFade();
      }
    },
    animateFade: function () {
      this.$el.style.opacity = 0;
      // Delay fading in til after any slides have completed.
      setTimeout(() => {
        this.$el.style.transition = `opacity ${ANIMATION_DURATION_SECS * 2}s`;
        this.$el.style.opacity = 1;
      }, ANIMATION_DURATION_MS);
    },
    animateSlide: function () {
      let from = this.animateFrom;
      let to = this.$el.getBoundingClientRect();

      let dx = from.left - to.left;
      let dy = from.top - to.top;
      let sx = from.width / to.width;
      let sy = from.height / to.height;

      this.$el.style.transform =
          `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
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
