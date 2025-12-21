// PATH: i18n/loader.js

const I18N = {
    currentLang: "en",
    dictionary: {},

    async load(lang) {
        this.currentLang = lang;

        const response = await fetch(`./i18n/${lang}.json`);
        this.dictionary = await response.json();

        this.apply();
        this.applyDirection();
    },

    t(key) {
        return this.dictionary[key] || key;
    },

    apply() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            el.textContent = this.t(key);
        });
    },

    applyDirection() {
        document.documentElement.dir = this.currentLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = this.currentLang;
    }
};

export default I18N;
