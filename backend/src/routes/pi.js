import express from "express";
import axios from "axios";

const router = express.Router();

const PI_API = "https://api.minepi.com";
const PI_API_KEY = process.env.PI_API_KEY;

// 1️⃣ Create Payment
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, memo, metadata, uid } = req.body;

    const response = await axios.post(
      `${PI_API}/v2/payments`,
      {
        amount,
        memo,
        metadata: { ...metadata, uid }
      },
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // هنا المفروض نسجل payment_id في DB (PENDING)
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});


// 2️⃣ Pi Callback (VERY IMPORTANT)
router.post("/callback", async (req, res) => {
  try {
    const payment = req.body;

    /*
      payment.status:
      - initiated
      - completed
      - cancelled
      - failed
    */

    if (payment.status === "completed") {
      // ✅ VERIFY from Pi server
      const verify = await axios.get(
        `${PI_API}/v2/payments/${payment.identifier}`,
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`
          }
        }
      );

      if (verify.data.status === "completed") {
        // هنا تسجل SUCCESS في DB
        console.log("Payment confirmed:", payment.identifier);
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Callback error", err.message);
    res.status(500).send("Error");
  }
});

export default router;
