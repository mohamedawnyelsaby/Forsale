// PATH: scripts/ui/tabs/main.tabs.js

import { Router } from "../../core/router.js";

export function MainTabs() {
  const tabs = document.createElement("nav");
  tabs.className = "tabs";

  tabs.innerHTML = `
    <button data-route="/home">Home</button>
    <button data-route="/products">Market</button>
    <button data-route="/profile">Profile</button>
  `;

  tabs.addEventListener("click", (e) => {
    const route = e.target.dataset.route;
    if (route) Router.navigate(route);
  });

  return tabs;
}
