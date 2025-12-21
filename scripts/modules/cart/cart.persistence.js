// PATH: scripts/modules/cart/cart.persistence.js

import { setCartState } from "./cart.store.js";

const STORAGE_KEY = "forsale_cart";

export function persistCart() {
  try {
    const state = JSON.stringify(localStorage.getItem(STORAGE_KEY));
    localStorage.setItem(STORAGE_KEY, state);
  } catch {}
}

export function restoreCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const state = JSON.parse(raw);
    setCartState(state);
  } catch {}
}
