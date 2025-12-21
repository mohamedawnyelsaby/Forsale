// PATH: scripts/modules/cart/cart.actions.js

import { getCartState, setCartState } from "./cart.store.js";
import { persistCart } from "./cart.persistence.js";

export function addToCart(product) {
  const cart = getCartState();

  const existing = cart.items.find(i => i.id === product.id);

  let items;
  if (existing) {
    items = cart.items.map(i =>
      i.id === product.id ? { ...i, qty: i.qty + 1 } : i
    );
  } else {
    items = [...cart.items, { ...product, qty: 1 }];
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  setCartState({ ...cart, items, total });
  persistCart();
}

export function removeFromCart(productId) {
  const cart = getCartState();

  const items = cart.items.filter(i => i.id !== productId);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  setCartState({ ...cart, items, total });
  persistCart();
}

export function clearCart() {
  setCartState({ items: [], total: 0, currency: "PI" });
  persistCart();
}
