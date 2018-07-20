<template>
<footer class="dwd-container center" :class="$style.footer">
    <ul>
      <li>
        <router-link to="/about" title="About">About</router-link>
      </li>
      <li>
        <router-link to="/contact" title="Contact">Contact</router-link>
      </li>
      <li>
        <a href="https://twitter.com/debatewithdata"
           title="Twitter"
           target="_blank"
           class="fab fa-twitter"></a>
      </li>
      <li>
        <a href="https://github.com/maxbogue/debatewithdata"
           title="GitHub Repo"
           target="_blank"
           class="fab fa-github"></a>
      </li>
    </ul>
</footer>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import { mapState } from 'vuex';

export default {
  mixins: [clickaway],
  data: () => ({
    collapsed: true,
  }),
  computed: {
    ...mapState([
      'user',
      'notificationCount',
    ]),
    loginUrl: function () {
      let path = this.$route.fullPath;
      if (path === '/' || path.startsWith('/login')) {
        return '/login';
      }
      return '/login?next=' + path;
    },
    logoutUrl: function () {
      let path = this.$route.fullPath;
      if (path === '/' || path.startsWith('/logout')) {
        return '/logout';
      }
      return '/logout?next=' + path;
    },
  },
  watch: {
    $route: function () {
      this.collapse();
    },
    user: function () {
      if (this.user) {
        this.$store.dispatch('updateNotificationCount');
      }
    },
  },
  mountedTriggersWatchers: true,
  methods: {
    collapse: function () {
      this.collapsed = true;
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.footer {
  position: relative;
  color: $text-dark-accent;

  ul {
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
    border-top: 1px solid #ddd;
    list-style: none;
  }

  a {
    display: block;
    padding: $block-spacing ($block-spacing / 2);
    color: $text-dark-accent;
    font-size: $navbar-link-font-size;
    line-height: $navbar-brand-font-size;

    &:hover,
    &:focus,
    &:global(.router-link-active) {
      color: $text-dark;
    }
  }

  &:global(.dwd-container) {
    margin-bottom: 0;
  }

  :global(.fab) {
    font-size: 1.4em;
  }
}
</style>
