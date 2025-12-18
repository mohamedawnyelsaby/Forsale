/************************
 * GLOBAL CONFIG
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
let paymentInProgress = false;
let currentUser = null;

/************************
 * MOCK PRODUCTS DATA
 ************************/
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro (Titanium)",
    price: 0.01,
    description: "iPhone 15 Pro في حالة ممتازة مع جميع الملحقات. ضمان لمدة 6 أشهر.",
    image: "https://images.unsplash.com/photo-1592286927505-b86dc33748b5?w=400",
    category: "electronics"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 0.05,
    description: "MacBook Pro M3 جديد بالكرتونة مع ضمان Apple رسمي.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "electronics"
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    price: 0.02,
    description: "AirPods Pro الجيل الثاني مع خاصية إلغاء الضوضاء.",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
    category: "electronics"
  }
];

/************************
 * PI BROWSER DETECTION
 ************************/
function isPiBrowser() {
  return typeof window.Pi !== "undefined";
}

/************************
 * PI AUTHENTICATION
 ************************/
async function authenticateUser() {
  if (!isPiBrowser()) {
    console.warn("⚠️ Not in Pi Browser");
    return null;
  }

  try {
    const scopes = ['username', 'payments'];
    
    function onIncompletePaymentFound(payment) {
      console.log("⚠️ Incomplete payment found:", payment);
    }
    
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    currentUser = auth.user;
    
    console.log("✅ Authenticated:", currentUser.username);
    return currentUser;
    
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    return null;
  }
}

/************************
 * DISPLAY PRODUCTS
 ************************/
function displayProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  
  grid.innerHTML = MOCK_PRODUCTS.map(product => `
    <div class="product-card glass-panel" onclick="openProductDetail(${product.id})">
      <div class="p-img-box">
        <img src="${product.image}" alt="${product.name}">
        <div class="ai-tag">
          <i class="fa-solid fa-microchip"></i> AI Verified
        </div>
      </div>
      <div class="p-details">
        <div class="p-name">${product.name}</div>
        <div class="p-price">${product.price} Pi</div>
      </div>
    </div>
  `).join('');
}

/************************
 * PRODUCT DETAIL MODAL
 ************************/
function openProductDetail(id) {
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (!product) {
    alert("❌ المنتج غير موجود");
    return;
  }

  selectedProduct = product;

  document.getElementById("detail-title").innerText = product.name;
  document.getElementById("detail-price").innerText = product.price + " Pi";
  document.getElementById("detail-img").src = product.image;
  document.getElementById("detail-desc").innerText = product.description;
  
  document.getElementById("ai-score").innerText = "9.2";
  document.getElementById("ai-market-price").innerText = product.price + " Pi";
  document.getElementById("ai-summary").innerText = 
    "السعر ممتاز! أقل من المتوسط السوقي بنسبة 5%. التوصيل خلال 3-5 أيام.";

  document.getElementById("product-detail-modal").style.display = "block";
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").style.display = "none";
  selectedProduct = null;
}

/************************
 * CHECKOUT MODAL
 ************************/
function openCheckoutModal() {
  if (!selectedProduct) {
    alert("❌ لم يتم اختيار منتج");
    return;
  }
  
  document.getElementById("checkout-product-name").innerText = selectedProduct.name;
  document.getElementById("checkout-product-price").innerText = selectedProduct.price + " Pi";
  document.getElementById("checkout-amount").innerText = selectedProduct.price;
  
  document.getElementById("product-detail-modal").style.display = "none";
  document.getElementById("checkoutModal").style.display = "block";
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none";
  document.getElementById("product-detail-modal").style.display = "block";
}

/************************
 * PI PAYMENT FLOW
 ************************/
