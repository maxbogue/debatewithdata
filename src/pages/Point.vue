<template>
<div>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import axios from 'axios';

import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  props: {
    id: { type: String, required: true },
  },
  mounted: function () {
    let url = '/api/point/' + this.id + '/claimId';
    axios.get(url, { loader: this.$refs.loader }).then((res) => {
      this.$router.replace(this.claimUrl(res.data.claimId));
    });
  },
};
</script>
