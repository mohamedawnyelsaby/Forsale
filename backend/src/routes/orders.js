const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

/**
 * 🧠 In-memory Orders Store (MVP)
 * Production حقيقي = Database
 */
const orders = [];

/**
 * 🔹 Create Order (manual – optional)
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

/**
 * ============================
 * 🔧 INTERNAL STORE FUNCTIONS
 * ============================
 */

/**
 * Create order from Pi flow
 */
function create(data) {
  orders.push(data);
  return data;
}

/**
 * Attach Pi payment identifier
 */
function attachPayment(orderId, paymentId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.paymentId = paymentId;
  }
}

/**
 * Get order by ID
 */
function get(orderId) {
  return orders.find(o => o.id === orderId);
}

/**
 * Mark order as PAID (ANTI DOUBLE PAYMENT)
 */
function markPaid(orderId, paymentId, txid) {
  const order = orders.find(o => o.id === orderId);

  if (!order) return null;

  if (order.status === "PAID") {
    return order; // 🛑 already paid
  }

  order.status = "PAID";
  order.paymentId = paymentId;
  order.txid = txid;
  order.paidAt = new Date();

  return order;
}

module.exports = {
  router,
  create,
  attachPayment,
  get,
  markPaid
};
