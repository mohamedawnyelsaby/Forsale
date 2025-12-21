// PATH: scripts/modules/cart/cart.pi.js

import { getCartState } from "./cart.store.js";

export function preparePiPaymentPayload() {
  const cart = getCartState();

  return {
    amount: cart.total,
    memo: "Forsale marketplace purchase",
    metadata: {
      items: cart.items.map(i => ({
        id: i.id,
        qty: i.qty
      }))
    }
  };
}
