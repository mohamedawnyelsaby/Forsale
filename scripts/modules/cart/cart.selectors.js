// PATH: scripts/modules/cart/cart.selectors.js

import { getCartState } from "./cart.store.js";

export function selectCartItems() {
  return getCartState().items;
}

export function selectCartTotal() {
  return getCartState().total;
}

export function isCartEmpty() {
  return getCartState().items.length === 0;
}
