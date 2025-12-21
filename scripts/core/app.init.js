// PATH: scripts/core/app.init.js

import { Router } from "./router.js";

import { HomeScreen } from "../ui/screens/home.screen.js";
import { ProductsScreen } from "../ui/screens/products.screen.js";
import { ProfileScreen } from "../ui/screens/profile.screen.js";

import { MainTabs } from "../ui/tabs/main.tabs.js";

export function initApp() {
  const root = document.getElementById("root");
  const app = document.createElement("div");
  app.id = "app";

  root.appendChild(app);
  root.appendChild(MainTabs());

  Router.register("/home", HomeScreen);
  Router.register("/products", ProductsScreen);
  Router.register("/profile", ProfileScreen);

  Router.start("/home");
}
