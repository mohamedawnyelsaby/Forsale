/************************
 * GLOBAL CONFIG
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
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
 * START PAYMENT
 ************************/
async function startProductPayment() {
  if (paymentInProgress) {
    alert("⚠️ عملية دفع جارية بالفعل");
    return;
  }

  if (!isPiBrowser()) {
    alert("⚠️ افتح الموقع من Pi Browser");
    return;
  }

  if (!selectedProduct) {
    alert("❌ لم يتم اختيار منتج");
    return;
  }

  try {
    paymentInProgress = true;
    disableBuyButton(true);

    // ✅ Create payment (Order created automatically in backend)
    const res = await fetch(`${API_BASE}/api/pi/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        memo: `Forsale | ${selectedProduct.name}`
      })
    });

    if (!res.ok) {
      throw new Error("Payment creation failed");
    }

    const payment = await res.json();

    // ✅ Open Pi Payment UI
    Pi.createPayment(
      {
        identifier: payment.identifier,
        amount: payment.amount,
        memo: payment.memo,
        metadata: payment.metadata
      },
      {
        onReadyForServerApproval(paymentId) {
          console.log("🟡 Ready for approval:", paymentId);
        },

        onReadyForServerCompletion(paymentId, txid) {
          console.log("🟢 Payment completed:", paymentId, txid);
          alert("✅ تم الدفع بنجاح");
          resetPaymentState();
          closeProductDetailModal();
        },

        onCancel() {
          alert("❌ تم إلغاء الدفع");
          resetPaymentState();
        },

        onError(err) {
          console.error("❌ Pi Error:", err);
          alert("⚠️ حدث خطأ أثناء الدفع");
          resetPaymentState();
        }
      }
    );
  } catch (err) {
    console.error(err);
    alert("❌ فشل بدء عملية الدفع");
    resetPaymentState();
  }
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
  disableBuyButton(false);
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").style.display = "none";
  selectedProduct = null;
  }
    
