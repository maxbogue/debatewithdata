/**
 * This module handles getting and setting of authentication tokens and user
 * data from localStorage.
 */

import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const SESSION_COOKIE_NAME = 'session';

interface User {
  createdAt: Date;
  email: string;
  admin: boolean;
  username: string;
}

interface AuthToken {
  sub: string;
  exp: number;
  user: {
    createdAt: number;
    email: string;
    admin: boolean;
  };
}

export default abstract class Auth {
  public getUserFromToken(authToken: string): User | null {
    if (!authToken) {
      return null;
    }

    const decoded = jwtDecode<AuthToken>(authToken);

    // Check for an expired token.
    if (Date.now() / 1000 > decoded.exp) {
      return null;
    }

    return {
      ...decoded.user,
      createdAt: new Date(decoded.user.createdAt),
      username: decoded.sub,
    };
  }

  public getUser(): User | null {
    const token = this.getAuthToken();
    const user = this.getUserFromToken(token);
    if (token && !user) {
      // Token must be expired.
      this.setAuthToken('');
    }
    return user;
  }

  public abstract getAuthToken(): string;
  public abstract setAuthToken(authToken: string): void;
}

export class BrowserAuth extends Auth {
  public setAuthToken(authToken: string): void {
    if (authToken) {
      const encodedSession = window.btoa(JSON.stringify({ authToken }));
      Cookies.set(SESSION_COOKIE_NAME, encodedSession);
    } else {
      Cookies.remove(SESSION_COOKIE_NAME);
    }
  }

  public getAuthToken(): string {
    const encodedSession = Cookies.get(SESSION_COOKIE_NAME);
    if (!encodedSession) {
      return '';
    }
    const session = JSON.parse(window.atob(encodedSession));
    return (session && session.authToken) || '';
  }
}

export class ServerAuth extends Auth {
  constructor(public authToken: string) {
    super();
  }

  public setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  public getAuthToken(): string {
    return this.authToken;
  }
}
