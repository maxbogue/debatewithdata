/**
 * This module handles getting and setting of authentication tokens and user
 * data from localStorage.
 */

import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const SESSION_COOKIE_NAME = 'session';

class Auth {
  getUserFromToken(authToken) {
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

  getUser() {
    let token = this.getAuthToken();
    let user = this.getUserFromToken(token);
    if (token && !user) {
      // Token must be expired.
      setAuthToken(null);
    }
    return user;
  }
}

export class BrowserAuth extends Auth {
  setAuthToken(authToken) {
    if (authToken) {
      let encodedSession = window.btoa(JSON.stringify({ authToken }));
      Cookies.set(SESSION_COOKIE_NAME, encodedSession);
    } else {
      Cookies.remove(SESSION_COOKIE_NAME);
    }
  }

  getAuthToken() {
    let encodedSession = Cookies.get(SESSION_COOKIE_NAME);
    if (!encodedSession) {
      return '';
    }
    let session = JSON.parse(window.atob(encodedSession));
    return session && session.authToken || '';
  }
}

export class ServerAuth extends Auth {
  constructor(authToken) {
    super();
    this.authToken = authToken;
  }

  setAuthToken(authToken) {
    this.authToken = authToken;
  }

  getAuthToken() {
    return this.authToken;
  }
}
