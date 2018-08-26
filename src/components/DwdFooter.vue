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
           rel="noopener"
           class="fab fa-twitter"></a>
      </li>
      <li>
        <a href="https://github.com/maxbogue/debatewithdata"
           title="GitHub Repo"
           target="_blank"
           rel="noopener"
           class="fab fa-github"></a>
      </li>
    </ul>
</footer>
</template>

<style lang="scss" module>
@import '../style/constants';

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
