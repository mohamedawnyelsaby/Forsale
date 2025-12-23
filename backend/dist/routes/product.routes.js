"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/category/:category', productController.getByCategory);
router.get('/:id', productController.getById);
router.post('/', auth_1.authenticate, (0, validate_1.validate)(product_validator_1.createProductSchema), productController.create);
router.put('/:id', auth_1.authenticate, (0, validate_1.validate)(product_validator_1.updateProductSchema), productController.update);
router.delete('/:id', auth_1.authenticate, productController.delete);
router.get('/seller/me', auth_1.authenticate, productController.getMyProducts);
exports.default = router;
//# sourceMappingURL=product.routes.js.map