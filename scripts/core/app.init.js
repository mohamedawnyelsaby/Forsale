// PATH: scripts/core/app.init.js

import { Router } from "./router.js";

// State
import { bootstrapState } from "./state/bootstrap.js";

// Screens
import { HomeScreen } from "../ui/screens/home.screen.js";
import { ProductsScreen } from "../ui/screens/products.screen.js";
import { ProfileScreen } from "../ui/screens/profile.screen.js";

// UI
import { MainTabs } from "../ui/tabs/main.tabs.js";

export function initApp() {
  // 1️⃣ Restore persisted state (auth, products, etc.)
  bootstrapState();

  // 2️⃣ App root
  const root = document.getElementById("root");
  const app = document.createElement("div");
  app.id = "app";

  root.appendChild(app);
  root.appendChild(MainTabs());

  // 3️⃣ Routes
  Router.register("/home", HomeScreen);
  Router.register("/products", ProductsScreen);
  Router.register("/profile", ProfileScreen);

  // 4️⃣ Start app
  Router.start("/home");
}
