// PATH: scripts/modules/products/products.seed.js

import { ProductsStore } from "./products.store.js";

export function seedProducts() {
  ProductsStore.set([
    {
      id: "p1",
      title: "Sample Product",
      price: 10,
      currency: "PI",
      image: "/assets/sample.png"
    }
  ]);
}
