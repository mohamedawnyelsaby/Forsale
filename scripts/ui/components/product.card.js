// PATH: scripts/ui/components/product.card.js

import { addToCart } from "../../modules/cart/cart.actions.js";

export function ProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const title = document.createElement("h3");
  title.textContent = product.title;

  const price = document.createElement("p");
  price.textContent = `${product.price} PI`;

  const button = document.createElement("button");
  button.textContent = "Add to Cart";
  button.onclick = () => addToCart(product);

  card.append(title, price, button);

  return card;
}
