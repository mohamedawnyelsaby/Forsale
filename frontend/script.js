/*****************************************
 * 1. CONFIGURATION & SERVER
 *****************************************/
const API_BASE = "https://forsale-production.up.railway.app";
let selectedProduct = null;
let currentUser = null;

/*****************************************
 * 2. DATA TAXONOMY (شجرة التصنيفات)
 *****************************************/
const HIERARCHY = {
    all: { label: "الكل", icon: "fa-layer-group", subs: [] },
    electronics: {
        label: "إلكترونيات",
        icon: "fa-mobile-screen",
        subs: [
            { id: 'phones', name: 'هواتف ذكية' },
            { id: 'laptops', name: 'لابتوب' },
            { id: 'cameras', name: 'كاميرات' }
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
    }
};

// بيانات المنتجات (تجريبية)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 0.01,
    cat: "electronics",
    sub: "phones",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
    desc: "آيفون 15 برو ماكس تيتانيوم، 256 جيجا."
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 0.05,
    cat: "electronics",
    sub: "laptops",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    desc: "لابتوب ماك بوك برو M3 الجديد."
  },
  {
    id: 3,
    name: "Tesla Model 3",
    price: 100.00,
    cat: "vehicles",
    sub: "sedan",
    brand: "Tesla",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    desc: "تسلا موديل 3 بحالة ممتازة."
  },
  {
    id: 4,
    name: "Canon EOS R5",
    price: 0.04,
    cat: "electronics",
    sub: "cameras",
    brand: "Canon",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    desc: "كاميرا كانون احترافية."
  }
];

/*****************************************
 * 3. INITIALIZATION
 *****************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 System Started");
    renderLevel1();
    renderProducts(MOCK_PRODUCTS);

    if (typeof window.Pi !== 'undefined') {
        Pi.init({ version: "2.0", sandbox: true });
    }
});

/*****************************************
 * 4. LOGIC: HIERARCHY & FILTERS
 *****************************************/

// رسم المستوى الأول (الأيقونات)
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

// عند اختيار تصنيف رئيسي
window.selectLevel1 = function(key, element) {
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const filterPanel = document.getElementById('filter-panel');
    const level2Container = document.getElementById('level2-chips');
    const level3Container = document.getElementById('level3-area');

    // تنظيف
    level2Container.innerHTML = '';
    level3Container.innerHTML = '';

    if (key === 'all') {
        filterPanel.classList.remove('open');
        renderProducts(MOCK_PRODUCTS);
        return;
    }

    const subCats = HIERARCHY[key].subs;
    
    if (subCats && subCats.length > 0) {
        level2Container.innerHTML = subCats.map(sub => `
            <div class="chip" onclick="selectLevel2('${key}', '${sub.id}', this)">
                ${sub.name}
            </div>
        `).join('');
        
        filterPanel.classList.add('open'); // فتح اللوحة بالتصميم الصحيح
        
        // فلترة مبدئية
        const filtered = MOCK_PRODUCTS.filter(p => p.cat === key);
        renderProducts(filtered);
    } else {
        filterPanel.classList.remove('open');
    }
};

// عند اختيار تصنيف فرعي
window.selectLevel2 = function(parentKey, subKey, element) {
    document.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const level3Container = document.getElementById('level3-area');
    
    // تحديد خيارات البحث بناءً على القسم (عشان مايطلعش Apple في العربيات)
    let optionsHtml = '';
    
    if (parentKey === 'electronics') {
        optionsHtml = `
            <option value="">الكل</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Sony">Sony</option>
            <option value="Canon">Canon</option>
        `;
    } else if (parentKey === 'vehicles') {
        optionsHtml = `
            <option value="">الكل</option>
            <option value="Tesla">Tesla</option>
            <option value="Toyota">Toyota</option>
            <option value="BMW">BMW</option>
        `;
    } else {
        optionsHtml = `<option value="">الكل</option>`;
    }

    // رسم المستوى الثالث (Input Groups + Search Button) بالتصميم الأصلي
    level3Container.innerHTML = `
        <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
            
            <div class="filter-group">
                <label><i class="fa-solid fa-tag"></i> تحديد الماركة:</label>
                <select id="brand-select" style="width:100%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                    ${optionsHtml}
                </select>
            </div>

            <div class="filter-group">
                <label><i class="fa-solid fa-coins"></i> نطاق السعر (Pi):</label>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="price-min" placeholder="من" style="width:50%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                    <input type="number" id="price-max" placeholder="إلى" style="width:50%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1);">
                </div>
            </div>

            <button class="main-btn" onclick="executeManualSearch('${parentKey}', '${subKey}')" style="margin-top:15px; background:var(--primary); color:black;">
                <i class="fa-solid fa-magnifying-glass"></i> بحث يدوي
            </button>
        </div>
    `;

    // فلترة المنتجات
    const filtered = MOCK_PRODUCTS.filter(p => p.cat === parentKey && p.sub === subKey);
    renderProducts(filtered);
};

// وظيفة البحث اليدوي (عند الضغط على الزر)
window.executeManualSearch = function(parentKey, subKey) {
    const brand = document.getElementById('brand-select').value;
    const min = parseFloat(document.getElementById('price-min').value) || 0;
    const max = parseFloat(document.getElementById('price-max').value) || 999999;

    const filtered = MOCK_PRODUCTS.filter(p => {
        const matchCat = p.cat === parentKey && p.sub === subKey;
        const matchBrand = brand === "" || p.brand === brand;
        const matchPrice = p.price >= min && p.price <= max;
        return matchCat && matchBrand && matchPrice;
    });

    renderProducts(filtered);
};

/*****************************************
 * 5. PRODUCT RENDERING
 *****************************************/
function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    if(list.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
                <i class="fa-solid fa-box-open fa-3x" style="margin-bottom:15px; opacity:0.5;"></i>
                <p>لا توجد منتجات مطابقة لهذا البحث</p>
                <button onclick="renderLevel1(); renderProducts(MOCK_PRODUCTS)" style="background:transparent; border:1px solid #555; color:white; padding:8px 15px; border-radius:20px; margin-top:10px;">إعادة تعيين</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(p => `
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

/*****************************************
 * 6. MODALS & NAVIGATION
 *****************************************/
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
 * 7. PAYMENT LOGIC
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
