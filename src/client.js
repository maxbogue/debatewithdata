import 'normalize.css/normalize.css';

import axios from 'axios';

import ApiClient from './api/client';
import { createApp } from './app';
import { BrowserAuth } from './auth';

const http = axios.create({ baseURL: '/api' });
const auth = new BrowserAuth();
const api = new ApiClient(auth, http);

const { app, store, router } = createApp(api, auth);

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

router.onReady(() => {
  app.$mount('#app');
});
