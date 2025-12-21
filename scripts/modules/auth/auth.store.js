// PATH: scripts/modules/auth/auth.store.js

import { Store } from "../../core/state/store.js";

const AUTH_KEY = "auth";

export const AuthStore = {
  login(user, token) {
    Store.setState({
      [AUTH_KEY]: {
        user,
        token,
        authenticated: true
      }
    });
  },

  logout() {
    Store.setState({
      [AUTH_KEY]: {
        user: null,
        token: null,
        authenticated: false
      }
    });
  },

  get() {
    return Store.getState()[AUTH_KEY] || {
      user: null,
      token: null,
      authenticated: false
    };
  }
};
