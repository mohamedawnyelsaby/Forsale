/*****************************************
 * 1. CONFIGURATION & SERVER
 *****************************************/
const API_BASE = "https://forsale-production.up.railway.app";
let selectedProduct = null;
let currentUser = null;

/*****************************************
 * 2. DATA TAXONOMY (شجرة التصنيفات)
 * هذا هو الجزء الذي يعيد القوائم المنسدلة
 *****************************************/
const HIERARCHY = {
    all: {
        label: "الكل",
        icon: "fa-layer-group",
        subs: [] 
    },
    electronics: {
        label: "إلكترونيات",
        icon: "fa-mobile-screen",
        subs: [
            { id: 'phones', name: 'هواتف ذكية' },
            { id: 'laptops', name: 'لابتوب' },
            { id: 'accessories', name: 'اكسسوارات' }
        ]
    },
    vehicles: {
        label: "سيارات",
        icon: "fa-car",
        subs: [
            { id: 'sedan', name: 'سيدان' },
            { id: 'suv', name: 'دفع رباعي' }
        ]
    },
    fashion: {
        label: "موضة",
        icon: "fa-shirt",
        subs: [
            { id: 'men', name: 'رجالي' },
            { id: 'women', name: 'حريمي' }
        ]
    },
    home: {
        label: "المنزل",
        icon: "fa-couch",
        subs: [
            { id: 'furniture', name: 'أثاث' },
            { id: 'decor', name: 'ديكور' }
        ]
    }
};

// بيانات المنتجات
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 0.01,
    cat: "electronics",
    sub: "phones",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
    desc: "آيفون 15 برو ماكس تيتانيوم، 256 جيجا."
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 0.05,
    cat: "electronics",
    sub: "laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    desc: "لابتوب ماك بوك برو M3 الجديد."
  },
  {
    id: 3,
    name: "Tesla Model 3",
    price: 100.00,
    cat: "vehicles",
    sub: "sedan",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    desc: "تسلا موديل 3 بحالة ممتازة."
  },
  {
    id: 4,
    name: "Sony Headphones",
    price: 0.005,
    cat: "electronics",
    sub: "accessories",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
    desc: "سماعات سوني عازلة للضوضاء."
  }
];

/*****************************************
 * 3. INITIALIZATION
 *****************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 System Started");
    
    renderLevel1(); // رسم الشريط العلوي
    renderProducts(MOCK_PRODUCTS); // عرض المنتجات

    // Pi Network Check
    if (typeof window.Pi !== 'undefined') {
        Pi.init({ version: "2.0", sandbox: true });
    }
});

/*****************************************
 * 4. LOGIC: HIERARCHY & FILTERS
 * (هذا هو الكود المسؤول عن القوائم المنسدلة)
 *****************************************/

// 1. رسم المستوى الأول (الأيقونات)
function renderLevel1() {
    const scroll = document.getElementById('level1-scroll');
    if(!scroll) return;

    scroll.innerHTML = Object.keys(HIERARCHY).map(key => {
        const item = HIERARCHY[key];
        return `
            <div class="cat-item" onclick="selectLevel1('${key}', this)">
                <i class="fa-solid ${item.icon}"></i> ${item.label}
            </div>
        `;
    }).join('');
    
    // تفعيل "الكل" افتراضياً
    scroll.firstElementChild.classList.add('active');
}

// 2. عند الضغط على أيقونة رئيسية
window.selectLevel1 = function(key, element) {
    // تحديث الشكل
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // إظهار/إخفاء لوحة الفلاتر
    const filterPanel = document.getElementById('filter-panel');
    const level2Container = document.getElementById('level2-chips');
    const level3Container = document.getElementById('level3-area');

    // تنظيف القديم
    level2Container.innerHTML = '';
    level3Container.innerHTML = '';

    if (key === 'all') {
        // لو اخترنا الكل، نخفي اللوحة ونعرض كل المنتجات
        filterPanel.classList.remove('open');
        renderProducts(MOCK_PRODUCTS);
        return;
    }

    // جلب التصنيفات الفرعية
    const subCats = HIERARCHY[key].subs;
    
    if (subCats && subCats.length > 0) {
        // رسم الأزرار الفرعية (Chips)
        level2Container.innerHTML = subCats.map(sub => `
            <div class="chip" onclick="selectLevel2('${key}', '${sub.id}', this)">
                ${sub.name}
            </div>
        `).join('');
        
        // فتح اللوحة المنسدلة
        filterPanel.classList.add('open');
        
        // فلترة المنتجات حسب التصنيف الرئيسي مبدئياً
        const filtered = MOCK_PRODUCTS.filter(p => p.cat === key);
        renderProducts(filtered);
    } else {
        filterPanel.classList.remove('open');
    }
};

