// PATH: scripts/modules/auth.module.js

import { UIState } from "../core/state.store.js";

export const Auth = {
    login() {
        UIState.set("isAuthenticated", true);
    },

    logout() {
        UIState.set("isAuthenticated", false);
    }
};
