// PATH: scripts/core/router.js

const routes = {};
let currentScreen = null;

export const Router = {
  register(path, renderFn) {
    routes[path] = renderFn;
  },

  navigate(path) {
    if (!routes[path]) {
      console.warn(`Route not found: ${path}`);
      return;
    }

    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = "";
    currentScreen = path;
    routes[path](app);
  },

  start(defaultPath) {
    this.navigate(defaultPath);
  },

  getCurrent() {
    return currentScreen;
  }
};
