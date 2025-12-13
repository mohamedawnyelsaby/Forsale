// ============================================
// بيانات محاكاة محلية
// ============================================
let currentUser = null;
const users = JSON.parse(localStorage.getItem('forsale_users')) || [];
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;
let selectedProductForCheckout = null;  // 👈 متغير جديد لحفظ المنتج الذي سيتم الدفع له

// محاكاة للإشعارات
let logyMsgs = [
    { s: 'ai', t: 'مرحباً بك! أنا Logy AI، مساعدك الشخصي في Forsale. كيف يمكنني خدمتك اليوم؟\nيمكنك أن تطلب مني البحث، أو تحليل منتج، أو مراجعة طلباتك.' }
];

// ============================================
// وظائف تسجيل الدخول
// ============================================
function checkLoginStatus() {
    currentUser = JSON.parse(localStorage.getItem('forsale_current_user'));
    if (currentUser) {
        showApp();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
    }
}

function showApp() {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initializeApp();
}

// ============================================
// عرض التفاصيل وتحديد المنتج (تعديل مهم)
// ============================================
function openProductDetail(id) {
    closeAllModals();

    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    selectedProductForCheckout = id;  // حفظ المنتج المختار

    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price.toLocaleString()} Pi`;
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').textContent = product.details;
    document.getElementById('ai-score').textContent = product.ai_analysis.score.toFixed(1);
    document.getElementById('ai-market-price').textContent = `${product.ai_analysis.market_price.toLocaleString()} Pi`;
    document.getElementById('ai-summary').textContent = product.ai_analysis.summary;

    document.getElementById('ai-score-box').style.borderColor = product.ai_analysis.price_state_color;
    document.getElementById('ai-score').style.color = product.ai_analysis.price_state_color;

    document.getElementById('shipping-eta').textContent = product.shipping_ai.eta;
    document.getElementById('shipping-problem').textContent = product.shipping_ai.problem_handling;
    document.getElementById('shipping-carrier').textContent = product.shipping_ai.carrier;

    const specsList = document.getElementById('specs-list');
    specsList.innerHTML = Object.entries(product.specs).map(([k, v]) => `
        <li style="display:flex; justify-content:space-between; padding:5px 0;">
            <span>${k}</span><strong>${v}</strong>
        </li>
    `).join('');

    showDetailTab('description', document.querySelector('.detail-tab-item[data-tab="description"]'));

    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// ============================================
// عرض تفاصيل الدفع
// ============================================
window.openCheckoutModal = () => {
    closeAllModals();

    if (!selectedProductForCheckout) {
        alert("لم يتم اختيار منتج");
        return;
    }

    const product = PRODUCTS.find(p => p.id === selectedProductForCheckout);
    if (!product) {
        alert("المنتج غير موجود");
        return;
    }

    document.getElementById('checkout-product-name').textContent = product.name;
    document.getElementById('checkout-product-price').textContent = `${product.price.toLocaleString()} Pi`;

    document.getElementById('checkoutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

// ============================================
// دفع المنتج عبر Pi
// ============================================
async function realPiPayment(productId) {
    if (!window.Pi) {
        alert("⚠️ افتح التطبيق من Pi Browser");
        return;
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        alert("المنتج غير موجود");
        return;
    }

    try {
        const res = await fetch("https://forsale-production.up.railway.app/api/pi/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: product.price,
                memo: product.name,
                uid: window.Pi.user?.uid || "guest"
            })
        });

        if (!res.ok) throw new Error("Backend Error");

        const paymentData = await res.json();

        Pi.createPayment(
            {
                identifier: paymentData.identifier,
                amount: paymentData.amount,
                memo: paymentData.memo,
                metadata: paymentData.metadata
            },
            {
                onReadyForServerApproval(paymentId) {
                    console.log("🟡 Ready for approval", paymentId);
                },
                onReadyForServerCompletion(paymentId) {
                    console.log("🟢 Payment completed", paymentId);
                    alert("✅ تم الدفع بنجاح!");
                },
                onCancel(paymentId) {
                    alert("❌ تم إلغاء الدفع");
                },
                onError(error) {
                    console.error(error);
                    alert("⚠️ خطأ أثناء الدفع");
                }
            }
        );
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر");
    }
}
