import axios from 'axios';
import jwtDecode from 'jwt-decode';

import store from './store';

const TOKEN_STORAGE_KEY = 'authToken';

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

function getUserFromToken(authToken) {
  if (!authToken) {
    return null;
  }

  let decoded = jwtDecode(authToken);

  // Check for an expired token.
  if (Date.now() / 1000 > decoded.exp) {
    return null;
  }

  let user = decoded.user;
  user.createdAt = new Date(user.createdAt);
  user.username = decoded.sub;
  return user;
}

function setAuthToken(authToken) {
  if (authToken) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  updateHeader();
  store.commit('setUser', getUserFromToken(authToken));
}

export default {
  register: function (invite, username, password, email, loader) {
    let payload = { invite, username, password, email };
    return axios.post('/api/register', payload, { loader });
  },
  verifyEmail: function (token, loader) {
    return axios.post('/api/verify-email', { token }, { loader })
      .then((res) => {
        setAuthToken(res.data.authToken);
      });
  },
  login: function (username, password, loader) {
    let payload = { username, password };
    return axios.post('/api/login', payload, { loader }).then((res) => {
      setAuthToken(res.data.authToken);
    });
  },
  logout: function () {
    setAuthToken(null);
  },
  forgotPassword: function (email, loader) {
    return axios.post('/api/forgot-password', { email }, { loader });
  },
  resetPassword: function (token, password, loader) {
    let payload = { token, password };
    return axios.post('/api/reset-password', payload, { loader })
      .then((res) => {
        setAuthToken(res.data.authToken);
      });
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
