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
      <span class="id mono">{{ item.id }}</span>
      <icon-star :star="item.star" :url="'/api' + url" />
      <icon-history :url="url" />
      <icon-edit v-if="$store.state.user" :url="url" />
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
    url: function () {
      return this.itemUrl(this.type, this.item.id);
    },
    urlWithTrail: function () {
      return this.itemUrl(this.type, this.item.id, this.trail);
    },
  },
};
</script>
