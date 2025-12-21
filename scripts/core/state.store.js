// PATH: scripts/core/state.store.js

export const UIState = {
    isAuthenticated: false,
    activeScreen: "auth",

    init() {
        this.sync();
    },

    set(key, value) {
        this[key] = value;
        this.sync();
    },

    sync() {
        document.getElementById("auth-container").style.display =
            this.isAuthenticated ? "none" : "flex";

        document.getElementById("app-container").style.display =
            this.isAuthenticated ? "block" : "none";
    }
};
