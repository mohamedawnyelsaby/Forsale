// PATH: scripts/modules/checkout/checkout.controller.js

import { selectCartTotal } from "../cart/cart.selectors.js";
import { preparePiPaymentPayload } from "../cart/cart.pi.js";
import { PiClient } from "../pi/pi.client.js";
import { apiFetch } from "../../core/api/api.client.js";

export async function startCheckout() {
  // 1️⃣ Pi Login
  const auth = await PiClient.login();

  // 2️⃣ Create payment on server
  const paymentPayload = preparePiPaymentPayload();

  const payment = await apiFetch("/payments/create", {
    method: "POST",
    body: JSON.stringify({
      amount: paymentPayload.amount,
      memo: paymentPayload.memo,
      metadata: paymentPayload.metadata,
      piUser: auth.user.uid
    })
  });

  // 3️⃣ Approve payment in Pi Browser
  const approval = await window.Pi.createPayment(
    {
      amount: payment.amount,
      memo: payment.memo,
      metadata: payment.metadata
    },
    {
      onReadyForServerApproval: async (paymentId) => {
        await apiFetch("/payments/approve", {
          method: "POST",
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        await apiFetch("/payments/complete", {
          method: "POST",
          body: JSON.stringify({ paymentId, txid })
        });
      },

      onCancel: () => {
        console.warn("Payment cancelled");
      },

      onError: (err) => {
        console.error("Payment error", err);
      }
    }
  );

  return approval;
}
