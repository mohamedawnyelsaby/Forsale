// PATH: scripts/modules/products/products.repository.js

import { Product } from "./product.model.js";

const products = [
  new Product({
    id: "p1",
    title: "Sample Product",
    price: 10,
    currency: "PI",
    image: "/assets/sample.png",
    sellerId: "u1"
  })
];

export const ProductsRepository = {
  getAll() {
    return [...products];
  },

  getById(id) {
    return products.find(p => p.id === id) || null;
  }
};
