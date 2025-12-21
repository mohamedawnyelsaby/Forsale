// PATH: scripts/core/router.ui.js

export const UIRouter = {
    screens: {},

    register(id) {
        const el = document.getElementById(id);
        if (el) this.screens[id] = el;
    },

    show(id) {
        Object.values(this.screens).forEach(screen => {
            screen.style.display = "none";
        });

        if (this.screens[id]) {
            this.screens[id].style.display = "block";
        }
    },

    init() {
        this.register("home-screen");
        this.register("search-screen");
        this.register("profile-screen");

        this.show("home-screen");
    }
};
