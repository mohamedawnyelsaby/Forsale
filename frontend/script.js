/***********************
 * GLOBAL CONFIG
 ***********************/
const API_BASE = "https://forsale-production.up.railway.app";
let selectedProduct = null;

/***********************
 * BASIC HELPERS
 ***********************/
function isPiBrowser() {
  return typeof window.Pi !== "undefined";
}

/***********************
 * LOAD PRODUCTS FROM BACKEND
 ***********************/
async function loadProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  const products = await res.json();

  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${product.title}</h3>
      <p>${product.price} Pi</p>
      <button onclick='selectProduct(${JSON.stringify(product)})'>
        شراء
      </button>
    `;
    grid.appendChild(card);
  });
}

/***********************
 * SELECT PRODUCT
 ***********************/
function selectProduct(product) {
  selectedProduct = product;

  document.getElementById("checkout-product-name").innerText = product.title;
  document.getElementById("checkout-product-price").innerText =
    product.price + " Pi";

  openCheckoutModal();
}

/***********************
 * CHECKOUT FLOW
 ***********************/
async function checkout() {
  if (!isPiBrowser()) {
    alert("⚠️ افتح التطبيق من Pi Browser لإتمام الدفع");
    return;
  }

  if (!selectedProduct) {
    alert("❌ لم يتم اختيار منتج");
    return;
  }

  try {
    await payWithPi(selectedProduct);
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء بدء عملية الدفع");
  }
}

/***********************
 * PI PAYMENT
 ***********************/
async function payWithPi(product) {
  const res = await fetch(`${API_BASE}/api/pi/create-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: product.price,
      memo: `Forsale | ${product.title}`,
      metadata: {
        productId: product._id
      }
    })
  });

  if (!res.ok) throw new Error("Failed to create payment");

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
            productId: product._id
          })
        });

        alert("✅ تم الدفع بنجاح");
        closeCheckoutModal();
      },

      onCancel: () => alert("❌ تم إلغاء الدفع"),
      onError: err => {
        console.error(err);
        alert("⚠️ خطأ أثناء الدفع");
      }
    }
  );
}

/***********************
 * UI
 ***********************/
function openCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "block";
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

/***********************
 * INIT
 ***********************/
document.addEventListener("DOMContentLoaded", loadProducts);
          
