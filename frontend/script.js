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
    category: "electronics",
    specs: ["سعة: 256GB", "الحالة: ممتازة", "الضمان: 6 أشهر", "اللون: تيتانيوم"]
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 0.05,
    description: "MacBook Pro M3 جديد بالكرتونة مع ضمان Apple رسمي.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "electronics",
    specs: ["المعالج: M3", "الرام: 16GB", "التخزين: 512GB", "الشاشة: 14 إنش"]
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    price: 0.02,
    description: "AirPods Pro الجيل الثاني مع خاصية إلغاء الضوضاء.",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
    category: "electronics",
    specs: ["الإصدار: 2023", "إلغاء الضوضاء: نعم", "الشحن: USB-C", "عمر البطارية: 6 ساعات"]
  },
  {
    id: 4,
    name: "PlayStation 5",
    price: 0.08,
    description: "بلايستيشن 5 مع يدين تحكم و3 ألعاب.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
    category: "electronics",
    specs: ["النوع: القرص", "التخزين: 825GB", "الملحقات: يدين + 3 ألعاب", "الحالة: جيدة جداً"]
  },
  {
    id: 5,
    name: "Samsung Galaxy S24 Ultra",
    price: 0.055,
    description: "سامسونج جالاكسي S24 ألترا، قلم S Pen، كاميرا 200 ميجا.",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    category: "electronics",
    specs: ["الرام: 12GB", "التخزين: 512GB", "الكاميرا: 200MP", "قلم S Pen: مضمن"]
  },
  {
    id: 6,
    name: "Apple Watch Series 9",
    price: 0.025,
    description: "ساعة أبل سيريز 9، GPS + Cellular، مقاس 45 ملم.",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
    category: "electronics",
    specs: ["المقاس: 45mm", "النوع: GPS + Cellular", "اللون: ميدنايت", "الحالة: ممتازة"]
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
      // Handle incomplete payment if needed
    }
    
    const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
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
  if (!grid) {
    console.error("❌ Products grid not found");
    return;
  }
  
  grid.innerHTML = MOCK_PRODUCTS.map(product => `
    <div class="product-card glass-panel" onclick="openProductDetail(${product.id})">
      <div class="p-img-box">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400?text=No+Image'">
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

  // Update modal content
  const elements = {
    title: document.getElementById("detail-title"),
    price: document.getElementById("detail-price"),
    img: document.getElementById("detail-img"),
    desc: document.getElementById("detail-desc"),
    score: document.getElementById("ai-score"),
    marketPrice: document.getElementById("ai-market-price"),
    summary: document.getElementById("ai-summary"),
    specsList: document.getElementById("specs-list")
  };

  if (elements.title) elements.title.innerText = product.name;
  if (elements.price) elements.price.innerText = product.price + " Pi";
  if (elements.img) {
    elements.img.src = product.image;
    elements.img.onerror = function() {
      this.src = 'https://via.placeholder.com/400?text=No+Image';
    };
  }
  if (elements.desc) elements.desc.innerText = product.description;
  if (elements.score) elements.score.innerText = "9.2";
  if (elements.marketPrice) elements.marketPrice.innerText = (product.price * 1.1).toFixed(3) + " Pi";
  if (elements.summary) {
    elements.summary.innerText = "السعر ممتاز! أقل من المتوسط السوقي بنسبة 10%. التوصيل خلال 3-5 أيام.";
  }

  // Update specs if available
  if (elements.specsList && product.specs) {
    elements.specsList.innerHTML = product.specs.map(spec => `
      <li style="padding: 10px; border-bottom: 1px solid var(--glass-border); color: var(--text-main);">
        <i class="fa-solid fa-check" style="color: var(--success-color); margin-left: 10px;"></i> ${spec}
      </li>
    `).join('');
  }

  const modal = document.getElementById("product-detail-modal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeProductDetailModal() {
  const modal = document.getElementById("product-detail-modal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
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
  
  const elements = {
    name: document.getElementById("checkout-product-name"),
    price: document.getElementById("checkout-product-price"),
    amount: document.getElementById("checkout-amount")
  };

  if (elements.name) elements.name.innerText = selectedProduct.name;
  if (elements.price) elements.price.innerText = selectedProduct.price + " Pi";
  if (elements.amount) elements.amount.innerText = selectedProduct.price;
  
  const detailModal = document.getElementById("product-detail-modal");
  const checkoutModal = document.getElementById("checkoutModal");
  
  if (detailModal) {
    detailModal.style.display = "none";
    detailModal.classList.remove("active");
  }
  if (checkoutModal) {
    checkoutModal.style.display = "block";
    checkoutModal.classList.add("active");
  }
}

function closeCheckoutModal() {
  const checkoutModal = document.getElementById("checkoutModal");
  const detailModal = document.getElementById("product-detail-modal");
  
  if (checkoutModal) {
    checkoutModal.style.display = "none";
    checkoutModal.classList.remove("active");
  }
  if (detailModal) {
    detailModal.style.display = "block";
    detailModal.classList.add("active");
  }
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

  // Authenticate if not already
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

    // Create payment on backend
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

    // Start Pi payment flow
    window.Pi.createPayment(
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
  successDiv.id = 'success-message';
  successDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #2ECC71, #27AE60);
    color: white;
    padding: 30px 40px;
    border-radius: 20px;
    z-index: 10000;
    text-align: center;
    box-shadow: 0 10px 40px rgba(46, 204, 113, 0.5);
    animation: fadeIn 0.3s ease-in;
  `;
  
  successDiv.innerHTML = `
    <div style="font-size: 50px; margin-bottom: 15px;">✅</div>
    <h2 style="margin: 0 0 10px 0; font-size: 24px;">تم الدفع بنجاح!</h2>
    <p style="margin: 0; font-size: 16px;">الطلب قيد المعالجة الآن</p>
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      successDiv.remove();
    }, 300);
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
  btn.style.cursor = state ? "not-allowed" : "pointer";
  
  if (state) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
  } else {
    const amount = selectedProduct ? selectedProduct.price : 0;
    btn.innerHTML = `<i class="fa-solid fa-wallet"></i> تأكيد ودفع ${amount} Pi`;
  }
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
  // Add navigation logic here if needed
}

function openLogyAiModal() {
  const modal = document.getElementById("logyAiModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeLogyAiModal() {
  const modal = document.getElementById("logyAiModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function openOrdersModal() {
  const modal = document.getElementById("ordersModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeOrdersModal() {
  const modal = document.getElementById("ordersModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function openWalletModal() {
  const modal = document.getElementById("walletModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeWalletModal() {
  const modal = document.getElementById("walletModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function openNotificationsModal() {
  const modal = document.getElementById("notificationsModal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeNotificationsModal() {
  const modal = document.getElementById("notificationsModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function openAiUploadModal() {
  const modal = document.getElementById("ai-upload-modal");
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
  }
}

function closeAiUploadModal() {
  const modal = document.getElementById("ai-upload-modal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
}

function showDetailTab(tab, element) {
  // Hide all tab contents
  document.querySelectorAll('.detail-tab-content').forEach(el => {
    el.style.display = 'none';
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.detail-tab-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show selected tab content
  const tabContent = document.getElementById('detail-' + tab);
  if (tabContent) {
    tabContent.style.display = 'block';
  }
  
  // Add active class to clicked tab
  if (element) {
    element.classList.add('active');
  }
}

function sendMessage() {
  const input = document.getElementById('logy-input');
  if (!input) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  const chatArea = document.getElementById('logy-chat-area');
  if (!chatArea) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `
    <div class="message-avatar"><i class="fa-solid fa-user"></i></div>
    <div class="message-content">${message}</div>
  `;
  chatArea.appendChild(userMsg);
  
  input.value = '';
  
  // Simulate AI response
  setTimeout(() => {
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message';
    aiMsg.innerHTML = `
      <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="message-content">شكراً على رسالتك! كيف يمكنني مساعدتك اليوم؟</div>
    `;
    chatArea.appendChild(aiMsg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 1000);
  
  chatArea.scrollTop = chatArea.scrollHeight;
}

function startAiAnalysis() {
  const desc = document.getElementById('manual-desc');
  const price = document.getElementById('manual-price');
  const filesInput = document.getElementById('product-images');
  
  if (!desc || !desc.value.trim()) {
    alert('⚠️ يرجى إدخال وصف المنتج');
    return;
  }
  
  if (!filesInput || !filesInput.files || filesInput.files.length === 0) {
    alert('⚠️ يرجى اختيار صور المنتج');
    return;
  }
  
  const btn = document.getElementById('start-analysis-btn');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل...';
    btn.disabled = true;
  }
  
  // Simulate AI analysis
  setTimeout(() => {
    alert('✅ تم تحليل المنتج بنجاح! سيتم نشره قريباً.');
    closeAiUploadModal();
    
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-microchip"></i> تحليل وإدراج المنتج الآن بواسطة AI';
      btn.disabled = false;
    }
    
    // Reset form
    if (desc) desc.value = '';
    if (price) price.value = '';
    if (filesInput) filesInput.value = '';
    
    const label = document.getElementById('image-count-label');
    if (label) {
      label.textContent = 'لم يتم اختيار أي ملفات.';
    }
  }, 2000);
}

function showRegister() {
  alert("صفحة التسجيل قريباً!");
}

/************************
 * FILE UPLOAD HANDLER
 ************************/
function handleFileUpload() {
  const input = document.getElementById('product-images');
  const label = document.getElementById('image-count-label');
  
  if (input && input.files && label) {
    const count = input.files.length;
    if (count > 0) {
      label.textContent = `تم اختيار ${count} ملف`;
      label.style.color = 'var(--success-color)';
      
      const btn = document.getElementById('start-analysis-btn');
      if (btn) btn.disabled = false;
    } else {
      label.textContent = 'لم يتم اختيار أي ملفات.';
      label.style.color = 'var(--accent)';
    }
  }
}

/************************
 * APP INITIALIZATION
 ************************/
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 Forsale AI loaded");
  console.log("📱 Pi App: blackstyle");
  
  // Display products
  displayProducts();
  
  // Setup file upload listener
  const fileInput = document.getElementById('product-images');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Setup Logy AI input listener
  const logyInput = document.getElementById('logy-input');
  if (logyInput) {
    logyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  if (isPiBrowser()) {
    console.log("✅ Running in Pi Browser");
    
    // Hide auth, show app
    const authContainer = document.getElementById("auth-container");
    const appContainer = document.getElementById("app-container");
    
    if (authContainer) authContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "block";
    
    // Try to authenticate
    try {
      await authenticateUser();
    } catch (error) {
      console.log("⚠️ Auto-auth failed, will prompt when needed");
    }
    
  } else {
    console.log("⚠️ Not in Pi Browser - Demo mode");
    console.log("🔗 Open: minepi.com/blackstyle");
    
    // Show app in demo mode
    const authContainer = document.getElementById("auth-container");
    const appContainer = document.getElementById("app-container");
    
    if (authContainer) authContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "block";
  }
});

/************************
 * LOGIN HANDLERS
 ************************/
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    if (isPiBrowser()) {
      const user = await authenticateUser();
      if (user) {
        const authContainer = document.getElementById("auth-container");
        const appContainer = document.getElementById("app-container");
        
        if (authContainer) authContainer.style.display = "none";
        if (appContainer) appContainer.style.display = "block";
      }
    } else {
      alert("⚠️ يجب فتح التطبيق من Pi Browser\n\nافتح: minepi.com/blackstyle");
    }
  });
}

const piLoginBtn = document.getElementById('pi-login-btn');
if (piLoginBtn) {
  piLoginBtn.addEventListener('click', async () => {
    if (!isPiBrowser()) {
      window.location.href = "https://minepi.com/blackstyle";
    } else {
      await authenticateUser();
      const authContainer = document.getElementById("auth-container");
      const appContainer = document.getElementById("app-container");
      
      if (authContainer) authContainer.style.display = "none";
      if (appContainer) appContainer.style.display = "block";
    }
  });
}

const fingerprintBtn = document.getElementById('fingerprint-login-btn');
if (fingerprintBtn) {
  fingerprintBtn.addEventListener('click', async () => {
    if (isPiBrowser()) {
      const user = await authenticateUser();
      if (user) {
        const authContainer = document.getElementById("auth-container");
        const appContainer = document.getElementById("app-container");
        
        if (authContainer) authContainer.style.display = "none";
        if (appContainer) appContainer.style.display = "block";
      }
    } else {
      alert("⚠️ يجب فتح التطبيق من Pi Browser");
    }
  });
}

/************************
 * KEYBOARD SHORTCUTS
 ************************/
document.addEventListener('keydown', (e) => {
  // ESC to close modals
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal.active, #product-detail-modal[style*="display: block"]');
    activeModals.forEach(modal => {
      modal.style.display = 'none';
      modal.classList.remove('active');
    });
  }
});

console.log("✅ Script loaded successfully");
