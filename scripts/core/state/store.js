// PATH: scripts/core/state/store.js

const listeners = new Set();

let state = {};

export const Store = {
  getState() {
    return { ...state };
  },

  setState(partial) {
    state = { ...state, ...partial };
    listeners.forEach(fn => fn(this.getState()));
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  reset() {
    state = {};
    listeners.forEach(fn => fn(this.getState()));
  }
};
