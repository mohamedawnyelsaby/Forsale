/*****************************************
 * 1. الإعدادات والبيانات (Data & Config)
 *****************************************/
const API_BASE = "https://forsale-production.up.railway.app";
let selectedProduct = null;
let currentUser = JSON.parse(localStorage.getItem('forsale_current_user')) || null;
let activeCategory = 'all';
let activeSub = null;

// شجرة التصنيفات المتقدمة (من كودك الأصلي)
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group', subs: [] },
    { id: 'tech', name: 'إلكترونيات', icon: 'fa-laptop-code', subs: [
        { id: 'mobile', name: 'هواتف', filters: ['الماركة', 'الحالة'] },
        { id: 'laptops', name: 'لابتوب', filters: ['الماركة', 'المعالج'] },
        { id: 'accs', name: 'إكسسوارات', filters: ['النوع', 'الماركة'] }
    ]},
    { id: 'vehicles', name: 'سيارات', icon: 'fa-car', subs: [
        { id: 'sedan', name: 'سيدان', filters: ['الماركة', 'الموديل'] },
        { id: 'suv', name: 'دفع رباعي', filters: ['الماركة', 'الموديل'] }
    ]},
    { id: 'real', name: 'عقارات', icon: 'fa-building', subs: [
        { id: 'apartments', name: 'شقق', filters: ['النوع', 'المساحة'] },
        { id: 'villas', name: 'فيلات', filters: ['الموقع', 'المساحة'] }
    ]},
    { id: 'fashion', name: 'موضة', icon: 'fa-shirt', subs: [
        { id: 'men', name: 'رجالي', filters: ['النوع', 'المقاس'] },
        { id: 'women', name: 'حريمي', filters: ['النوع', 'المقاس'] }
    ]}
];

// بيانات المنتجات الغنية (من كودك الأصلي)
const PRODUCTS = [
    { 
        id: 'p1', 
        name: 'iPhone 15 Pro (Titanium)', 
        price: 105.00, 
        cat: 'tech', 
        sub: 'mobile',
        brand: 'Apple',
        img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400', 
        details: 'جهاز آيفون 15 برو مستعمل بحالة ممتازة (100% بدون خدوش)، تيتانيوم طبيعي، 256 جيجا.', 
        ai_score: 9.2,
        ai_summary: 'عرض ممتاز وسعر تنافسي. يوصي به Logy AI بشدة.' 
    },
    { 
        id: 'p2', 
        name: 'MacBook Pro M3', 
        price: 155.00, 
        cat: 'tech', 
        sub: 'laptops',
        brand: 'Apple',
        img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 
        details: 'لابتوب احترافي جديد M3 Max، ذاكرة 32GB، سعة 1TB SSD.', 
        ai_score: 8.8,
        ai_summary: 'السعر يتوافق تماماً مع القيمة السوقية.' 
    },
    { 
        id: 'p3', 
        name: 'Tesla Model 3', 
        price: 1500.00, 
        cat: 'vehicles', 
        sub: 'sedan',
        brand: 'Tesla',
        img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400', 
        details: 'تسلا موديل 3، بحالة الوكالة، ماشية 10,000 كم.', 
        ai_score: 9.9,
        ai_summary: 'فرصة نادرة! السعر أقل من السوق.' 
    },
    { 
        id: 'p4', 
        name: 'Classic Watch', 
        price: 15.00, 
        cat: 'fashion', 
        sub: 'men',
        brand: 'Rolex',
        img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 
        details: 'ساعة كلاسيكية نادرة.', 
        ai_score: 7.0,
        ai_summary: 'سعر مقبول لقطعة نادرة.' 
    }
];

/*****************************************
 * 2. التشغيل والتهيئة (Initialization)
 *****************************************/
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 التطبيق يعمل...");
    
    // التحقق من تسجيل الدخول
    checkLoginStatus();

    // رسم الواجهة الأولية
    renderCategories();
    renderProducts(PRODUCTS);

    // Pi SDK
    if (typeof window.Pi !== 'undefined') {
        Pi.init({ version: "2.0", sandbox: true });
    }
});

