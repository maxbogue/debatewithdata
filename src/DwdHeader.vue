<template>
  <nav :class="$style.navbar" v-on-clickaway="collapse">
    <div class="dwd-container">
      <router-link to="/"
                   title="Home"
                   :class="$style.navbarBrand"
                   exact>DebateWithData</router-link>
      <button :class="$style.navbarToggler"
              type="button"
              aria-expanded="false"
              aria-label="Toggle navigation"
              @click="collapsed = !collapsed">
        <span :class="$style.iconBar"></span>
        <span :class="$style.iconBar"></span>
        <span :class="$style.iconBar"></span>
      </button>
      <div :class="[$style.navbarCollapse, {[$style.collapse]:collapsed}]">
        <ul :class="$style.navbarNav">
          <li>
            <router-link to="/topics" title="Topics">Topics</router-link>
          </li>
          <li>
            <router-link to="/claims" title="Claims">Claims</router-link>
          </li>
          <li>
            <router-link to="/sources" title="Sources">Sources</router-link>
          </li>
          <li>
            <router-link to="/guide" title="Guide">Guide</router-link>
          </li>
          <li>
            <router-link to="/status" title="Status">Status</router-link>
          </li>
          <li>
            <router-link to="/activity" title="Activity">Activity</router-link>
          </li>
        </ul>
        <ul :class="$style.navbarNavRight">
          <template v-if="user">
            <li v-if="user.admin">
              <router-link to="/admin" title="Admin">Admin</router-link>
            </li>
            <li>
              <router-link to="/account"
                           title="Account">
                <span class="fas fa-user"></span>
                <span> {{ user.username }}</span>
              </router-link>
            </li>
            <li>
              <router-link to="/logout" title="Logout">Logout</router-link>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link :to="loginUrl" title="Login">Login</router-link>
            </li>
            <li>
              <router-link to="/register"
                           title="Register">Register</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
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
    ]),
    loginUrl: function () {
      let path = this.$route.fullPath;
      if (path === '/' || path.startsWith('/login')) {
        return '/login';
      }
      return '/login?next=' + path;
    },
  },
  watch: {
    $route: function () {
      this.collapse();
    },
  },
  methods: {
    collapse: function () {
      this.collapsed = true;
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

$navbar-bg-color: #333;
$navbar-btn-accent: #666;
$navbar-spacing: $block-spacing;
$navbar-text-color: #aaa;
$navbar-text-highlight: #fff;
$navbar-brand-font-size: 20px;
$navbar-link-font-size: 14px;

.navbar {
  position: relative;
  background-color: $navbar-bg-color;
  color: $navbar-text-color;

  :global(.dwd-container) {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 0;
  }

  a {
    color: $navbar-text-color;
    line-height: $navbar-brand-font-size;

    &:hover,
    &:focus,
    &:global(.router-link-active) {
      color: $navbar-text-highlight;
      text-decoration: none;
    }
  }

  ul {
    margin: 0;
  }

  @media (max-width: $screen-sm-min - 0.02px) {
    :global(.dwd-container) {
      flex-wrap: wrap;
    }

    .navbarCollapse.collapse {
      display: none;
    }

    .navbarNav a {
      padding: ($block-spacing / 1.5) $block-spacing;
      font-size: $navbar-link-font-size * 1.2;
    }
  }

  @media (min-width: $screen-sm-min) {
    .navbarNav {
      flex-direction: row;

      a {
        padding: $block-spacing ($block-spacing / 2);
      }
    }

    .navbarCollapse {
      display: flex;
    }

    .navbarToggler {
      display: none;
    }
  }
}

.navbarBrand {
  display: inline-block;
  padding: $navbar-spacing;
  font-size: $navbar-brand-font-size;
  white-space: nowrap;
}

.navbarToggler {
  position: relative;
  margin-top: 8px;
  margin-right: 15px;
  margin-bottom: 8px;
  padding: 9px 10px;
  float: right;
  border: 1px solid $navbar-btn-accent;
  border-radius: 4px;
  background: none;

  .iconBar {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 1px;
    background-color: $navbar-text-color;

    + .iconBar {
      margin-top: 4px;
    }
  }

  &:hover,
  &:focus {
    outline: none;
    background-color: $navbar-btn-accent;
    text-decoration: none;

    .iconBar {
      background-color: $navbar-text-highlight;
    }
  }

  &:not(:disabled):not(.disabled) {
    cursor: pointer;
  }
}

.navbarCollapse {
  flex-basis: 100%;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: center;
}

.navbarNav {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  list-style: none;

  a,
  li {
    display: block;
    font-size: $navbar-link-font-size;
  }
}

.navbarNavRight {
  @extend .navbarNav;

  margin-left: auto !important;
}
</style>
