/************************
 * FORSALE AI - COMPLETE SCRIPT
 * Original functionality + Pi Network Integration
 ************************/

/************************
 * GLOBAL CONFIG
 ************************/
const API_BASE = "https://forsale-production.up.railway.app";

let currentUser = null;
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;
let logyMsgs = [
    { s: 'ai', t: 'مرحباً بك! أنا Logy AI، مساعدك الشخصي في Forsale. كيف يمكنني خدمتك اليوم؟ يمكنك أن تطلب مني البحث، أو تحليل منتج، أو مراجعة طلباتك.' }
];

let selectedProduct = null;
let paymentInProgress = false;

/************************
 * CATEGORIES & PRODUCTS DATA
 ************************/
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group', subs: [] },
    { id: 'tech', name: 'إلكترونيات', icon: 'fa-laptop-code', subs: [
        { id: 'mobile', name: 'هواتف وأجهزة لوحية', filters: ['الحالة: (جديد, مستعمل)', 'الماركة: (آبل, سامسونج, هواوي)', 'سعة التخزين', 'اللون', 'حالة البطارية'] },
        { id: 'laptops', name: 'حواسيب محمولة', filters: ['الماركة', 'المعالج', 'حجم الشاشة', 'الذاكرة العشوائية (RAM)'] },
        { id: 'accs', name: 'إكسسوارات وقطع', filters: ['النوع: (سماعة, شاحن, ساعة ذكية)', 'الماركة', 'الحالة'] },
    ] },
    { id: 'real', name: 'عقارات', icon: 'fa-building', subs: [
        { id: 'apartments', name: 'شقق للإيجار/البيع', filters: ['النوع: (شقة, استوديو, دوبلكس)', 'الموقع', 'المساحة', 'عدد الغرف', 'حالة العقار: (جديد, مستعمل)'] },
        { id: 'villas', name: 'فيلات ومنازل', filters: ['الموقع', 'المساحة', 'عدد الغرف', 'المرافق: (مسبح, حديقة, موقف)'] },
        { id: 'land', name: 'أراضي', filters: ['النوع: (سكنية, تجارية, زراعية)', 'الموقع', 'المساحة'] },
    ] },
    { id: 'fashion', name: 'الأزياء والموضة', icon: 'fa-shirt', subs: [
        { id: 'clothes', name: 'ملابس', filters: ['الجنس: (رجالي, نسائي, أطفال)', 'النوع: (علوي, سفلي, خارجي)', 'المقاس', 'الماركة', 'اللون', 'الحالة'] },
        { id: 'shoes_bags', name: 'أحذية وحقائب', filters: ['النوع: (رياضية, رسمية, حقيبة يد)', 'الماركة', 'المقاس', 'المادة المصنوعة منها'] },
        { id: 'jewel_watches', name: 'مجوهرات وساعات', filters: ['النوع: (ساعة يد, خاتم, عقد)', 'الماركة', 'نوع المعدن: (ذهب, فضة, ألماس)', 'الحالة'] },
        { id: 'cosmetics', name: 'مستحضرات التجميل والعطور', filters: ['النوع: (عطور, مكياج, عناية بالبشرة)', 'الماركة', 'حالة العبوة: (جديد, أخرى)'] }
    ] },
    { id: 'home', name: 'المنزل والمعيشة', icon: 'fa-couch', subs: [
        { id: 'furniture', name: 'أثاث وديكور', filters: ['النوع', 'الحالة', 'الماركة', 'اللون'] },
        { id: 'kitchen', name: 'أجهزة المطبخ', filters: ['النوع', 'الماركة', 'الحالة', 'الكهرباء (220V, 110V)'] },
    ] }
];

