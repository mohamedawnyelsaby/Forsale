// PATH: scripts/modules/products.module.js

export const Products = {
    list: [],

    load() {
        // Mock data (replace later with API)
        this.list = [
            {
                id: "p1",
                titleKey: "product.sample.title",
                price: 25,
                currency: "PI",
                image: ""
            }
        ];
        return this.list;
    },

    getById(id) {
        return this.list.find(p => p.id === id);
    }
};
