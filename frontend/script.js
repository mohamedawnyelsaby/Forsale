/************************
 * GLOBAL CONFIG
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
let activeOrderId = null;
let paymentInProgress = false;

/************************
 * PI CHECK
 ************************/
function isPiBrowser() {
  return typeof window.Pi !== "undefined";
}

/************************
 * PRODUCT DETAILS
 ************************/
function openProductDetail(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  selectedProduct = product;

  document.getElementById("detail-title").innerText = product.name;
  document.getElementById("detail-price").innerText =
    product.price.toLocaleString() + " Pi";

  document.getElementById("product-detail-modal").style.display = "block";
}

/************************
 * START PAYMENT (FROM PRODUCT PAGE)
 ************************/
async function startProductPayment() {
  if (paymentInProgress) {
    alert("⚠️ عملية دفع جارية بالفعل");
    return;
  }

  if (!isPiBrowser()) {
    alert("⚠️ افتح التطبيق من Pi Browser");
    return;
  }

  if (!selectedProduct) {
    alert("❌ لم يتم اختيار منتج");
    return;
  }

  try {
    paymentInProgress = true;
    disableBuyButton(true);

    // 1️⃣ Create Order (pending)
    const orderRes = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        amount: selectedProduct.price
      })
    });

    if (!orderRes.ok) throw new Error("Order creation failed");

    const order = await orderRes.json();
    activeOrderId = order._id;

    // 2️⃣ Start Pi Payment
    await payWithPi(order);

  } catch (err) {
    console.error(err);
    alert("❌ فشل بدء الدفع");
    resetPaymentState();
  }
}

/************************
 * PI PAYMENT
 ************************/
async function payWithPi(order) {
  const res = await fetch(`${API_BASE}/api/pi/create-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: order.amount,
      memo: `Forsale Order ${order._id}`,
      metadata: {
        orderId: order._id
      }
    })
  });

  if (!res.ok) throw new Error("Payment creation failed");

  const payment = await res.json();

  Pi.createPayment(
    {
      identifier: payment.identifier,
      amount: payment.amount,
      memo: payment.memo,
      metadata: payment.metadata
    },
    {
      onReadyForServerApproval: async paymentId => {
        await fetch(`${API_BASE}/api/pi/approve-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        await fetch(`${API_BASE}/api/pi/complete-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            txid,
            orderId: order._id
          })
        });

        alert("✅ تم الدفع بنجاح");
        resetPaymentState();
        closeProductDetailModal();
      },

      onCancel: () => {
        alert("❌ تم إلغاء الدفع");
        resetPaymentState();
      },

      onError: err => {
        console.error(err);
        alert("⚠️ خطأ أثناء الدفع");
        resetPaymentState();
      }
    }
  );
}

/************************
 * UI HELPERS
 ************************/
function disableBuyButton(state) {
  const btn = document.querySelector(".buy-btn");
  if (!btn) return;
  btn.disabled = state;
  btn.style.opacity = state ? "0.5" : "1";
}

function resetPaymentState() {
  paymentInProgress = false;
  activeOrderId = null;
  disableBuyButton(false);
}
