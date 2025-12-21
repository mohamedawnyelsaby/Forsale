// PATH: scripts/core/app.init.js

import { Router } from "./router.js";

// State
import { bootstrapState } from "./state/bootstrap.js";

// Cart (restore persisted cart)
import { restoreCart } from "../modules/cart/cart.persistence.js";

// Products seed (temporary, API-ready)
import { seedProducts } from "../modules/products/products.seed.js";

// Screens
import { HomeScreen } from "../ui/screens/home.screen.js";
import { ProductsScreen } from "../ui/screens/products.screen.js";
import { ProfileScreen } from "../ui/screens/profile.screen.js";

// UI
import { MainTabs } from "../ui/tabs/main.tabs.js";

export function initApp() {
  // 1️⃣ Restore persisted global state
  bootstrapState();

  // 2️⃣ Restore cart from LocalStorage
  restoreCart();

  // 3️⃣ Seed initial products (will be removed when API is connected)
  seedProducts();

  // 4️⃣ App root
  const root = document.getElementById("root");
  const app = document.createElement("div");
  app.id = "app";

  root.appendChild(app);
  root.appendChild(MainTabs());

  // 5️⃣ Routes
  Router.register("/home", HomeScreen);
  Router.register("/products", ProductsScreen);
  Router.register("/profile", ProfileScreen);

  // 6️⃣ Start application
  Router.start("/home");
}
