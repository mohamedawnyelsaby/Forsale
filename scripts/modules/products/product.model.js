// PATH: scripts/modules/products/product.model.js

export class Product {
  constructor({ id, title, price, currency, image, sellerId }) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.currency = currency;
    this.image = image;
    this.sellerId = sellerId;
  }
}
