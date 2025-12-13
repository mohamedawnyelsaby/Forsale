const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const orders = [];

router.post("/", (req, res) => {
  const { productId, amount } = req.body;

  if (!productId || !amount) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const order = {
    id: uuidv4(),
    productId,
    amount,
    status: "CREATED"
  };

  orders.push(order);

  res.json(order);
});

module.exports = router;
