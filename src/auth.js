import jwt_decode from 'jwt-decode';
import URLSearchParams from 'url-search-params';

const LOGIN_URL = '/api/login';
const REGISTER_URL = '/api/register';
const TOKEN_STORAGE_KEY = 'auth_token';

function setAuthToken(auth_token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, auth_token);
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
    context.$http.post(REGISTER_URL, payload).then(response => {
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
    context.$http.post(LOGIN_URL, payload).then(response => {
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
  getUsername: function () {
    let auth_token = getAuthToken();
    if (!auth_token) {
      return '';
    }
    return jwt_decode(auth_token).sub || '';
  },
};
