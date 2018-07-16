<template>
<div class="center auth">
  <h2>Fixes</h2>
  <button type="button"
          class="dwd-btn dwd-btn-primary"
          @click="topicRoots">Init topic roots</button>
</div>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    topicRoots: function () {
      if (window.confirm('Are you sure?')) {
        axios.post('/api/admin/fix/topic-roots').then((res) => {
          window.alert(res.data.count + ' topics made root.');
        });
      }
    },
  },
};
</script>
