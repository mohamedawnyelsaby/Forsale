// PATH: scripts/ui/screens/cart.screen.js

import {
  selectCartItems,
  selectCartTotal,
  isCartEmpty
} from "../../modules/cart/cart.selectors.js";

import {
  addToCart,
  removeFromCart,
  clearCart
} from "../../modules/cart/cart.actions.js";

import { subscribeCart } from "../../modules/cart/cart.store.js";
import { startCheckout } from "../../modules/checkout/checkout.controller.js";

export function CartScreen(container) {
  container.innerHTML = `
    <section class="screen">
      <h1>Your Cart</h1>
      <div id="cart-content"></div>
    </section>
  `;

  const content = container.querySelector("#cart-content");

  function render() {
    if (isCartEmpty()) {
      content.innerHTML = `<p>Your cart is empty</p>`;
      return;
    }

    const items = selectCartItems();
    const total = selectCartTotal();

    content.innerHTML = `
      <ul class="cart-list">
        ${items
          .map(
            (i) => `
          <li class="cart-item">
            <span>${i.title}</span>

            <div class="qty">
              <button data-action="dec" data-id="${i.id}">-</button>
              <span>${i.qty}</span>
              <button data-action="inc" data-id="${i.id}">+</button>
            </div>

            <strong>${i.price * i.qty} PI</strong>
          </li>
        `
          )
          .join("")}
      </ul>

      <div class="cart-total">
        <strong>Total: ${total} PI</strong>
      </div>

      <button id="checkout-btn">Checkout with Pi</button>
      <button id="clear-cart">Clear Cart</button>
    `;
  }

  // Initial render
  render();

  // Reactive updates
  const unsubscribe = subscribeCart(render);

  // UI actions
  content.addEventListener("click", async (e) => {
    const btn = e.target;
    const id = btn.dataset.id;

    if (btn.dataset.action === "inc") {
      const item = selectCartItems().find(i => i.id === id);
      if (item) addToCart(item);
    }

    if (btn.dataset.action === "dec") {
      removeFromCart(id);
    }

    if (btn.id === "clear-cart") {
      clearCart();
    }

    if (btn.id === "checkout-btn") {
      btn.disabled = true;
      btn.textContent = "Processing...";

      try {
        await startCheckout();
        alert("Payment successful");
        clearCart();
      } catch (err) {
        console.error(err);
        alert("Payment failed or cancelled");
      } finally {
        btn.disabled = false;
        btn.textContent = "Checkout with Pi";
      }
    }
  });

  // Cleanup
  container.addEventListener(
    "screen:destroy",
    () => unsubscribe(),
    { once: true }
  );
}
