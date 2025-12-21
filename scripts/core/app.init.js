// PATH: scripts/core/app.init.js

import { UIState } from "./state.store.js";
import { UIRouter } from "./router.ui.js";
import { Tabs } from "../ui/tabs.ui.js";
import { ProductsUI } from "../ui/products.ui.js";

export const App = {
    start() {
        UIState.init();
        UIRouter.init();
        Tabs.init();
        ProductsUI.init("home-screen");
    }
};
