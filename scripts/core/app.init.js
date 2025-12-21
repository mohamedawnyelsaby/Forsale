// PATH: scripts/core/app.init.js

import { UIState } from "./state.store.js";
import { UIRouter } from "./router.ui.js";

export const App = {
    start() {
        UIState.init();
        UIRouter.init();
    }
};
