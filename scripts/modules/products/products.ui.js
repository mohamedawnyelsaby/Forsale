// PATH: scripts/modules/products/products.ui.js

import { ProductsStore } from "./products.store.js";

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
            <button data-action="view">View</button>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}
