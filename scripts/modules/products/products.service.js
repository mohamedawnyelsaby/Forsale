// PATH: scripts/modules/products/products.service.js

import { ProductsRepository } from "./products.repository.js";

export const ProductsService = {
  listProducts() {
    return ProductsRepository.getAll();
  },

  getProduct(productId) {
    return ProductsRepository.getById(productId);
  }
};
