/************************
 * 1. الإعدادات والبيانات
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";
let selectedProduct = null;
let currentUser = null;

// بيانات التصنيفات (التي كانت مختفية)
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group' },
    { id: 'electronics', name: 'إلكترونيات', icon: 'fa-mobile-screen' },
    { id: 'vehicles', name: 'سيارات', icon: 'fa-car' },
    { id: 'fashion', name: 'موضة', icon: 'fa-shirt' },
    { id: 'home', name: 'المنزل', icon: 'fa-couch' },
    { id: 'gaming', name: 'ألعاب', icon: 'fa-gamepad' }
];

// بيانات المنتجات
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 0.01,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
    desc: "آيفون 15 برو ماكس تيتانيوم، حالة الزيرو، بطارية 100%."
  },
  {
    id: 2,
    name: "PlayStation 5",
    price: 0.02,
    category: "gaming",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    desc: "بلايستيشن 5 النسخة الرقمية مع ذراعين ولعبة فيفا."
  },
  {
    id: 3,
    name: "MacBook Air M2",
    price: 0.05,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400",
    desc: "ماك بوك اير M2 خفيف جداً، لون Midnight، ضمان ساري."
  },
  {
    id: 4,
    name: "Tesla Model 3 Toy",
    price: 0.005,
    category: "vehicles",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    desc: "مجسم سيارة تسلا موديل 3 معدني عالي الجودة."
  },
  {
    id: 5,
    name: "Smart Watch Ultra",
    price: 0.015,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1695663737526-7243c233c75d?w=400",
    desc: "ساعة ذكية شبيهة ابل الترا 2، شاشة كاملة."
  }
];

/************************
 * 2. تشغيل التطبيق (Initialization)
 ************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 التطبيق بدأ العمل...");
    
    // 1. عرض التصنيفات (الجزء اللي كان مختفي)
    renderCategories();
    
    // 2. عرض المنتجات
    renderProducts('all');

    // 3. التحقق من Pi Browser
    if (typeof window.Pi !== 'undefined') {
        Pi.init({ version: "2.0", sandbox: true });
        
        // لو فاتح من Pi، اخفي شاشة الدخول تلقائياً (اختياري)
        // document.getElementById('auth-container').style.display = 'none';
        // document.getElementById('app-container').style.display = 'block';
    }
});

/************************
 * 3. دوال العرض (Rendering)
 ************************/

// دالة رسم التصنيفات (Icons Scroll)
function renderCategories() {
    const scrollContainer = document.getElementById('level1-scroll');
    if(!scrollContainer) return;

    scrollContainer.innerHTML = CATEGORIES.map((cat, index) => `
        <div class="cat-item ${index === 0 ? 'active' : ''}" onclick="filterByCategory('${cat.id}', this)">
            <i class="fa-solid ${cat.icon}"></i> ${cat.name}
        </div>
    `).join('');
}

// دالة فلترة المنتجات
window.filterByCategory = function(catId, element) {
    // تحديث الشكل (Active Class)
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // تحديث المنتجات
    renderProducts(catId);
};

