import axios from 'axios';
import jwt_decode from 'jwt-decode';
import URLSearchParams from 'url-search-params';

import store from './store';

const LOGIN_URL = '/api/login';
const REGISTER_URL = '/api/register';
const TOKEN_STORAGE_KEY = 'auth_token';

function getUserFromToken(auth_token) {
  if (auth_token) {
    let decoded = jwt_decode(auth_token);
    let user = decoded.user;
    user.created = new Date(user.created);
    user.username = decoded.sub;
    return user;
  }
  return null;
}

function setAuthToken(auth_token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, auth_token);
  store.commit('setUser', getUserFromToken(auth_token));
}

function getAuthToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export default {
  register: function (context) {
    let payload = {
      'username': context.username,
      'password': context.password,
      'email': context.email,
    };
    axios.post(REGISTER_URL, payload).then(response => {
      context.error = '';
      setAuthToken(response.data.auth_token);
      window.location.assign('/');
    }, response => {
      context.error = response.data.message;
    });
  },
  login: function (context) {
    let payload = {
      'username': context.username,
      'password': context.password,
    };
    axios.post(LOGIN_URL, payload).then(response => {
      context.error = '';
      setAuthToken(response.data.auth_token);
      let next = new URLSearchParams(window.location.search).get('next');
      window.location.replace(next || '/');
    }, response => {
      context.error = response.data.message;
    });
  },
  logout: function () {
    setAuthToken('');
    window.location.replace('/');
  },
  getUser: function () {
    return getUserFromToken(getAuthToken());
  },
};
