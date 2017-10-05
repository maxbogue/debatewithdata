import axios from 'axios';
import jwt_decode from 'jwt-decode';

import store from './store';

const LOGIN_URL = '/api/login';
const REGISTER_URL = '/api/register';
const TOKEN_STORAGE_KEY = 'auth_token';

function getAuthToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function updateHeader() {
  let token = getAuthToken();
  if (token) {
    axios.defaults.headers.common.Authorization = 'Bearer ' + token;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

function getUserFromToken(auth_token) {
  if (!auth_token) {
    return null;
  }

  let decoded = jwt_decode(auth_token);

  // Check for an expired token.
  if (Date.now() / 1000 > decoded.exp) {
    return null;
  }

  let user = decoded.user;
  user.created = new Date(user.created);
  user.username = decoded.sub;
  return user;
}

function setAuthToken(auth_token) {
  if (auth_token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, auth_token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  updateHeader();
  store.commit('setUser', getUserFromToken(auth_token));
}

export default {
  register: function (username, password, email) {
    let payload = { username, password, email };
    return axios.post(REGISTER_URL, payload).then((response) => {
      setAuthToken(response.data.authToken);
    });
  },
  login: function (username, password) {
    let payload = {
      'username': username,
      'password': password,
    };
    return axios.post(LOGIN_URL, payload).then((response) => {
      setAuthToken(response.data.authToken);
    });
  },
  logout: function () {
    setAuthToken(null);
  },
  getUser: function () {
    let token = getAuthToken();
    let user = getUserFromToken(token);
    if (token && !user) {
      // Token must be expired.
      setAuthToken(null);
    }
    return user;
  },
  updateHeader,
};
