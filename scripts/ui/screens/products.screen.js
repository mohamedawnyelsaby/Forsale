// PATH: scripts/ui/screens/products.screen.js

import { renderProductsList } from "../../modules/products/products.ui.js";
import { renderProductDetails } from "../../modules/products/product-details.ui.js";
import { Store } from "../../core/state/store.js";

export function ProductsScreen(container) {
  container.innerHTML = `
    <section class="screen">
      <h1>Marketplace</h1>
      <div id="products-view"></div>
    </section>
  `;

  const view = container.querySelector("#products-view");

  // Initial render
  renderProductsList(view);

  // Reactive updates
  const unsubscribe = Store.subscribe(() => {
    renderProductsList(view);
  });

  // Handle click (details)
  view.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = card.dataset.id;
    renderProductDetails(view, productId);
  });

  // Cleanup (future-safe)
  container.addEventListener("screen:destroy", unsubscribe, { once: true });
}
