// PATH: scripts/modules/products/product-details.ui.js

import { ProductsStore } from "./products.store.js";
import { addToCart } from "../cart/cart.actions.js";

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

      <button id="add-to-cart">Add to Cart</button>
      <button id="back-to-list">Back</button>
    </section>
  `;

  container.querySelector("#add-to-cart").onclick = () => {
    addToCart(product);
  };

  container.querySelector("#back-to-list").onclick = () => {
    container.innerHTML = "";
    const event = new Event("screen:destroy");
    container.dispatchEvent(event);
  };
}
