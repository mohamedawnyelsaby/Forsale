/***********************
 * GLOBAL CONFIG
 ***********************/
const API_BASE = "https://forsale-production.up.railway.app";

/***********************
 * BASIC HELPERS
 ***********************/
function isPiBrowser() {
  return typeof window.Pi !== "undefined";
}

/***********************
 * CHECKOUT FLOW
 ***********************/
async function checkout() {
  if (!isPiBrowser()) {
    alert("⚠️ افتح التطبيق من Pi Browser لإتمام الدفع");
    return;
  }

  try {
    // بيانات المنتج (مؤقتًا – بعدين هتيجي من state / backend)
    const product = {
      productId: "P1",
      title: "iPhone 15 Pro (Titanium)",
      amount: 105000
    };

    await payWithPi(product);
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء بدء عملية الدفع");
  }
}

/***********************
 * PI PAYMENT
 ***********************/
async function payWithPi(product) {
  // 1️⃣ اطلب من السيرفر إنشاء عملية الدفع
  const res = await fetch(`${API_BASE}/api/pi/create-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: product.amount,
      memo: `Forsale | ${product.title}`,
      metadata: {
        productId: product.productId
      }
    })
  });

  if (!res.ok) {
    throw new Error("Failed to create payment");
  }

  const payment = await res.json();

  // 2️⃣ افتح واجهة الدفع الرسمية من Pi
  Pi.createPayment(
    {
      identifier: payment.identifier,
      amount: payment.amount,
      memo: payment.memo,
      metadata: payment.metadata
    },
    {
      onReadyForServerApproval: async function (paymentId) {
        console.log("🟡 Ready for approval:", paymentId);

        await fetch(`${API_BASE}/api/pi/approve-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: async function (paymentId, txid) {
        console.log("🟢 Ready for completion:", paymentId, txid);

        await fetch(`${API_BASE}/api/pi/complete-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        });

        alert("✅ تم الدفع بنجاح! الطلب قيد المعالجة");
        closeCheckoutModal();
      },

      onCancel: function (paymentId) {
        console.log("🔴 Payment cancelled:", paymentId);
        alert("تم إلغاء عملية الدفع");
      },

      onError: function (error, payment) {
        console.error("❌ Pi Error:", error, payment);
        alert("حدث خطأ أثناء الدفع");
      }
    }
  );
}

/***********************
 * UI FUNCTIONS (أمثلة)
 ***********************/
function openCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "block";
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none";
}
