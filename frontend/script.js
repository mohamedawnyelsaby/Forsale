// ============================================
// بيانات محاكاة محلية
// ============================================
let currentUser = null;
const users = JSON.parse(localStorage.getItem('forsale_users')) || [];
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;
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
        // يتم تعيين display: flex هنا كحالة افتراضية
        document.getElementById('auth-container').style.display = 'flex';
    }
}

/**
 * @description وظيفة إظهار التطبيق الرئيسي وإغلاق جميع النوافذ المنبثقة.
 * 🚨 Fix: تم إضافة closeAllModals() لضمان عمل شريط التنقل السفلي.
 */
function showApp() {
    closeAllModals();
    // ⬅️ الإضافة اللازمة لحل مشكلة التنقل
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initializeApp();
}

function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const fingerprintBtn = document.getElementById('fingerprint-login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');

    const handleLogin = () => {
        // محاكاة تأثير التحميل
        loginBtn.innerHTML = 'جاري الدخول... <i class="fa-solid fa-spinner fa-spin"></i>';
        loginBtn.disabled = true;

        // محاكاة الدخول
        setTimeout(() => {
            const email = document.getElementById('login-email').value || 'user@example.com';
            const password = document.getElementById('login-password').value || 'password';

            // البحث عن المستخدم في قاعدة البيانات المحلية
            
            const user = users.find(u => u.email === email && u.password === password);

            if (user || (email && password)) {
                // حفظ حالة تسجيل الدخول
                if (!user) {
                    // إنشاء مستخدم جديد إذا لم يكن موجوداً
                    const newUser = { id: Date.now(), email: email, password: password, joinDate: new Date().toISOString() };
                    users.push(newUser);
                    localStorage.setItem('forsale_users', JSON.stringify(users));

                    localStorage.setItem('forsale_current_user', JSON.stringify(newUser));
                } else {
                    localStorage.setItem('forsale_current_user', JSON.stringify(user));
                }
                showApp();
            } else {
                alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                loginBtn.innerHTML = 'دخول آمن <i class="fa-solid fa-arrow-left"></i>';
                loginBtn.disabled = false;
            }
        }, 1500);
    }

    loginBtn.addEventListener('click', handleLogin);
    fingerprintBtn.addEventListener('click', handleLogin);
    piLoginBtn.addEventListener('click', handleLogin);
}

function showRegister() {
    alert('🚀 نظام التسجيل قريباً!\n\nيمكنك استخدام أي بيانات للدخول التجريبي');
}

