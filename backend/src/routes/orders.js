import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const orders = [];

router.post("/", (req, res) => {
  const { productId, amount, uid } = req.body;

  if (!productId || !amount) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const order = {
    id: uuidv4(),
    productId,
    amount,
    uid,
    status: "PENDING",
    createdAt: new Date(),
  };

  orders.push(order);
  res.json(order);
});

export default router;
