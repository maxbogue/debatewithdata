<template>
  <header :class="$style.navbar" v-on-clickaway="collapse">
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
      <nav :class="[$style.navbarCollapse, {[$style.collapse]:collapsed}]">
        <ul :class="$style.navbarNav">
          <li>
            <router-link to="/topics" title="Topics">Topics</router-link>
          </li>
          <li>
            <router-link to="/claims" title="Claims">Claims</router-link>
          </li>
          <li>
            <router-link to="/datas" title="Data">Data</router-link>
          </li>
          <li>
            <router-link to="/guide" title="Guide">Guide</router-link>
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
              <router-link to="/notifications"
                           title="Notifications">
                <span class="fas fa-bell" :class="$style.alertBadge">
                  <span v-if="notificationCount > 0"></span>
                </span>
                <span v-if="!collapsed">Notifications</span>
              </router-link>
            </li>
            <li>
              <router-link :to="logoutUrl" title="Logout">Logout</router-link>
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
      </nav>
    </div>
  </header>
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

$toggler-accent: #666;
$badge-radius: 3px;

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
  padding: $block-spacing;
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
  border: 1px solid $toggler-accent;
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
    background-color: $toggler-accent;

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

.alertBadge {
  position: relative;

  span {
    position: absolute;
    top: -$badge-radius;
    right: -$badge-radius;
    width: $badge-radius * 2;
    height: $badge-radius * 2;
    border-radius: 100%;
    background-color: $pink-dark-primary;
  }
}
</style>