// 3. عند الضغط على زر فرعي (Chip)
window.selectLevel2 = function(parentKey, subKey, element) {
    // تحديث الشكل
    document.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // هنا نفتح المستوى الثالث (Inputs) - محاكاة
    const level3Container = document.getElementById('level3-area');
    
    // رسم خانات البحث اليدوي (Dropdowns)
    level3Container.innerHTML = `
        <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <div class="filter-group">
                <label>تحديد الماركة:</label>
                <select>
                    <option>Apple</option>
                    <option>Samsung</option>
                    <option>Sony</option>
                </select>
            </div>
            <div class="filter-group">
                <label>السعر (Pi):</label>
                <div style="display:flex; gap:10px;">
                    <input type="number" placeholder="من">
                    <input type="number" placeholder="إلى">
                </div>
            </div>
        </div>
    `;

    // فلترة دقيقة للمنتجات
    const filtered = MOCK_PRODUCTS.filter(p => p.cat === parentKey && p.sub === subKey);
    renderProducts(filtered);
};

/*****************************************
 * 5. PRODUCT RENDERING & MODALS
 *****************************************/
function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    if(list.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#888; padding:20px;">لا توجد منتجات مطابقة</div>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="product-card glass-panel" onclick="openProductModal(${p.id})">
            <div class="p-img-box">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="ai-tag"><i class="fa-solid fa-microchip"></i> AI Check</div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

// نوافذ التفاصيل والدفع (نفس الكود السابق لأنه يعمل جيداً)
window.openProductModal = function(id) {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if(!product) return;
    selectedProduct = product;
    
    document.getElementById('detail-img').src = product.image;
    document.getElementById('detail-title').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + " Pi";
    document.getElementById('detail-desc').innerText = product.desc;
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

window.showDetailTab = function(tabName, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById('detail-' + tabName).style.display = 'block';
    el.classList.add('active');
};

/*****************************************
 * 6. PAYMENT LOGIC (Essential)
 *****************************************/
window.checkout = async function() {
    const btn = document.querySelector('#checkoutModal .buy-btn');
    const originalText = btn.innerHTML;
    
    if (typeof window.Pi === 'undefined') {
        alert("⚠️ يجب استخدام متصفح Pi Browser للدفع الحقيقي.");
        return;
    }

    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> معالجة...';
        btn.disabled = true;

        // 1. Backend Request
        const response = await fetch(`${API_BASE}/api/pi/create-payment`, {
            method: "POST", headers: { "Content-Type": "application/json" },
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
                alert("✅ تم الدفع!");
                closeCheckoutModal();
                btn.innerHTML = originalText;
                btn.disabled = false;
            },
            onCancel: () => { 
                alert("تم الإلغاء"); btn.innerHTML = originalText; btn.disabled = false; 
            },
            onError: (err) => { 
                alert("خطأ: " + err.message); btn.innerHTML = originalText; btn.disabled = false; 
            }
        });

    } catch(err) {
        console.error(err);
        alert("خطأ في الاتصال");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// Authentication Buttons
if(document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', () => {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    });
}
if(document.getElementById('pi-login-btn')) {
    document.getElementById('pi-login-btn').addEventListener('click', async () => {
        try {
            const auth = await Pi.authenticate(['username', 'payments'], () => {});
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        } catch (e) { alert("Error: " + e.message); }
    });
}
