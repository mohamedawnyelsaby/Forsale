// PATH: scripts/ui/tabs.ui.js

import { UIRouter } from "../core/router.ui.js";

export const Tabs = {
    init() {
        document.querySelectorAll("[data-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-tab");
                UIRouter.show(target);
            });
        });
    }
};
