/************************
 * 1. الإعدادات والربط بالسيرفر
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
let currentUser = null;

// بيانات تجريبية (عشان الشكل يظهر لحد ما نربط الداتا الحقيقية)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 0.01,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
    desc: "آيفون 15 برو ماكس تيتانيوم، حالة الزيرو."
  },
  {
    id: 2,
    name: "PlayStation 5",
    price: 0.02,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    desc: "بلايستيشن 5 النسخة الرقمية مع ذراعين."
  },
  {
    id: 3,
    name: "MacBook Air M2",
    price: 0.05,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400",
    desc: "ماك بوك اير M2 خفيف جداً، بطارية 100%."
  }
];

/************************
 * 2. تشغيل التطبيق (Initialization)
 ************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 التطبيق بدأ العمل...");
    
    // عرض المنتجات فوراً
    renderProducts();

    // التحقق لو المستخدم فاتح من متصفح باي
    if (typeof window.Pi !== 'undefined') {
        Pi.init({ version: "2.0", sandbox: true });
        
        // لو فاتح من باي، نخش على التطبيق علطول (أو نخليه يسجل دخول)
        // هنا هنخفي شاشة الدخول للتجربة
        // document.getElementById('auth-container').style.display = 'none';
        // document.getElementById('app-container').style.display = 'block';
    }
});

/************************
 * 3. وظائف التنقل (Navigation & Auth)
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
            console.log("Welcome " + auth.user.username);
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        } catch (err) {
            alert("يرجى فتح الموقع من متصفح Pi Browser");
        }
    });
}

/************************
 * 4. عرض المنتجات (Render)
 ************************/
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    grid.innerHTML = MOCK_PRODUCTS.map(p => `
        <div class="product-card glass-panel" onclick="openProductModal(${p.id})">
            <div class="p-img-box">
                <img src="${p.image}" alt="${p.name}">
                <div class="ai-tag"><i class="fa-solid fa-microchip"></i> AI Check</div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

/************************
 * 5. التحكم في النوافذ (Modals Logic)
 ************************/
// دالة فتح تفاصيل المنتج
window.openProductModal = function(id) {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if(!product) return;
    
    selectedProduct = product;
    
    // تعبئة البيانات في النافذة
    document.getElementById('detail-img').src = product.image;
    document.getElementById('detail-title').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + " Pi";
    document.getElementById('detail-desc').innerText = product.desc;
    
    // إظهار النافذة (حسب الـ CSS بتاعك)
    document.getElementById('product-detail-modal').style.display = 'block';
};

window.closeProductDetailModal = function() {
    document.getElementById('product-detail-modal').style.display = 'none';
};

// دالة فتح الدفع (Checkout)
window.openCheckoutModal = function() {
    if(!selectedProduct) return;
    
    document.getElementById('checkout-product-name').innerText = selectedProduct.name;
    document.getElementById('checkout-product-price').innerText = selectedProduct.price + " Pi";
    document.getElementById('checkout-amount').innerText = selectedProduct.price;
    
    // تبديل النوافذ
    document.getElementById('product-detail-modal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
};

window.closeCheckoutModal = function() {
    document.getElementById('checkoutModal').style.display = 'none';
};

// دوال القوائم السفلية والنوافذ الأخرى
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

// التنقل في الشريط السفلي
window.showApp = function(screen) {
    if(screen === 'home') {
        // إغلاق كل النوافذ المفتوحة
        const modals = document.querySelectorAll('[id$="Modal"], [id$="-modal"]');
        modals.forEach(m => m.style.display = 'none');
    }
};

/************************
 * 6. وظيفة الدفع (Payment)
 ************************/
window.checkout = async function() {
    const btn = document.querySelector('#checkoutModal .buy-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
    
    if (typeof window.Pi === 'undefined') {
        alert("يجب فتح التطبيق من متصفح Pi Browser لإتمام الدفع.");
        btn.innerHTML = 'تأكيد ودفع';
        return;
    }

    try {
        // إنشاء عملية الدفع
        const paymentData = {
            amount: selectedProduct.price,
            memo: "شراء " + selectedProduct.name,
            metadata: { productId: selectedProduct.id }
        };

        const payment = await Pi.createPayment(paymentData, {
            onReadyForServerApproval: (paymentId) => { 
                // هنا بنكلم السيرفر بتاعنا عشان يوافق
                console.log("Waiting for approval: " + paymentId);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log("Completed: " + txid);
                alert("✅ تم الدفع بنجاح!");
                closeCheckoutModal();
                btn.innerHTML = 'تأكيد ودفع';
            },
            onCancel: () => { 
                alert("تم الإلغاء"); 
                btn.innerHTML = 'تأكيد ودفع';
            },
            onError: (err) => { 
                alert("خطأ: " + err.message); 
                btn.innerHTML = 'تأكيد ودفع';
            }
        });
    } catch(err) {
        console.error(err);
        // alert("حدث خطأ أثناء الدفع"); 
        // btn.innerHTML = 'تأكيد ودفع';
    }
};

function onIncompletePayment(payment) {
    console.log("Incomplete payment found");
}

/************************
 * 7. Tabs Functionality
 ************************/
window.showDetailTab = function(tabName, el) {
    // إخفاء كل المحتوى
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    // إزالة التفعيل من كل الأزرار
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    
    // تفعيل المطلوب
    document.getElementById('detail-' + tabName).style.display = 'block';
    el.classList.add('active');
};
