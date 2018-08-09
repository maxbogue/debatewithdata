import { createApp } from './app';
import { BrowserAuth } from './auth';

const auth = new BrowserAuth();

const { app, store, router } = createApp(auth);

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

router.onReady(() => {
  app.$mount('#app');
});
