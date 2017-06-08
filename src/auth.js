import axios from 'axios';
import jwt_decode from 'jwt-decode';

import store from './store';
import { axiosErrorToString } from './utils';

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
  if (auth_token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, auth_token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
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
    return new Promise((resolve, reject) => {
      axios.post(REGISTER_URL, payload).then((response) => {
        setAuthToken(response.data.auth_token);
        resolve();
      }).catch((error) => {
        reject(axiosErrorToString(error));
      });
    });
  },
  login: function (username, password) {
    let payload = {
      'username': username,
      'password': password,
    };
    return new Promise((resolve, reject) => {
      axios.post(LOGIN_URL, payload).then((response) => {
        setAuthToken(response.data.auth_token);
        resolve();
      }).catch((error) => {
        reject(axiosErrorToString(error));
      });
    });
  },
  logout: function () {
    setAuthToken(null);
  },
  getUser: function () {
    return getUserFromToken(getAuthToken());
  },
};
