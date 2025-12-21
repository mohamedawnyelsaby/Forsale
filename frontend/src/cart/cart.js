// frontend/src/cart/cart.js

let cart = [];

export function addToCart(product) {
  cart.push(product);
  renderCart();
}

export function getCart() {
  return cart;
}

export function clearCart() {
  cart = [];
  renderCart();
}

function renderCart() {
  const cartEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!cartEl || !totalEl) return;

  cartEl.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.price} Pi`;
    cartEl.appendChild(li);
  });

  totalEl.textContent = `${total} Pi`;
}

