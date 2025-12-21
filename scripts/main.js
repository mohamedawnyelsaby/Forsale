// PATH: scripts/main.js

import { App } from "./core/app.init.js";
import I18N from "../i18n/loader.js";

document.addEventListener("DOMContentLoaded", async () => {
    const lang = navigator.language.startsWith("ar") ? "ar" : "en";
    await I18N.load(lang);
    App.start();
});
