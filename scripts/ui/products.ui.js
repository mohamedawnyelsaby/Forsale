// PATH: scripts/ui/products.ui.js

import { Products } from "../modules/products.module.js";
import { Cart } from "../modules/cart.module.js";
import I18N from "../../i18n/loader.js";

export const ProductsUI = {
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const products = Products.load();
        container.innerHTML = "";

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card glass-panel";

            const title = document.createElement("h3");
            title.textContent = I18N.t(product.titleKey);

            const price = document.createElement("p");
            price.textContent = `${product.price} ${product.currency}`;

            const btn = document.createElement("button");
            btn.className = "main-btn";
            btn.setAttribute("data-i18n", "action.add_to_cart");
            btn.addEventListener("click", () => Cart.add(product));

            card.append(title, price, btn);
            container.appendChild(card);
        });

        I18N.apply();
    }
};
