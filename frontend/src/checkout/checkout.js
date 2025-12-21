// frontend/src/checkout/checkout.js

import { getCart, clearCart } from "../cart/cart.js";
import { createPiPayment } from "../pi/pi-payment.js";

export async function startCheckout() {
  const cart = getCart();

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Pi Testnet payment
  await createPiPayment({
    amount: total,
    memo: "Forsale Checkout",
    metadata: {
      items: cart.map((i) => i.id),
    },
  });

  clearCart();
}
