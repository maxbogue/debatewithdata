/**
 * This module handles getting and setting of authentication tokens and user
 * data from localStorage.
 */

import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const SESSION_COOKIE_NAME = 'session';

function setAuthToken(authToken) {
  if (authToken) {
    let encodedSession = window.btoa(JSON.stringify({ authToken }));
    Cookies.set(SESSION_COOKIE_NAME, encodedSession);
  } else {
    Cookies.remove(SESSION_COOKIE_NAME);
  }
}

function getAuthToken() {
  let encodedSession = Cookies.get(SESSION_COOKIE_NAME);
  if (!encodedSession) {
    return '';
  }
  let session = JSON.parse(window.atob(encodedSession));
  return session && session.authToken || '';
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
