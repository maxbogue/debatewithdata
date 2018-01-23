<template>
<li class="sub-point" :class="isFor | toSideString">
  <point-edit-modal :show.sync="showModal"
                    :point="point"
                    :isFor="isFor"
                    :isSubPoint="true"
                    @update="emitPoint" />
  <template v-if="point.type">
    <point-content class="bubble click"
                   :point="point"
                   @click.native="showModal = true" />
    <div class="info">
      <span class="id mono">{{ point.id || 'new' }}</span>
      <span class="delete click glyphicon glyphicon-trash"
            aria-hidden="true"
            @click="$emit('delete')"></span>
    </div>
  </template>
  <div v-else class="bubble click" @click="showModal = true">
    <strong>Add a sub-point {{ isFor | toSideString }} the claim.</strong>
  </div>
</li>
</template>

<script>
import './style/point.sass';
import PointContent from './PointContent.vue';
import PointEditModal from './PointEditModal.vue';

export default {
  components: {
    PointContent,
    PointEditModal,
  },
  props: {
    point: {
      type: Object,
      required: true,
    },
    isFor: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    showModal: false,
  }),
  methods: {
    emitPoint: function (p) {
      if (this.point.id) {
        p.id = this.point.id;
      } else {
        p.tempId = this.point.tempId;
      }
      this.$emit('update', p);
    },
  },
};
</script>
