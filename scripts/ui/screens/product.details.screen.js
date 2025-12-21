// PATH: scripts/ui/screens/product.details.screen.js

import { addToCart } from "../../modules/cart/cart.actions.js";

export function ProductDetailsScreen(product) {
  const container = document.createElement("div");
  container.className = "product-details";

  const title = document.createElement("h2");
  title.textContent = product.title;

  const description = document.createElement("p");
  description.textContent = product.description || "";

  const price = document.createElement("strong");
  price.textContent = `${product.price} PI`;

  const button = document.createElement("button");
  button.textContent = "Add to Cart";
  button.onclick = () => addToCart(product);

  container.append(title, description, price, button);

  return container;
}
