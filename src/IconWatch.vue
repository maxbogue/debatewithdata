<template>
<span class="fa-bell click"
      :class="item.watched ? 'fas' : 'far'"
      @click="toggle"></span>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    item: { type: Object, required: true },
    url: { type: String, required: true },
  },
  methods: {
    toggle: function () {
      axios.post(this.url + '/watch').then((response) => {
        this.item.watched = response.data.watched;
      });
    },
  },
};
</script>
