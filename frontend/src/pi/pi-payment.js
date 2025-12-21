// frontend/src/pi/pi-payment.js

export async function createPiPayment({ amount, memo, metadata }) {
  if (!window.Pi) {
    alert("Pi SDK not found");
    return;
  }

  try {
    const payment = await window.Pi.createPayment(
      {
        amount,
        memo,
        metadata,
      },
      {
        onReadyForServerApproval(paymentId) {
          console.log("Ready for server approval:", paymentId);

          fetch("/api/pi/approve-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId }),
          });
        },

        onReadyForServerCompletion(paymentId, txid) {
          console.log("Payment completed:", paymentId, txid);

          fetch("/api/pi/complete-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId, txid }),
          });
        },

        onCancel() {
          alert("Payment cancelled");
        },

        onError(error) {
          console.error("Pi payment error", error);
          alert("Payment failed");
        },
      }
    );

    return payment;
  } catch (err) {
    console.error(err);
    alert("Pi payment error");
  }
}