const PRODUCTS = [
    { 
        id: 'p1', 
        name: 'iPhone 15 Pro (Titanium)', 
        price: 0.01, 
        cat: 'tech', 
        details: 'جهاز آيفون 15 برو مستعمل لمدة شهر واحد، بحالة ممتازة (100% بدون خدوش)، اللون تيتانيوم طبيعي، سعة 256 جيجا بايت. مرفق بالصندوق وجميع الإكسسوارات الأصلية. تم فحصه من قبل Logy AI.', 
        img: 'https://images.unsplash.com/photo-1592286927505-b86dc33748b5?w=400', 
        ai_analysis: { 
            score: 9.2, 
            market_price: 0.015, 
            summary: 'عرض ممتاز وسعر تنافسي مقارنة بحالة الجهاز والمواصفات. فرصة شراء سريعة. يوصي به Logy AI بشدة.', 
            price_state_color: '#00f2ff' 
        }, 
        shipping_ai: { 
            eta: '3-5 أيام عمل', 
            problem_handling: 'إدارة المشاكل: مراقبة شحن مدارة بالذكاء الاصطناعي على مدار الساعة.', 
            carrier: 'Logy AI Express' 
        }, 
        specs: { 
            'الماركة': 'أبل', 
            'الموديل': 'آيفون 15 برو', 
            'سعة التخزين': '256 جيجا بايت', 
            'اللون': 'تيتانيوم طبيعي', 
            'حالة البطارية': '98%', 
            'الكاميرا': 'ثلاثية العدسات (48MP رئيسية)', 
            'المعالج': 'A17 Bionic', 
            'نظام التشغيل': 'iOS الأحدث' 
        } 
    },
    { 
        id: 'p2', 
        name: 'MacBook Pro 2024 (M3 Max)', 
        price: 0.05, 
        cat: 'tech', 
        details: 'لابتوب احترافي جديد، لم يستخدم إلا بضع ساعات. معالج M3 Max، ذاكرة 32GB، سعة 1TB SSD. مثالي للمصممين والمطورين. ضمان سنة متبقية.', 
        img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 
        ai_analysis: { 
            score: 8.8, 
            market_price: 0.05, 
            summary: 'السعر يتوافق تماماً مع القيمة السوقية والمواصفات الحديثة. Logy AI ينصح به للمحترفين.', 
            price_state_color: '#FFD700' 
        }, 
        shipping_ai: { 
            eta: '5-7 أيام عمل', 
            problem_handling: 'إدارة المشاكل: مراقبة شحن مدارة بالذكاء الاصطناعي على مدار الساعة.', 
            carrier: 'Logy AI Express' 
        }, 
        specs: { 
            'الماركة': 'أبل', 
            'الموديل': 'ماك بوك برو', 
            'المعالج': 'M3 Max', 
            'الذاكرة': '32GB', 
            'التخزين': '1TB SSD', 
            'الشاشة': '16 بوصة Liquid Retina XDR', 
            'اللون': 'فضاء أسود', 
            'الحالة': 'جديد' 
        } 
    },
    { 
        id: 'p3', 
        name: 'AirPods Pro 2', 
        price: 0.02, 
        cat: 'tech', 
        details: 'سماعات AirPods Pro الجيل الثاني مع خاصية إلغاء الضوضاء النشط. حالة ممتازة مع العلبة الأصلية والشاحن.', 
        img: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', 
        ai_analysis: { 
            score: 8.5, 
            market_price: 0.025, 
            summary: 'سعر جيد جداً. سماعات أصلية 100%. Logy AI يؤكد صحتها.', 
            price_state_color: '#2ECC71' 
        }, 
        shipping_ai: { 
            eta: '2-3 أيام عمل', 
            problem_handling: 'شحن سريع ومراقب بالذكاء الاصطناعي', 
            carrier: 'Logy AI Express' 
        }, 
        specs: { 
            'الماركة': 'أبل', 
            'الموديل': 'AirPods Pro 2', 
            'إلغاء الضوضاء': 'نعم', 
            'الحالة': 'ممتاز', 
            'البطارية': 'تدوم 6 ساعات', 
            'اللون': 'أبيض' 
        } 
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
 * RENDERING FUNCTIONS
 ************************/
function renderCategories() {
    const catContainer = document.getElementById('level1-scroll');
    if (!catContainer) return;
    
    catContainer.innerHTML = CATEGORIES.map((c, index) => `
        <div class="cat-item ${index === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

function renderProducts(catId = 'all', subId = null) {
    let filteredProducts = PRODUCTS;
    if (catId !== 'all') {
        filteredProducts = PRODUCTS.filter(p => p.cat === catId);
    }

    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 50px 0;">لم يتم العثور على منتجات في هذا التصنيف حالياً. جرب فلتر آخر.</p>';
        return;
    }

    grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color}; color:${p.ai_analysis.price_state_color};">
                    <i class="fa-solid fa-brain"></i> AI Score ${p.ai_analysis.score.toFixed(1)}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) {
        dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

/************************
 * CATEGORY SELECTION
 ************************/
function selectCategory(id, el) {
    document.querySelectorAll('#level1-scroll .cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    activeSub = null;
    
    const catData = CATEGORIES.find(c => c.id === id);
    const panel = document.getElementById('filter-panel');
    const level2Chips = document.getElementById('level2-chips');
    const level3Area = document.getElementById('level3-area');

    level2Chips.innerHTML = '';
    level3Area.innerHTML = '';
    
    if (catData.subs && catData.subs.length > 0) {
        level2Chips.innerHTML = catData.subs.map(s => `
            <div class="chip" data-sub-id="${s.id}" data-cat-id="${id}" onclick="selectSub(this)">${s.name}</div>
        `).join('');
        panel.classList.add('open');
        panel.style.maxHeight = "400px";
        panel.style.opacity = "1";
    } else {
        panel.classList.remove('open');
        panel.style.maxHeight = "0";
        panel.style.opacity = "0";
    }
    
    renderProducts(activeCategory, activeSub);
}

function selectSub(el) {
    document.querySelectorAll('#level2-chips .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeSub = el.getAttribute('data-sub-id');

    const catId = el.getAttribute('data-cat-id');
    const catData = CATEGORIES.find(c => c.id === catId);
    const subData = catData.subs.find(s => s.id === activeSub);
    const level3Area = document.getElementById('level3-area');

    if (subData.filters && subData.filters.length > 0) {
        level3Area.innerHTML = '<h5 style="font-size: 14px; margin: 15px 0 10px;">مرشحات Logy AI المخصصة:</h5>';
        subData.filters.forEach((filter, index) => {
            level3Area.innerHTML += `
                <div class="filter-group">
                    <label for="filter-${index}">${filter.split(':')[0]}:</label>
                    <input type="text" id="filter-${index}" placeholder="${filter.split(':')[1] ? filter.split(':')[1].trim() : 'أدخل قيمة'}">
                </div>
            `;
        });
        level3Area.innerHTML += `<button class="main-btn" onclick="applyFilters()" style="background: var(--accent); color: black; margin-top: 15px;">تطبيق مرشحات AI</button>`;
    } else {
        level3Area.innerHTML = '';
    }

    renderProducts(activeCategory, activeSub);
}

function applyFilters() {
    document.getElementById('products-grid').innerHTML = 
        '<div style="text-align:center; padding:50px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px;">جاري تحليل وتصفية آلاف المنتجات بواسطة Logy AI...</p></div>';

    setTimeout(() => {
        renderProducts(activeCategory, activeSub);
        alert(`تم تطبيق المرشحات بنجاح! \n\nالتصنيف الرئيسي: ${activeCategory}\nالتصنيف الفرعي: ${activeSub}\n\nعرضت نتائج بحث مخصصة بالذكاء الاصطناعي.`);
    }, 2000);
}

/************************
 * MODAL CONTROLS
 ************************/
function closeAllModals() {
    const modals = document.querySelectorAll('#product-detail-modal, #ai-upload-modal, #settingsModal, #checkoutModal, #ordersModal, #walletModal, #evidenceUploadModal, #notificationsModal, #sellerDashboardModal, #logyAiModal');
    modals.forEach(modal => modal.style.display = 'none');
    document.body.style.overflow = '';
}

function openProductDetail(id) {
    closeAllModals();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) {
        alert("❌ المنتج غير موجود");
        return;
    }

    selectedProduct = product;

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
    specsList.innerHTML = Object.entries(product.specs).map(([key, value]) => `
        <li style="display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);">
            <span style="color:var(--text-muted);">${key}</span>
            <span style="font-weight: bold;">${value}</span>
        </li>
    `).join('');

    showDetailTab('description', document.querySelector('.detail-tab-item[data-tab="description"]'));

    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    selectedProduct = null;
    document.body.style.overflow = '';
}

function showDetailTab(tabId, el) {
    document.querySelectorAll('.detail-tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(`detail-${tabId}`).style.display = 'block';
    el.classList.add('active');
}

function openCheckoutModal() {
    if (!selectedProduct) {
        alert("❌ لم يتم اختيار منتج");
        return;
    }
    
    document.getElementById('checkout-product-name').textContent = selectedProduct.name;
    document.getElementById('checkout-product-price').textContent = selectedProduct.price + ' Pi';
    document.getElementById('checkout-amount').textContent = selectedProduct.price;
    
    document.getElementById('product-detail-modal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    if (selectedProduct) {
        document.getElementById('product-detail-modal').style.display = 'block';
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
 * OTHER MODALS
 ************************/
window.openAiUploadModal = () => {
    closeAllModals();
    document.getElementById('ai-upload-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('manual-desc').oninput = checkAiUploadForm;
    document.getElementById('manual-price').oninput = checkAiUploadForm;
    document.getElementById('product-images').onchange = checkAiUploadForm;
    
    checkAiUploadForm();
};

window.closeAiUploadModal = () => {
    document.getElementById('ai-upload-modal').style.display = 'none';
    document.body.style.overflow = '';
};

function checkAiUploadForm() {
    const desc = document.getElementById('manual-desc')?.value.trim() || '';
    const filesCount = document.getElementById('product-images')?.files.length || 0;
    const btn = document.getElementById('start-analysis-btn');
    const fileLabel = document.getElementById('image-count-label');
    
    if (fileLabel) {
        fileLabel.textContent = filesCount > 0 ? 
            `تم اختيار ${filesCount} ملف(ات).` : 'لم يتم اختيار أي ملفات.';
    }

    if (btn) {
        if (desc.length > 10 && filesCount > 0) {
            btn.disabled = false;
            btn.style.opacity = '1';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    }
}

window.startAiAnalysis = () => {
    const btn = document.getElementById('start-analysis-btn');
    if (!btn) return;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحليل المنتج وإدراجه بواسطة Logy AI...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم الإدراج بنجاح!';
        const desc = document.getElementById('manual-desc').value || 'وصف لم يتم إدخاله';
        const price = document.getElementById('manual-price').value || 'سعر مقترح بواسطة AI';

        alert(`تهانينا! تم إدراج منتجك بنجاح. \n\nLogy AI قام بتحليل صورك وإدخالاتك (${desc})، وتم توليد عنوان ووصف احترافيين. \n\nالسعر المعتمد: ${price} Pi.\n\n Logy AI سيتولى التسويق والترويج لمنتجك عالمياً.`);

        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-microchip"></i> تحليل وإدراج المنتج الآن بواسطة AI';
            btn.disabled = false;
            closeAiUploadModal();
        }, 1000);
    }, 3000);
};

window.openSettingsModal = () => {
    closeAllModals();
    document.getElementById('settingsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeSettingsModal = () => {
    document.getElementById('settingsModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.logout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        // Clear saved session
        localStorage.removeItem('forsale_current_user');
        currentUser = null;
        
        // Close all modals
        closeAllModals();
        
        // Show login page
        document.getElementById("app-container").style.display = "none";
        document.getElementById("auth-container").style.display = "flex";
        
        // Clear form fields
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        
        console.log("👋 Logged out successfully");
    }
};

window.openOrdersModal = () => {
    closeAllModals();
    document.getElementById('ordersModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeOrdersModal = () => {
    document.getElementById('ordersModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openWalletModal = () => {
    closeAllModals();
    document.getElementById('walletModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeWalletModal = () => {
    document.getElementById('walletModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openNotificationsModal = () => {
    closeAllModals();
    unreadNotifications = 0;
    updateNotificationDot();
    document.getElementById('notificationsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeNotificationsModal = () => {
    document.getElementById('notificationsModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openLogyAiModal = () => {
    closeAllModals();
    document.getElementById('logyAiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderChat();
};

window.closeLogyAiModal = () => {
    document.getElementById('logyAiModal').style.display = 'none';
    document.body.style.overflow = '';
};

function renderChat() {
    const chatArea = document.getElementById('logy-chat-area');
    if (!chatArea) return;
    
    chatArea.innerHTML = logyMsgs.map(msg => `
        <div class="message-bubble msg-${msg.s}">${msg.t}</div>
    `).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    if (!input) return;
    
    const text = input.value.trim();
    if (text === '') return;

    logyMsgs.push({ s: 'user', t: text });
    input.value = '';
    renderChat();
    
    setTimeout(() => {
        const t_lower = text.toLowerCase();
        let aiResponse = 'أعتذر، لا أفهم سؤالك. يمكنني مساعدتك في البحث عن منتجات أو معلومات حول نظام Forsale AI.';

        if (t_lower.includes('بحث') || t_lower.includes('منتج')) {
            aiResponse = 'للبحث، استخدم شريط البحث الرئيسي. يمكنك وصف المنتج الذي تريده بالتفصيل (مثل: "ساعة يد فاخرة ذهبية مستعملة") وسأجد لك أفضل التواصيات!';
        } else if (t_lower.includes('بيع') || t_lower.includes('إدراج')) {
            aiResponse = 'ترغب في بيع منتجك بسرعة! قم بتحميل صورة المنتج من خلال أيقونة "+" في الأعلى، وسأقترح عليك أفضل سعر، وكتابة وصف جذاب لضمان بيع سريع وفعال.';
        } else if (t_lower.includes('عالمي') || t_lower.includes('عملاء')) {
            aiResponse = 'Forsale AI هو سوق عالمي بالكامل! الذكاء الاصطناعي لدينا مسؤول عن استهداف العملاء في جميع أنحاء العالم، وتكييف العروض، وإدارة اللوجستيات الدولية لضمان وصول منتجاتك لأكبر قاعدة مشتركين ممكنة.';
        } else if (!isNaN(parseInt(text))) {
            aiResponse = `تم العثور على الطلب رقم ${text}: حالته هو "في مرحلة الشحن". تم فحص المنتج بواسطة Logy AI للتأكد من الجودة. التوصيل المتوقع: 2025-11-28.`;
        }

        logyMsgs.push({ s: 'ai', t: aiResponse });
        renderChat();
    }, 1500);
}

function showApp(tab) {
    console.log("Navigate to:", tab);
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget?.classList.add('active');
}

function showRegister() {
    alert("🚀 نظام التسجيل قريباً!\n\nيمكنك استخدام أي بيانات للدخول التجريبي");
}

/************************
 * INITIALIZATION
 ************************/
function initializeApp() {
    renderCategories();
    renderProducts();
    updateNotificationDot();
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Forsale AI loaded");
    console.log("📱 Pi App: blackstyle");
    
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('forsale_current_user');
    
    if (savedUser) {
        // User was logged in before - go directly to app
        console.log("✅ Found saved user session");
        currentUser = JSON.parse(savedUser);
        
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        initializeApp();
        
        // Try to authenticate with Pi if in Pi Browser
        if (isPiBrowser()) {
            try {
                await authenticateUser();
            } catch (error) {
                console.log("⚠️ Pi auth failed, continuing with saved session");
            }
        }
    } else {
        // No saved session - show login page
        console.log("🔐 No saved session - showing login page");
        document.getElementById("auth-container").style.display = "flex";
        document.getElementById("app-container").style.display = "none";
    }
    
    // Setup Enter key for chat
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

/************************
 * LOGIN HANDLERS
 ************************/
document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    
    if (!email || !password) {
        alert("⚠️ يرجى إدخال البريد الإلكتروني وكلمة المرور");
        return;
    }
    
    // Simulate login
    const btn = document.getElementById('login-btn');
    btn.innerHTML = 'جاري الدخول... <i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    setTimeout(async () => {
        // Create or get user
        const user = { 
            email: email, 
            username: email.split('@')[0],
            joinDate: new Date().toISOString() 
        };
        
        // Save to localStorage
        localStorage.setItem('forsale_current_user', JSON.stringify(user));
        currentUser = user;
        
        // If in Pi Browser, also authenticate with Pi
        if (isPiBrowser()) {
            try {
                await authenticateUser();
            } catch (error) {
                console.log("⚠️ Pi auth optional, continuing with email login");
            }
        }
        
        // Show app
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        initializeApp();
        
        btn.innerHTML = 'دخول آمن <i class="fa-solid fa-arrow-left"></i>';
        btn.disabled = false;
    }, 1500);
});

document.getElementById('pi-login-btn')?.addEventListener('click', async () => {
    if (!isPiBrowser()) {
        alert("⚠️ يجب فتح التطبيق من Pi Browser\n\nافتح: minepi.com/blackstyle");
        return;
    }
    
    const btn = document.getElementById('pi-login-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    btn.disabled = true;
    
    try {
        const user = await authenticateUser();
        if (user) {
            // Save to localStorage
            localStorage.setItem('forsale_current_user', JSON.stringify(user));
            
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("app-container").style.display = "block";
            initializeApp();
        }
    } catch (error) {
        alert("❌ فشل تسجيل الدخول عبر Pi Network");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Browser';
        btn.disabled = false;
    }
});

document.getElementById('fingerprint-login-btn')?.addEventListener('click', async () => {
    if (!isPiBrowser()) {
        alert("⚠️ يجب فتح التطبيق من Pi Browser\n\nافتح: minepi.com/blackstyle");
        return;
    }
    
    const user = await authenticateUser();
    if (user) {
        // Save to localStorage
        localStorage.setItem('forsale_current_user', JSON.stringify(user));
        
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        initializeApp();
    }
});
