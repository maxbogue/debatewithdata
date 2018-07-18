<template>
<span class="fa-bell click"
      :class="item.watched ? 'fas' : 'far'"
      @click="toggle"></span>
</template>

<script>
export default {
  props: {
    item: { type: Object, required: true },
    url: { type: String, required: true },
  },
  methods: {
    toggle: async function () {
      let res = await this.$http.post(this.url + '/watch');
      this.item.watched = res.data.watched;
    },
  },
};
</script>