// ============================================
// البيانات الهيكلية الكاملة للفئات والمنتجات
// ============================================
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
    { id: 'p1', name: 'iPhone 15 Pro (Titanium)', price: 105000, cat: 'tech', details: 'جهاز آيفون 15 برو مستعمل لمدة شهر واحد، بحالة ممتازة (100% بدون خدوش)، اللون تيتانيوم طبيعي، سعة 256 جيجا بايت. مرفق بالصندوق وجميع الإكسسوارات الأصلية. تم فحصه من قبل Logy AI.', img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro', ai_analysis: { score: 9.2, market_price: 110000, summary: 'عرض ممتاز وسعر تنافسي مقارنة بحالة الجهاز والمواصفات. فرصة شراء سريعة. يوصي به Logy AI بشدة.', price_state_color: '#00f2ff' }, shipping_ai: { eta: '3-5 أيام عمل', problem_handling: 'إدارة المشاكل: مراقبة شحن مدارة بالذكاء الاصطناعي على مدار الساعة.', carrier: 'Logy AI Express' }, specs: { 'الماركة': 'أبل', 'الموديل': 'آيفون 15 برو', 'سعة التخزين': '256 جيجا بايت', 'اللون': 'تيتانيوم طبيعي', 'حالة البطارية': '98%', 'الكاميرا': 'ثلاثية العدسات (48MP رئيسية)', 'المعالج': 'A17 Bionic', 'نظام التشغيل': 'iOS الأحدث' } },
    { id: 'p2', name: 'MacBook Pro 2024 (M3 Max)', price: 155000, cat: 'tech', details: 'لابتوب احترافي جديد، لم يستخدم إلا بضع ساعات. معالج M3 Max، ذاكرة 32GB، سعة 1TB SSD. مثالي للمصممين والمطورين. ضمان سنة متبقية.', img: 'https://placehold.co/600x400/0a1128/FFD700?text=MacBook+Pro', ai_analysis: { score: 8.8, market_price: 155000, summary: 'السعر يتوافق تماماً مع القيمة السوقية والمواصفات الحديثة. Logy AI ينصح به للمحترفين.', price_state_color: '#FFD700' }, shipping_ai: { eta: '5-7 أيام عمل', problem_handling: 'إدارة المشاكل: مراقبة شحن مدارة بالذكاء الاصطناعي على مدار الساعة.', carrier: 'Logy AI Express' }, specs: { 'الماركة': 'أبل', 'الموديل': 'ماك بوك برو', 'المعالج': 'M3 Max', 'الذاكرة': '32GB', 'التخزين': '1TB SSD', 'الشاشة': '16 بوصة Liquid Retina XDR', 'اللون': 'فضاء أسود', 'الحالة': 'جديد' } },
    { id: 'p3', name: 'فيلا مودرن بالرياض', price: 1500000, cat: 'real', details: 'فيلا فاخرة بتصميم عصري، مساحة 500 متر مربع، 6 غرف نوم، ومسبح خاص. تقع في حي راقٍ بالرياض، وتشطيبات سوبر لوكس مع حديقة واسعة وموقف سيارات يتسع لثلاث سيارات. فرصة استثمارية وسكنية لا تعوض.', img: 'https://placehold.co/800x600/1a1a1a/2ECC71?text=Villa+Riyadh', ai_analysis: { score: 9.9, market_price: 1800000, summary: 'فرصة استثمارية نادرة! السعر أقل بكثير من القيمة السوقية للموقع والتشطيب. Logy AI يوصي بالتحرك السريع.', price_state_color: '#00f2ff' }, shipping_ai: { eta: 'تحويل ملكية خلال 14 يوم', problem_handling: 'إدارة المشاكل: Logy AI يراجع مستندات الملكية والتحويل.', carrier: 'Logy AI Legal' }, specs: { 'الموقع': 'شمال الرياض', 'المساحة': '500 متر مربع', 'عدد الغرف': '6', 'الحالة': 'جديد', 'المرافق': 'مسبح، حديقة، موقف سيارات', 'وثائق': 'سند ملكية جاهز' } },
    { id: 'p4', name: 'ساعة يد كلاسيكية (نزاع)', price: 15000, cat: 'fashion', details: 'ساعة يد كلاسيكية نادرة ماركة سويسرية، تعود لعام 1970. تعمل بحالة ممتازة. (هذا المنتج حالياً في مرحلة نزاع مع المشتري).', img: 'https://placehold.co/400x400/4A90E2/ffffff?text=Vintage+Watch', ai_analysis: { score: 7.0, market_price: 18000, summary: 'سعر مقبول، ولكن هناك خطر بيع بطيء بسبب التخصص. تم فتح نزاع عليها.', price_state_color: '#FF5252' }, shipping_ai: { eta: 'قيد التحكيم', problem_handling: 'إدارة المشاكل: Logy AI يقوم بمراجعة أدلة البائع والمشتري.', carrier: 'Logy AI Arbitration' }, specs: { 'الماركة': 'سويسرية كلاسيكية', 'الموديل': '1970 Vintage', 'نوع المعدن': 'فولاذ مقاوم للصدأ', 'الحالة': 'مستعمل (نزاع)', 'الحركة': 'ميكانيكية يدوية', 'المقاومة للماء': 'لا' } }
];
// ============================================
// 1. وظائف العرض والرسم (Rendering)
// ============================================
function renderCategories() {
    const catContainer = document.getElementById('level1-scroll');
    catContainer.innerHTML = CATEGORIES.map((c, index) => `
        <div class="cat-item ${index === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

function renderProducts(catId = 'all', subId = null) {
    let filteredProducts = PRODUCTS;
    if (catId !== 'all') {
        const subCategory = CATEGORIES.find(c => c.id === catId)?.subs.find(s => s.id === subId);
        // في حالة تطبيق مرشحات حقيقية، سيتم تصفية المنتجات بناءً على catId و subCategory
        // حالياً، نكتفي بعرض الكل كمحاكاة
    }

    const grid = document.getElementById('products-grid');
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

// **2. وظائف اختيار التصنيف والفلاتر الديناميكية (مصححة)**
function selectCategory(id, el) {
    document.querySelectorAll('#level1-scroll .cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    activeSub = null; // إعادة تعيين الفرعي
    
    const catData = CATEGORIES.find(c => c.id === id);
    const panel = document.getElementById('filter-panel');
    const level2Chips = document.getElementById('level2-chips');
    const level3Area = document.getElementById('level3-area');

    level2Chips.innerHTML = '';
    level3Area.innerHTML = '';
    if (catData.subs && catData.subs.length > 0) {
        // Render Level 2 chips
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

/* منطق توليد حقول إدخال المرشحات (المستوى 3) ديناميكياً */
function selectSub(el) {
    document.querySelectorAll('#level2-chips .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeSub = el.getAttribute('data-sub-id');

    const catId = el.getAttribute('data-cat-id');
    const catData = CATEGORIES.find(c => c.id === catId);
    const subData = catData.subs.find(s => s.id === activeSub);
    const level3Area = document.getElementById('level3-area');
    // توليد حقول الفلاتر (مثل dropdowns أو حقول نصية) بناءً على filters
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
    // محاكاة تطبيق الفلاتر
    document.getElementById('products-grid').innerHTML = 
        '<div style="text-align:center; padding:50px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px;">جاري تحليل وتصفية آلاف المنتجات بواسطة Logy AI...</p></div>';
    setTimeout(() => {
        document.getElementById('products-grid').innerHTML = '';
        // Clear simulation
        renderProducts(); // Render original products as a fallback example
        alert(`تم تطبيق المرشحات بنجاح! \n\nالتصنيف الرئيسي: ${activeCategory}\nالتصنيف الفرعي: ${activeSub}\n\nعرضت نتائج بحث مخصصة بالذكاء الاصطناعي.`);
    }, 2000);
    // 2 ثانية محاكاة
}

// **3. وظائف النوافذ المنبثقة (Modals)**
function closeAllModals() {
    const modals = document.querySelectorAll('#product-detail-modal, #ai-upload-modal, #settingsModal, #checkoutModal, #ordersModal, #walletModal, #evidenceUploadModal, #notificationsModal, #sellerDashboardModal, #logyAiModal');
    modals.forEach(modal => modal.style.display = 'none');
    document.body.style.overflow = '';
}

// وظائف تفاصيل المنتج (#product-detail-modal)
function openProductDetail(id) {
    closeAllModals();
    // NEW: إغلاق أي نافذة مفتوحة قبل عرض التفاصيل
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

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
    
    // رسم المواصفات الفنية
    const specsList = document.getElementById('specs-list');
    specsList.innerHTML = Object.entries(product.specs).map(([key, value]) => `
        <li style="display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);">
            <span style="color:var(--text-muted);">${key}</span>
            <span style="font-weight: bold;">${value}</span>
        </li>
    `).join('');
    // إعادة ضبط علامات التبويب إلى الوصف
    showDetailTab('description', document.querySelector('.detail-tab-item[data-tab="description"]'));

    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function showDetailTab(tabId, el) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.detail-tab-content').forEach(content => content.style.display = 'none');
    // إزالة حالة النشاط من جميع الأزرار
    document.querySelectorAll('.detail-tab-item').forEach(item => item.classList.remove('active'));
    // إظهار المحتوى المطلوب وتفعيل الزر
    document.getElementById(`detail-${tabId}`).style.display = 'block';
    el.classList.add('active');
}

// وظائف رفع منتج جديد (#ai-upload-modal)
function checkAiUploadForm() {
    const desc = document.getElementById('manual-desc').value.trim();
    const filesCount = document.getElementById('product-images').files.length;
    const btn = document.getElementById('start-analysis-btn');
    const fileLabel = document.getElementById('image-count-label');
    
    fileLabel.textContent = filesCount > 0 ?
    `تم اختيار ${filesCount} ملف(ات).` : 'لم يتم اختيار أي ملفات.';
    // تفعيل الزر إذا كان هناك وصف (أطول من 10 أحرف) وصور تم اختيارها
    if (desc.length > 10 && filesCount > 0) {
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

window.openAiUploadModal = () => {
    closeAllModals();
    // NEW: إغلاق أي نافذة مفتوحة
    document.getElementById('ai-upload-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    // ربط الدالة بأحداث الإدخال والتغيير
    document.getElementById('manual-desc').oninput = checkAiUploadForm;
    document.getElementById('manual-price').oninput = checkAiUploadForm;
    document.getElementById('product-images').onchange = checkAiUploadForm;
    
    // التحقق المبدئي لضبط حالة الزر (سيجعله معطلاً إذا لم يتم إدخال شيء)
    checkAiUploadForm();
};

window.closeAiUploadModal = () => {
    document.getElementById('ai-upload-modal').style.display = 'none';
    document.body.style.overflow = '';
};
window.startAiAnalysis = () => {
    document.getElementById('start-analysis-btn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحليل المنتج وإدراجه بواسطة Logy AI...';
    document.getElementById('start-analysis-btn').disabled = true;

    setTimeout(() => {
        document.getElementById('start-analysis-btn').innerHTML = '<i class="fa-solid fa-check"></i> تم الإدراج بنجاح!';
        const desc = document.getElementById('manual-desc').value || 'وصف لم يتم إدخاله';
        const price = document.getElementById('manual-price').value || 'سعر مقترح بواسطة AI';

        alert(`تهانينا! تم إدراج منتجك بنجاح. \n\nLogy AI قام بتحليل صورك وإدخالاتك (${desc})، وتم توليد عنوان ووصف احترافيين. \n\nالسعر المعتمد: ${price} Pi.\n\n Logy AI سيتولى التسويق والترويج لمنتجك عالمياً.`);

        // إعادة الزر إلى حالته الأصلية
        setTimeout(() => {
            document.getElementById('start-analysis-btn').innerHTML = '<i class="fa-solid fa-microchip"></i> تحليل وإدراج المنتج الآن بواسطة AI';
            document.getElementById('start-analysis-btn').disabled = false;
            closeAiUploadModal();
        }, 1000);
    }, 3000);
    // 3 ثواني محاكاة تحليل AI
};
// وظائف نافذة الإعدادات (#settingsModal)
window.openSettingsModal = () => {
    closeAllModals();
    document.getElementById('settingsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeSettingsModal = () => {
    document.getElementById('settingsModal').style.display = 'none';
    document.body.style.overflow = '';
};
window.simulateMainnetTransition = () => {
    alert('جاري محاكاة الانتقال إلى شبكة Pi Network الرئيسية (Mainnet)... \n\nفي الواقع، سيتم هذا الانتقال تلقائياً وبسلاسة بمجرد فتح الشبكة للعالم الخارجي، مما يضمن استمرارية خدمات Forsale AI.');
}

// وظائف نافذة الدفع (#checkoutModal)
window.openCheckoutModal = () => {
    closeAllModals();
    // محاكاة إعداد بيانات المنتج للدفع (يجب أن تكون ديناميكية في تطبيق حقيقي)
    const product = PRODUCTS.find(p => p.id === 'p1');
    // يفترض المنتج الأول للشراء التجريبي
    document.getElementById('checkout-product-name').textContent = product.name;
    document.getElementById('checkout-product-price').textContent = `${product.price.toLocaleString()} Pi`;
    document.getElementById('checkoutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeCheckoutModal = () => {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = '';
};

function checkout() {
    alert('جاري التوجه إلى محفظة Pi Wallet للتفويض بالدفع الآمن (Escrow). سيتم حجز 105,000 Pi حتى تأكيد الاستلام.');
    closeCheckoutModal();
    openOrdersModal(); // محاكاة الانتقال إلى صفحة الطلبات بعد الدفع
}

// وظائف نافذة الطلبات (#ordersModal)
window.openOrdersModal = () => {
    closeAllModals();
    document.getElementById('ordersModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeOrdersModal = () => {
    document.getElementById('ordersModal').style.display = 'none';
    document.body.style.overflow = '';
};

// وظائف نافذة رفع دليل جديد للنزاع (#evidenceUploadModal)
function checkEvidenceForm() {
    const desc = document.getElementById('evidence-description').value.trim();
    const filesCount = document.getElementById('evidence-files').files.length;
    const btn = document.getElementById('submit-evidence-btn');
    const fileLabel = document.getElementById('file-count-label');
    
    fileLabel.textContent = filesCount > 0 ?
    `تم اختيار ${filesCount} ملف(ات).` : 'لم يتم اختيار أي ملفات.';
    // تفعيل الزر إذا كان هناك وصف (أطول من 10 أحرف) أو ملفات تم اختيارها
    if (desc.length > 10 || filesCount > 0) {
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

window.openEvidenceUploadModal = () => {
    closeAllModals();
    // NEW: إغلاق أي نافذة مفتوحة
    document.getElementById('evidenceUploadModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    // ربط الدوال بأحداث الإدخال والتغيير
    document.getElementById('evidence-description').oninput = checkEvidenceForm;
    document.getElementById('evidence-files').onchange = checkEvidenceForm;
    // تنظيف النموذج قبل الفتح
    document.getElementById('evidence-description').value = '';
    document.getElementById('evidence-files').value = '';
    checkEvidenceForm();
    // التحقق المبدئي (سيجعله معطلاً)
};

window.closeEvidenceUploadModal = () => {
    document.getElementById('evidenceUploadModal').style.display = 'none';
    document.body.style.overflow = '';
};

function submitEvidence() {
    alert('تم إرسال أدلتك بنجاح. Logy AI سيبدأ مراجعة شاملة للأدلة خلال 24 ساعة.');
    closeEvidenceUploadModal();
}

// وظائف نافذة الإشعارات (#notificationsModal)
window.openNotificationsModal = () => {
    closeAllModals();
    unreadNotifications = 0; // محاكاة قراءة الإشعارات
    updateNotificationDot();
    document.getElementById('notificationsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeNotificationsModal = () => {
    document.getElementById('notificationsModal').style.display = 'none';
    document.body.style.overflow = '';
};

// وظائف الدردشة Logy AI Chat (#logyAiModal)
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
    chatArea.innerHTML = logyMsgs.map(msg => `
        <div class="message-bubble msg-${msg.s}">${msg.t}</div>
    `).join('');
    // التمرير إلى الأسفل
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const text = input.value.trim();
    if (text === '') return;

    logyMsgs.push({ s: 'user', t: text });
    input.value = '';
    renderChat();
    // محاكاة استجابة الذكاء الاصطناعي
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
    }, 1500); // 1.5 ثانية لمحاكاة معالجة AI
}

// وظائف نافذة المحفظة (#walletModal)
window.openWalletModal = () => {
    closeAllModals();
    // NEW: إغلاق أي نافذة مفتوحة
    document.getElementById('walletModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeWalletModal = () => {
    document.getElementById('walletModal').style.display = 'none';
    document.body.style.overflow = '';
};
function deposit() {
    alert('جاري التوجه إلى Pi Wallet لإجراء الإيداع. المعاملات مؤمنة بالكامل ومدمجة مع Pi Network.');
}

function withdraw() {
    alert('جاري التوجه إلى Pi Wallet لإجراء السحب. جميع عمليات السحب تخضع للمراجعة الأمنية الآلية Logy AI.');
}

/* ============================================ */
/* وظائف لوحة تحكم البائع (#sellerDashboardModal) */
/* ============================================ */
window.openSellerDashboardModal = () => {
    closeAllModals();
    // دالة موجودة في الكود الأساسي
    document.getElementById('sellerDashboardModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeSellerDashboardModal = () => {
    document.getElementById('sellerDashboardModal').style.display = 'none';
    document.body.style.overflow = '';
};
function viewListingDetails(productId) {
    alert(`جاري عرض تفاصيل المنتج: ${productId}\n(هنا يتم فتح صفحة تفاصيل المنتج مع خيارات التعديل للبائع).`);
}

function viewOrderShipment(orderId) {
    alert(`جاري عرض تفاصيل الطلب: ${orderId}\n(هنا يتم فتح صفحة تتبع الطلب وخيارات الشحن).`);
}

// تهيئة التطبيق الرئيسي
function initializeApp() {
    renderCategories();
    renderProducts();
    selectCategory('all', document.querySelector('.cat-item')); // Select 'الكل' initially
    updateNotificationDot();
    // إظهار النقطة الحمراء في البداية
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    // 🚨 تم تعطيل التحقق التلقائي هنا لضمان ظهور صفحة الدخول في كل مرة
    // checkLoginStatus(); 
    
    // **إصلاح زر Enter في الدردشة (Logy AI Chat)**
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
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
        // 1️⃣ إنشاء Payment من الـ Backend
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

        // 2️⃣ فتح واجهة الدفع الرسمية
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
