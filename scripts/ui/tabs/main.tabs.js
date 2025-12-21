// PATH: scripts/ui/tabs/main.tabs.js

import { Router } from "../../core/router.js";
import { CartBadge } from "../components/cart.badge.js";

export function MainTabs() {
  const tabs = document.createElement("nav");
  tabs.className = "tabs";

  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Home";
  homeBtn.dataset.route = "/home";

  const marketBtn = document.createElement("button");
  marketBtn.textContent = "Market";
  marketBtn.dataset.route = "/products";

  const cartBtn = document.createElement("button");
  cartBtn.dataset.route = "/cart";
  cartBtn.textContent = "Cart ";

  const badge = CartBadge();
  cartBtn.appendChild(badge);

  const profileBtn = document.createElement("button");
  profileBtn.textContent = "Profile";
  profileBtn.dataset.route = "/profile";

  tabs.append(homeBtn, marketBtn, cartBtn, profileBtn);

  tabs.addEventListener("click", (e) => {
    const route = e.target.closest("button")?.dataset.route;
    if (route) Router.navigate(route);
  });

  return tabs;
}