// دالة رسم المنتجات
function renderProducts(filterCategory) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    const filtered = filterCategory === 'all' 
        ? MOCK_PRODUCTS 
        : MOCK_PRODUCTS.filter(p => p.category === filterCategory);

    grid.innerHTML = filtered.map(p => `
        <div class="product-card glass-panel" onclick="openProductModal(${p.id})">
            <div class="p-img-box">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="ai-tag"><i class="fa-solid fa-microchip"></i> AI Verified</div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

/************************
 * 4. وظائف التنقل (Auth)
 ************************/
// زر الدخول التجريبي
const loginBtn = document.getElementById('login-btn');
if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    });
}

// زر دخول Pi
const piLoginBtn = document.getElementById('pi-login-btn');
if(piLoginBtn) {
    piLoginBtn.addEventListener('click', async () => {
        try {
            const scopes = ['username', 'payments'];
            const auth = await Pi.authenticate(scopes, onIncompletePayment);
            currentUser = auth.user;
            alert("مرحباً بك يا " + auth.user.username);
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        } catch (err) {
            alert("يرجى فتح الموقع من متصفح Pi Browser");
        }
    });
}

/************************
 * 5. التحكم في النوافذ (Modals)
 ************************/
window.openProductModal = function(id) {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if(!product) return;
    
    selectedProduct = product;
    
    document.getElementById('detail-img').src = product.image;
    document.getElementById('detail-title').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + " Pi";
    document.getElementById('detail-desc').innerText = product.desc;
    
    // بيانات AI وهمية
    document.getElementById('ai-score').innerText = "9.5";
    document.getElementById('ai-market-price').innerText = product.price + " Pi";

    document.getElementById('product-detail-modal').style.display = 'block';
};

window.closeProductDetailModal = function() {
    document.getElementById('product-detail-modal').style.display = 'none';
};

window.openCheckoutModal = function() {
    if(!selectedProduct) return;
    
    document.getElementById('checkout-product-name').innerText = selectedProduct.name;
    document.getElementById('checkout-product-price').innerText = selectedProduct.price + " Pi";
    document.getElementById('checkout-amount').innerText = selectedProduct.price;
    
    document.getElementById('product-detail-modal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
};

window.closeCheckoutModal = function() {
    document.getElementById('checkoutModal').style.display = 'none';
};

// باقي النوافذ
window.openLogyAiModal = () => document.getElementById('logyAiModal').style.display = 'flex';
window.closeLogyAiModal = () => document.getElementById('logyAiModal').style.display = 'none';
window.openOrdersModal = () => document.getElementById('ordersModal').style.display = 'block';
window.closeOrdersModal = () => document.getElementById('ordersModal').style.display = 'none';
window.openWalletModal = () => document.getElementById('walletModal').style.display = 'block';
window.closeWalletModal = () => document.getElementById('walletModal').style.display = 'none';
window.openSettingsModal = () => document.getElementById('settingsModal').style.display = 'block';
window.closeSettingsModal = () => document.getElementById('settingsModal').style.display = 'none';
window.openNotificationsModal = () => document.getElementById('notificationsModal').style.display = 'block';
window.closeNotificationsModal = () => document.getElementById('notificationsModal').style.display = 'none';
window.openAiUploadModal = () => document.getElementById('ai-upload-modal').style.display = 'block';
window.closeAiUploadModal = () => document.getElementById('ai-upload-modal').style.display = 'none';

window.showApp = function(screen) {
    if(screen === 'home') {
        const modals = document.querySelectorAll('[id$="Modal"], [id$="-modal"]');
        modals.forEach(m => m.style.display = 'none');
    }
};

window.showDetailTab = function(tabName, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById('detail-' + tabName).style.display = 'block';
    el.classList.add('active');
};

/************************
 * 6. وظيفة الدفع (Payment) - الجزء المهم
 ************************/
window.checkout = async function() {
    const btn = document.querySelector('#checkoutModal .buy-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
    btn.disabled = true;
    
    if (typeof window.Pi === 'undefined') {
        alert("⚠️ يجب فتح التطبيق من متصفح Pi Browser لإتمام الدفع الحقيقي.");
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    try {
        // 1. طلب إنشاء الدفع من السيرفر
        const response = await fetch(`${API_BASE}/api/pi/create-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: selectedProduct.id,
                amount: selectedProduct.price,
                memo: `Forsale AI: ${selectedProduct.name}`
            })
        });

        if (!response.ok) throw new Error("فشل الاتصال بالسيرفر");
        const resData = await response.json();
        const paymentData = resData.data;

        // 2. بدء الدفع في Pi SDK
        await Pi.createPayment({
            amount: paymentData.amount,
            memo: paymentData.memo,
            metadata: paymentData.metadata
        }, {
            onReadyForServerApproval: async (paymentId) => { 
                await fetch(`${API_BASE}/api/pi/approve-payment`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                await fetch(`${API_BASE}/api/pi/complete-payment`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid })
                });
                alert("✅ تم الدفع بنجاح!");
                closeCheckoutModal();
                btn.innerHTML = originalText;
                btn.disabled = false;
            },
            onCancel: () => { 
                alert("تم الإلغاء"); 
                btn.innerHTML = originalText;
                btn.disabled = false;
            },
            onError: (err) => { 
                alert("خطأ: " + err.message); 
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    } catch(err) {
        console.error(err);
        alert("حدث خطأ أثناء الاتصال: " + err.message); 
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function onIncompletePayment(payment) { console.log("Incomplete payment found"); }
