import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * 🧠 In-memory Orders Store (MVP)
 * Production حقيقي = Database
 */
const orders = [];

/**
 * 🔹 Create Order
 */
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
    paymentId: null,
    txid: null,
    createdAt: new Date()
  };

  orders.push(order);
  res.json(order);
});

/* =========================
   INTERNAL STORE FUNCTIONS
========================= */

function create(data) {
  orders.push(data);
  return data;
}

function attachPayment(orderId, paymentId) {
  const order = orders.find(o => o.id === orderId);
  if (order) order.paymentId = paymentId;
}

function get(orderId) {
  return orders.find(o => o.id === orderId);
}

function markPaid(orderId, paymentId, txid) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  if (order.status === "PAID") return order;

  order.status = "PAID";
  order.paymentId = paymentId;
  order.txid = txid;
  order.paidAt = new Date();

  return order;
}

export default {
  router,
  create,
  attachPayment,
  get,
  markPaid
};
