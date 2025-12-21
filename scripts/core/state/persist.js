// PATH: scripts/core/state/persist.js

const STORAGE_KEY = "forsale_state_v1";

export const StatePersist = {
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("State persist failed", e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
