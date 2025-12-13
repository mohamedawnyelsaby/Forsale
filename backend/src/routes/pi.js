import express from "express";
import axios from "axios";
import crypto from "crypto";
import ordersStore from "./orders.js"; 
// لو orders.js مش عامل export default عدلها وقولي

const router = express.Router();

const PI_API = "https://api.minepi.com";
const PI_API_KEY = process.env.PI_API_KEY;

/**
 * 🧠 In-memory lock (MVP)
 * في production الحقيقي → DB lock
 */
const processingPayments = new Set();

/**
 * 1️⃣ CREATE PAYMENT + ORDER
 */
router.post("/create-payment", async (req, res) => {
  try {
    const { productId, amount, memo, uid } = req.body;

    if (!productId || !amount) {
      return res.status(400).json({ error: "Missing product data" });
    }

    // 🔐 Generate Order ID
    const orderId = crypto.randomUUID();

    // 📝 Create Order (PENDING)
    ordersStore.create({
      id: orderId,
      productId,
      amount,
      uid,
      status: "PENDING",
      createdAt: new Date()
    });

    // 💳 Create Pi Payment
    const response = await axios.post(
      `${PI_API}/v2/payments`,
      {
        amount,
        memo,
        metadata: {
          orderId,
          productId,
          uid
        }
      },
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 🔗 Save payment identifier
    ordersStore.attachPayment(orderId, response.data.identifier);

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

/**
 * 2️⃣ PI CALLBACK (ANTI DOUBLE PAYMENT)
 */
router.post("/callback", async (req, res) => {
  try {
    const payment = req.body;
    const paymentId = payment.identifier;

    if (!paymentId) return res.status(400).send("Invalid payload");

    // 🔒 Prevent double processing
    if (processingPayments.has(paymentId)) {
      return res.status(200).send("Already processing");
    }
    processingPayments.add(paymentId);

    // 🔍 Verify from Pi
    const verify = await axios.get(
      `${PI_API}/v2/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`
        }
      }
    );

    const verified = verify.data;

    if (verified.status === "completed") {
      const orderId = verified.metadata?.orderId;

      if (!orderId) {
        console.error("Order ID missing in metadata");
        return res.status(400).send("Order not found");
      }

      const order = ordersStore.get(orderId);

      if (!order) {
        console.error("Order not found:", orderId);
        return res.status(404).send("Order not found");
      }

      // 🛑 Double payment protection
      if (order.status === "PAID") {
        return res.status(200).send("Order already paid");
      }

      // ✅ Mark order as PAID
      ordersStore.markPaid(orderId, paymentId, verified.txid);

      console.log("✅ Order paid:", orderId);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback error:", err.message);
    res.status(500).send("Error");
  } finally {
    processingPayments.clear();
  }
});

export default router;