// وظيفة التحقق من الدخول
function checkLoginStatus() {
    // لو المستخدم مسجل، اعرض التطبيق، غير كدة اعرض الدخول
    if (currentUser) {
        showApp();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }
}

function showApp() {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

/*****************************************
 * 3. المنطق الهرمي والفلاتر (Hierarchy)
 *****************************************/
function renderCategories() {
    const container = document.getElementById('level1-scroll');
    if(!container) return;

    container.innerHTML = CATEGORIES.map((c, idx) => `
        <div class="cat-item ${idx === 0 && activeCategory === 'all' ? 'active' : ''}" 
             onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

window.selectCategory = function(id, el) {
    // تحديث الشكل
    document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    activeSub = null;

    const filterPanel = document.getElementById('filter-panel');
    const level2 = document.getElementById('level2-chips');
    const level3 = document.getElementById('level3-area');

    // تنظيف
    level2.innerHTML = '';
    level3.innerHTML = '';

    if (id === 'all') {
        filterPanel.classList.remove('open');
        renderProducts(PRODUCTS);
        return;
    }

    const catData = CATEGORIES.find(c => c.id === id);
    if (catData && catData.subs.length > 0) {
        // رسم الأزرار الفرعية (Chips)
        level2.innerHTML = catData.subs.map(s => `
            <div class="chip" onclick="selectSub('${id}', '${s.id}', this)">
                ${s.name}
            </div>
        `).join('');
        
        filterPanel.classList.add('open');
        // فلترة مبدئية
        renderProducts(PRODUCTS.filter(p => p.cat === id));
    } else {
        filterPanel.classList.remove('open');
    }
};

window.selectSub = function(catId, subId, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeSub = subId;

    const level3 = document.getElementById('level3-area');
    
    // تحديد خيارات الماركة بناءً على القسم (لمنع خلط الماركات)
    let brandOptions = '<option value="">الكل</option>';
    if(catId === 'tech') brandOptions += '<option value="Apple">Apple</option><option value="Samsung">Samsung</option>';
    if(catId === 'vehicles') brandOptions += '<option value="Tesla">Tesla</option><option value="Toyota">Toyota</option>';
    
    // رسم خانات البحث (Glassmorphism Style) + زر البحث اليدوي
    level3.innerHTML = `
        <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
            <div class="filter-group">
                <label><i class="fa-solid fa-tag"></i> الماركة:</label>
                <select id="filter-brand" style="width:100%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                    ${brandOptions}
                </select>
            </div>
            <div class="filter-group">
                <label><i class="fa-solid fa-coins"></i> السعر (Pi):</label>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="filter-min" placeholder="من" style="width:50%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                    <input type="number" id="filter-max" placeholder="إلى" style="width:50%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                </div>
            </div>
            <button class="main-btn" onclick="executeManualSearch()" style="margin-top:15px;">
                <i class="fa-solid fa-magnifying-glass"></i> بحث يدوي
            </button>
        </div>
    `;

    renderProducts(PRODUCTS.filter(p => p.cat === catId && p.sub === subId));
};

window.executeManualSearch = function() {
    const brand = document.getElementById('filter-brand').value;
    const min = parseFloat(document.getElementById('filter-min').value) || 0;
    const max = parseFloat(document.getElementById('filter-max').value) || 9999999;

    const filtered = PRODUCTS.filter(p => {
        const catMatch = (p.cat === activeCategory) && (p.sub === activeSub);
        const brandMatch = brand === "" || p.brand === brand;
        const priceMatch = p.price >= min && p.price <= max;
        return catMatch && brandMatch && priceMatch;
    });

    renderProducts(filtered);
};

/*****************************************
 * 4. رسم المنتجات (Rendering)
 *****************************************/
function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    if (list.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:#888;">لا توجد منتجات مطابقة</div>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="ai-tag"><i class="fa-solid fa-microchip"></i> AI Verified</div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

/*****************************************
 * 5. النوافذ والدفع (Modals & Payment)
 *****************************************/
function closeAllModals() {
    const modals = document.querySelectorAll('[id$="Modal"], [id$="-modal"]');
    modals.forEach(m => m.style.display = 'none');
    document.body.style.overflow = '';
}

window.openProductDetail = function(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    selectedProduct = product;

    document.getElementById('detail-title').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + " Pi";
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').innerText = product.details;
    document.getElementById('ai-score').innerText = product.ai_score;
    document.getElementById('ai-summary').innerText = product.ai_summary;
    document.getElementById('ai-market-price').innerText = product.price + " Pi";

    document.getElementById('product-detail-modal').style.display = 'block';
};

window.closeProductDetailModal = () => document.getElementById('product-detail-modal').style.display = 'none';

window.openCheckoutModal = function() {
    if(!selectedProduct) return;
    document.getElementById('checkout-product-name').innerText = selectedProduct.name;
    document.getElementById('checkout-product-price').innerText = selectedProduct.price + " Pi";
    document.getElementById('checkout-amount').innerText = selectedProduct.price;
    
    document.getElementById('product-detail-modal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
};

window.closeCheckoutModal = () => document.getElementById('checkoutModal').style.display = 'none';

// الدفع الحقيقي (Railway API)
window.checkout = async function() {
    const btn = document.querySelector('#checkoutModal .buy-btn');
    const originalText = btn.innerHTML;
    
    if (typeof window.Pi === 'undefined') {
        alert("⚠️ يجب فتح التطبيق من متصفح Pi Browser");
        return;
    }

    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
        btn.disabled = true;

        // 1. طلب للسيرفر
        const response = await fetch(`${API_BASE}/api/pi/create-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: selectedProduct.id,
                amount: selectedProduct.price,
                memo: `Forsale AI: ${selectedProduct.name}`
            })
        });

        if (!response.ok) throw new Error("Server Error");
        const resData = await response.json();

        // 2. Pi SDK
        await Pi.createPayment(resData.data, {
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
            onCancel: () => { alert("تم الإلغاء"); btn.innerHTML = originalText; btn.disabled = false; },
            onError: (err) => { alert("خطأ: " + err.message); btn.innerHTML = originalText; btn.disabled = false; }
        });

    } catch(err) {
        console.error(err);
        alert("خطأ في الاتصال");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// نوافذ القوائم السفلية
window.openLogyAiModal = () => { document.getElementById('logyAiModal').style.display = 'flex'; renderChat(); }
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

window.showDetailTab = function(tab, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById('detail-' + tab).style.display = 'block';
    el.classList.add('active');
};

// زر الدخول
if(document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', () => {
        // تسجيل دخول تجريبي
        currentUser = { name: "User", id: 1 };
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        showApp();
    });
}
if(document.getElementById('pi-login-btn')) {
    document.getElementById('pi-login-btn').addEventListener('click', async () => {
        try {
            const auth = await Pi.authenticate(['username', 'payments'], () => {});
            currentUser = auth.user;
            localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
            showApp();
        } catch(e) { alert("Error: " + e.message); }
    });
}

// شات Logy AI
let logyMsgs = [{ s: 'ai', t: 'مرحباً! أنا Logy AI، مساعدك الذكي.' }];
function renderChat() {
    const area = document.getElementById('logy-chat-area');
    if(!area) return;
    area.innerHTML = logyMsgs.map(m => `<div class="message-bubble msg-${m.s}">${m.t}</div>`).join('');
}
window.sendMessage = function() {
    const inp = document.getElementById('logy-input');
    if(!inp.value.trim()) return;
    logyMsgs.push({s:'user', t:inp.value});
    inp.value = '';
    renderChat();
    setTimeout(() => {
        logyMsgs.push({s:'ai', t:'أنا أعمل على تحليل طلبك... (AI Simulation)'});
        renderChat();
    }, 1000);
};
