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

  // 1️⃣ Initial render
  renderProductsList(view);

  // 2️⃣ Reactive updates (ProductsStore → UI)
  const unsubscribe = Store.subscribe(() => {
    renderProductsList(view);
  });

  // 3️⃣ Handle product click → details
  view.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = card.dataset.id;
    renderProductDetails(view, productId);
  });

  // 4️⃣ Cleanup (future routing-safe)
  container.addEventListener(
    "screen:destroy",
    () => unsubscribe(),
    { once: true }
  );
}
