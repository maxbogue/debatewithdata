<template>
<div class="claim">
  <slot></slot>
  <div class="bubble"
       :class="{ click: canEdit }"
       @click="$emit('start-editing')">
    <dwd-flag v-if="safeCurr.flag && safeCurr.flag === safePrev.flag"
              :flag="safeCurr.flag" />
    <template v-else>
      <dwd-flag v-if="safePrev.flag" :flag="safePrev.flag" class="del" />
      <dwd-flag v-if="safeCurr.flag" :flag="safeCurr.flag" class="ins" />
    </template>
    <span v-html="textDiff"></span>
  </div>
  <div class="info">
    <div v-if="safeCurr.needsData !== safePrev.needsData"
         class="data-analysis">
      <span class="del">{{ needsDataString(safePrev.needsData) }}</span>
      <span class="ins">{{ needsDataString(safeCurr.needsData) }}</span>
    </div>
    <claim-data-analysis v-else :claim="safeCurr" no-color />
    <span class="controls">
      <span v-if="canDelete"
            class="delete click fas fa-trash-alt"
            @click="$emit('delete')"></span>
      <icon-comment v-else-if="id"
                    :count="commentCount"
                    @click.native="showComments = !showComments" />
    </span>
  </div>
  <dwd-comments :url="'/api' + url" :show="showComments" />
</div>
</template>

<script>
import ClaimDataAnalysis from './ClaimDataAnalysis.vue';
import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import IconComment from './IconComment.vue';
import { diff } from '@/utils';

const EMPTY_CLAIM = {
  text: '',
  needsData: null,
};

export default {
  components: {
    ClaimDataAnalysis,
    DwdComments,
    DwdFlag,
    IconComment,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    safeCurr() {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_CLAIM;
      }
      return this.curr;
    },
    safePrev() {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_CLAIM;
      }
      return this.prev;
    },
    id() {
      return this.safeCurr.id || this.safePrev.id;
    },
    commentCount() {
      if (!this.id) {
        return 0;
      }
      return this.lookupClaim(this.id).commentCount;
    },
    url() {
      return this.claimUrl(this.id);
    },
    textDiff() {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
  },
  methods: {
    needsDataString(needsData) {
      if (needsData === null) {
        return 'Analyze Points';
      }
      return needsData ? 'Needs Data' : 'Self-Evident';
    },
  },
};
</script>
