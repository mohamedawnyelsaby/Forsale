// PATH: scripts/modules/products/products.store.js

import { Store } from "../../core/state/store.js";

const KEY = "products";

export const ProductsStore = {
  set(products) {
    Store.setState({
      [KEY]: products
    });
  },

  get() {
    return Store.getState()[KEY] || [];
  },

  clear() {
    Store.setState({ [KEY]: [] });
  }
};
