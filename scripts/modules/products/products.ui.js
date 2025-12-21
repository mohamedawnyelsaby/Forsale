// PATH: scripts/modules/products/products.ui.js

import { ProductsStore } from "./products.store.js";
import { addToCart } from "../cart/cart.actions.js";

export function renderProductsList(container) {
  const products = ProductsStore.get();

  if (!products.length) {
    container.innerHTML = `<p>No products available</p>`;
    return;
  }

  container.innerHTML = `
    <ul class="products-list">
      ${products
        .map(
          (p) => `
          <li class="product-card" data-id="${p.id}">
            <img src="${p.image}" alt="${p.title}" />
            <h3>${p.title}</h3>
            <p>${p.price} ${p.currency}</p>
            <button data-action="add-to-cart">Add to Cart</button>
            <button data-action="view">View</button>
          </li>
        `
        )
        .join("")}
    </ul>
  `;

  // Handle Add to Cart
  container.querySelectorAll("[data-action='add-to-cart']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const card = e.target.closest(".product-card");
      const productId = card.dataset.id;
      const product = products.find((p) => p.id === productId);

      if (product) addToCart(product);
    });
  });
}
