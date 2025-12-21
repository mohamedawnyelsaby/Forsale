// PATH: scripts/modules/products/product-details.ui.js

import { ProductsStore } from "./products.store.js";

export function renderProductDetails(container, productId) {
  const product = ProductsStore.get().find(p => p.id === productId);

  if (!product) {
    container.innerHTML = `<p>Product not found</p>`;
    return;
  }

  container.innerHTML = `
    <section class="product-details">
      <img src="${product.image}" alt="${product.title}" />
      <h2>${product.title}</h2>
      <p>Price: ${product.price} ${product.currency}</p>

      <button id="buy-with-pi">Buy with Pi</button>
    </section>
  `;
}
