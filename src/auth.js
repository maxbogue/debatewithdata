/**
 * This module handles getting and setting of authentication tokens and user
 * data from localStorage.
 */

import jwtDecode from 'jwt-decode';

const TOKEN_STORAGE_KEY = 'authToken';

function getAuthToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
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
}

function getUser() {
  let token = getAuthToken();
  let user = getUserFromToken(token);
  if (token && !user) {
    // Token must be expired.
    setAuthToken(null);
  }
  return user;
}

export default { getAuthToken, getUser, setAuthToken };
