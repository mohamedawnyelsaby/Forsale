const express = require("express");
const router = express.Router();

/**
 * منتجات تجريبية (بعد كده DB)
 */
const products = [
  {
    id: "P1",
    title: "iPhone 15 Pro (Titanium)",
    price_pi: 105000
  },
  {
    id: "P2",
    title: "MacBook Air M3",
    price_pi: 185000
  }
];

router.get("/", (req, res) => {
  res.json(products);
});

module.exports = router;
