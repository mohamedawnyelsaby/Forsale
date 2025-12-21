// PATH: scripts/modules/cart.module.js

export const Cart = {
    items: [],

    add(product) {
        this.items.push(product);
    },

    remove(id) {
        this.items = this.items.filter(p => p.id !== id);
    },

    clear() {
        this.items = [];
    }
};