async function checkout() {
  if (paymentInProgress) {
    alert("⚠️ عملية دفع جارية بالفعل");
    return;
  }

  if (!isPiBrowser()) {
    alert("⚠️ يجب فتح التطبيق من Pi Browser\n\nافتح: minepi.com/blackstyle");
    return;
  }

  if (!selectedProduct) {
    alert("❌ لم يتم اختيار منتج");
    return;
  }

  if (!currentUser) {
    console.log("🔐 Authenticating user...");
    currentUser = await authenticateUser();
    if (!currentUser) {
      alert("❌ فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      return;
    }
  }

  try {
    paymentInProgress = true;
    disableBuyButton(true);
    
    console.log("🔄 Creating payment for:", selectedProduct);

    const response = await fetch(`${API_BASE}/api/pi/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        memo: `Forsale | ${selectedProduct.name}`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "فشل إنشاء الدفع");
    }

    const result = await response.json();
    const payment = result.data;
    
    console.log("✅ Payment created:", payment.identifier);

    Pi.createPayment(
      {
        amount: payment.amount,
        memo: payment.memo,
        metadata: payment.metadata
      },
      {
        onReadyForServerApproval: async function(paymentId) {
          console.log("🟡 Ready for approval:", paymentId);
          
          try {
            const approveRes = await fetch(`${API_BASE}/api/pi/approve-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId })
            });
            
            if (approveRes.ok) {
              console.log("✅ Payment approved");
            } else {
              console.error("❌ Approval failed");
            }
          } catch (err) {
            console.error("❌ Approval error:", err);
          }
        },

        onReadyForServerCompletion: async function(paymentId, txid) {
          console.log("🟢 Ready for completion:", paymentId, txid);
          
          try {
            const completeRes = await fetch(`${API_BASE}/api/pi/complete-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid })
            });
            
            if (completeRes.ok) {
              console.log("✅ Payment completed successfully");
              
              showSuccessMessage();
              
              setTimeout(() => {
                resetPaymentState();
                closeCheckoutModal();
                closeProductDetailModal();
                openOrdersModal();
              }, 2000);
              
            } else {
              throw new Error("فشل إتمام الدفع");
            }
          } catch (err) {
            console.error("❌ Completion error:", err);
            alert("⚠️ حدث خطأ في إتمام الدفع. سيتم مراجعة الطلب.");
            resetPaymentState();
          }
        },

        onCancel: function(paymentId) {
          console.log("❌ Payment cancelled:", paymentId);
          alert("❌ تم إلغاء الدفع");
          resetPaymentState();
        },

        onError: function(error, payment) {
          console.error("❌ Payment error:", error, payment);
          alert("⚠️ حدث خطأ: " + (error.message || "خطأ غير معروف"));
          resetPaymentState();
        }
      }
    );

  } catch (error) {
    console.error("❌ Checkout error:", error);
    alert("❌ فشل بدء عملية الدفع:\n" + error.message);
    resetPaymentState();
  }
}

/************************
 * SUCCESS MESSAGE
 ************************/
function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #2ECC71, #27AE60);
    color: white;
    padding: 30px;
    border-radius: 20px;
    z-index: 10000;
    text-align: center;
    box-shadow: 0 10px 40px rgba(46, 204, 113, 0.5);
  `;
  
  successDiv.innerHTML = `
    <div style="font-size: 50px; margin-bottom: 15px;">✅</div>
    <h2 style="margin: 0 0 10px 0; font-size: 24px;">تم الدفع بنجاح!</h2>
    <p style="margin: 0; font-size: 16px;">الطلب قيد المعالجة الآن</p>
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 2000);
}

/************************
 * UI HELPERS
 ************************/
function disableBuyButton(state) {
  const btn = document.querySelector("#checkoutModal .buy-btn");
  if (!btn) return;

  btn.disabled = state;
  btn.style.opacity = state ? "0.5" : "1";
  btn.innerHTML = state 
    ? '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...'
    : '<i class="fa-solid fa-wallet"></i> تأكيد ودفع ' + (selectedProduct?.price || 0) + ' Pi';
}

function resetPaymentState() {
  paymentInProgress = false;
  disableBuyButton(false);
}

/************************
 * MODAL CONTROLS
 ************************/
function showApp(tab) {
  console.log("Navigate to:", tab);
}

function openLogyAiModal() {
  document.getElementById("logyAiModal").style.display = "flex";
}

function closeLogyAiModal() {
  document.getElementById("logyAiModal").style.display = "none";
}

function openOrdersModal() {
  document.getElementById("ordersModal").style.display = "block";
}

function closeOrdersModal() {
  document.getElementById("ordersModal").style.display = "none";
}

function openWalletModal() {
  document.getElementById("walletModal").style.display = "block";
}

function closeWalletModal() {
  document.getElementById("walletModal").style.display = "none";
}

function openSettingsModal() {
  document.getElementById("settingsModal").style.display = "block";
}

function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

function openNotificationsModal() {
  document.getElementById("notificationsModal").style.display = "block";
}

function closeNotificationsModal() {
  document.getElementById("notificationsModal").style.display = "none";
}

function openAiUploadModal() {
  document.getElementById("ai-upload-modal").style.display = "block";
}

function closeAiUploadModal() {
  document.getElementById("ai-upload-modal").style.display = "none";
}

function showDetailTab(tab, element) {
  document.querySelectorAll('.detail-tab-content').forEach(el => {
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.detail-tab-item').forEach(el => {
    el.classList.remove('active');
  });
  
  document.getElementById('detail-' + tab).style.display = 'block';
  element.classList.add('active');
}

function sendMessage() {
  console.log("Logy AI message sent");
}

function startAiAnalysis() {
  console.log("AI Analysis started");
}

function showRegister() {
  alert("صفحة التسجيل قريباً!");
}

/************************
 * APP INITIALIZATION
 ************************/
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 Forsale AI loaded");
  console.log("📱 Pi App: blackstyle");
  
  displayProducts();
  
  if (isPiBrowser()) {
    console.log("✅ Running in Pi Browser");
    
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    
    try {
      await authenticateUser();
    } catch (error) {
      console.log("⚠️ Auto-auth failed, will prompt when needed");
    }
    
  } else {
    console.log("⚠️ Not in Pi Browser - Demo mode");
    console.log("🔗 Open: minepi.com/blackstyle");
    
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
  }
});

/************************
 * LOGIN HANDLERS
 ************************/
document.getElementById('login-btn')?.addEventListener('click', async () => {
  if (isPiBrowser()) {
    const user = await authenticateUser();
    if (user) {
      document.getElementById("auth-container").style.display = "none";
      document.getElementById("app-container").style.display = "block";
    }
  } else {
    alert("⚠️ يجب فتح التطبيق من Pi Browser\n\nافتح: minepi.com/blackstyle");
  }
});

document.getElementById('pi-login-btn')?.addEventListener('click', () => {
  if (!isPiBrowser()) {
    window.location.href = "https://minepi.com/blackstyle";
  } else {
    authenticateUser();
  }
});

document.getElementById('fingerprint-login-btn')?.addEventListener('click', async () => {
  if (isPiBrowser()) {
    const user = await authenticateUser();
    if (user) {
      document.getElementById("auth-container").style.display = "none";
      document.getElementById("app-container").style.display = "block";
    }
  } else {
    alert("⚠️ يجب فتح التطبيق من Pi Browser");
  }
});
