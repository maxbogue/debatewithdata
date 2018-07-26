<template>
<div class="center auth">
  <h2>Fixes</h2>
  <button type="button"
          class="dwd-btn dwd-btn-primary"
          @click="topicRoots">Init topic roots</button>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Admin',
  },
  methods: {
    topicRoots: async function () {
      if (window.confirm('Are you sure?')) {
        let res = await this.$http.post('/api/admin/fix/topic-roots');
        window.alert(res.data.count + ' topics made root.');
      }
    },
  },
};
</script>
