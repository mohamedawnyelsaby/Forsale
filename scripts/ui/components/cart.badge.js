// PATH: scripts/ui/components/cart.badge.js

import { selectCartItems } from "../../modules/cart/cart.selectors.js";
import { subscribeCart } from "../../modules/cart/cart.store.js";

export function CartBadge() {
  const badge = document.createElement("span");
  badge.className = "cart-badge";

  function update() {
    const items = selectCartItems();
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
  }

  update();
  subscribeCart(update);

  return badge;
}
