// ============================================
// 📄 FILENAME: i18n.js (Global Language System)
// 📍 PATH: frontend/js/i18n.js
// 🌍 Supports: English, Arabic, Spanish, French, German, Chinese, Japanese, Korean, Portuguese, Russian
// ============================================

const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_categories: "Categories",
    nav_cart: "Cart",
    nav_orders: "Orders",
    nav_wallet: "Wallet",
    nav_profile: "Profile",
    nav_ai_chat: "AI Assistant",
    
    // Search & Filters
    search_placeholder: "Search with AI or describe your dream product...",
    filter_all: "All",
    filter_price: "Price",
    filter_condition: "Condition",
    filter_location: "Location",
    filter_brand: "Brand",
    filter_apply: "Apply Filters",
    filter_clear: "Clear All",
    
    // Categories
    cat_electronics: "Electronics",
    cat_fashion: "Fashion",
    cat_home: "Home & Garden",
    cat_sports: "Sports",
    cat_books: "Books",
    cat_toys: "Toys",
    cat_automotive: "Automotive",
    cat_beauty: "Beauty",
    
    // Product Card
    product_verified: "AI Verified",
    product_new: "New",
    product_used: "Used",
    product_shipping: "Free Shipping",
    product_views: "views",
    
    // Product Detail
    detail_description: "Description",
    detail_specs: "Specifications",
    detail_reviews: "Reviews",
    detail_seller: "Seller Info",
    detail_shipping: "Shipping Details",
    detail_buy_now: "Buy Now",
    detail_add_cart: "Add to Cart",
    detail_add_wishlist: "Add to Wishlist",
    detail_share: "Share",
    detail_report: "Report",
    
    // AI Features
    ai_price_analysis: "AI Price Analysis",
    ai_recommendation: "AI Recommends",
    ai_market_price: "Market Average",
    ai_deal_score: "Deal Score",
    ai_shipping_eta: "Estimated Delivery",
    ai_fraud_check: "Fraud Protection",
    
    // Checkout
    checkout_title: "Checkout",
    checkout_summary: "Order Summary",
    checkout_subtotal: "Subtotal",
    checkout_shipping: "Shipping",
    checkout_tax: "Tax",
    checkout_total: "Total",
    checkout_payment: "Payment Method",
    checkout_address: "Shipping Address",
    checkout_confirm: "Confirm & Pay",
    
    // Orders
    orders_pending: "Pending",
    orders_processing: "Processing",
    orders_shipped: "Shipped",
    orders_delivered: "Delivered",
    orders_cancelled: "Cancelled",
    orders_track: "Track Order",
    orders_dispute: "Open Dispute",
    
    // Authentication
    auth_login: "Login",
    auth_register: "Sign Up",
    auth_email: "Email",
    auth_password: "Password",
    auth_forgot: "Forgot Password?",
    auth_pi_login: "Login with Pi Browser",
    auth_no_account: "Don't have an account?",
    auth_have_account: "Already have an account?",
    
    // Wallet
    wallet_balance: "Balance",
    wallet_deposit: "Deposit",
    wallet_withdraw: "Withdraw",
    wallet_history: "Transaction History",
    
    // Seller Dashboard
    seller_dashboard: "Seller Dashboard",
    seller_products: "My Products",
    seller_orders: "Incoming Orders",
    seller_earnings: "Earnings",
    seller_analytics: "Analytics",
    seller_add_product: "Add New Product",
    
    // Settings
    settings_title: "Settings",
    settings_account: "Account",
    settings_language: "Language",
    settings_currency: "Currency",
    settings_notifications: "Notifications",
    settings_privacy: "Privacy",
    settings_security: "Security",
    settings_help: "Help & Support",
    settings_logout: "Logout",
    
    // Notifications
    notif_new_order: "New order received",
    notif_shipped: "Your order has been shipped",
    notif_delivered: "Order delivered",
    notif_review: "Please review your purchase",
    notif_price_drop: "Price drop alert",
    
    // Common
    common_save: "Save",
    common_cancel: "Cancel",
    common_delete: "Delete",
    common_edit: "Edit",
    common_view: "View",
    common_close: "Close",
    common_loading: "Loading...",
    common_error: "Error",
    common_success: "Success",
    common_confirm: "Confirm",
    common_yes: "Yes",
    common_no: "No",
  },
  
  ar: {
    // Navigation
    nav_home: "الرئيسية",
    nav_categories: "التصنيفات",
    nav_cart: "السلة",
    nav_orders: "الطلبات",
    nav_wallet: "المحفظة",
    nav_profile: "الملف الشخصي",
    nav_ai_chat: "مساعد الذكاء الاصطناعي",
    
    // Search & Filters
    search_placeholder: "ابحث بذكاء اصطناعي أو صف منتج أحلامك...",
    filter_all: "الكل",
    filter_price: "السعر",
    filter_condition: "الحالة",
    filter_location: "الموقع",
    filter_brand: "العلامة التجارية",
    filter_apply: "تطبيق الفلاتر",
    filter_clear: "مسح الكل",
    
    // Categories
    cat_electronics: "إلكترونيات",
    cat_fashion: "أزياء",
    cat_home: "منزل وحديقة",
    cat_sports: "رياضة",
    cat_books: "كتب",
    cat_toys: "ألعاب",
    cat_automotive: "سيارات",
    cat_beauty: "جمال",
    
    // Product Card
    product_verified: "موثق بالذكاء الاصطناعي",
    product_new: "جديد",
    product_used: "مستعمل",
    product_shipping: "شحن مجاني",
    product_views: "مشاهدة",
    
    // Product Detail
    detail_description: "الوصف",
    detail_specs: "المواصفات",
    detail_reviews: "التقييمات",
    detail_seller: "معلومات البائع",
    detail_shipping: "تفاصيل الشحن",
    detail_buy_now: "شراء الآن",
    detail_add_cart: "أضف للسلة",
    detail_add_wishlist: "أضف للمفضلة",
    detail_share: "مشاركة",
    detail_report: "إبلاغ",
    
    // AI Features
    ai_price_analysis: "تحليل السعر بالذكاء الاصطناعي",
    ai_recommendation: "يوصي الذكاء الاصطناعي",
    ai_market_price: "متوسط السوق",
    ai_deal_score: "نقاط العرض",
    ai_shipping_eta: "موعد التوصيل المتوقع",
    ai_fraud_check: "حماية من الاحتيال",
    
    // Checkout
    checkout_title: "إتمام الشراء",
    checkout_summary: "ملخص الطلب",
    checkout_subtotal: "المجموع الفرعي",
    checkout_shipping: "الشحن",
    checkout_tax: "الضريبة",
    checkout_total: "الإجمالي",
    checkout_payment: "طريقة الدفع",
    checkout_address: "عنوان الشحن",
    checkout_confirm: "تأكيد والدفع",
    
    // Orders
    orders_pending: "قيد الانتظار",
    orders_processing: "قيد المعالجة",
    orders_shipped: "تم الشحن",
    orders_delivered: "تم التوصيل",
    orders_cancelled: "ملغي",
    orders_track: "تتبع الطلب",
    orders_dispute: "فتح نزاع",
    
    // Authentication
    auth_login: "تسجيل الدخول",
    auth_register: "إنشاء حساب",
    auth_email: "البريد الإلكتروني",
    auth_password: "كلمة المرور",
    auth_forgot: "نسيت كلمة المرور؟",
    auth_pi_login: "تسجيل الدخول عبر Pi Browser",
    auth_no_account: "ليس لديك حساب؟",
    auth_have_account: "لديك حساب بالفعل؟",
    
    // Wallet
    wallet_balance: "الرصيد",
    wallet_deposit: "إيداع",
    wallet_withdraw: "سحب",
    wallet_history: "سجل المعاملات",
    
    // Seller Dashboard
    seller_dashboard: "لوحة تحكم البائع",
    seller_products: "منتجاتي",
    seller_orders: "الطلبات الواردة",
    seller_earnings: "الأرباح",
    seller_analytics: "التحليلات",
    seller_add_product: "إضافة منتج جديد",
    
    // Settings
    settings_title: "الإعدادات",
    settings_account: "الحساب",
    settings_language: "اللغة",
    settings_currency: "العملة",
    settings_notifications: "الإشعارات",
    settings_privacy: "الخصوصية",
    settings_security: "الأمان",
    settings_help: "المساعدة والدعم",
    settings_logout: "تسجيل الخروج",
    
    // Notifications
    notif_new_order: "طلب جديد وارد",
    notif_shipped: "تم شحن طلبك",
    notif_delivered: "تم توصيل الطلب",
    notif_review: "يرجى تقييم مشترياتك",
    notif_price_drop: "تنبيه انخفاض السعر",
    
    // Common
    common_save: "حفظ",
    common_cancel: "إلغاء",
    common_delete: "حذف",
    common_edit: "تعديل",
    common_view: "عرض",
    common_close: "إغلاق",
    common_loading: "جاري التحميل...",
    common_error: "خطأ",
    common_success: "نجح",
    common_confirm: "تأكيد",
    common_yes: "نعم",
    common_no: "لا",
  },
  
  es: {
    // Navigation
    nav_home: "Inicio",
    nav_categories: "Categorías",
    nav_cart: "Carrito",
    nav_orders: "Pedidos",
    nav_wallet: "Billetera",
    nav_profile: "Perfil",
    nav_ai_chat: "Asistente IA",
    
    search_placeholder: "Buscar con IA o describe tu producto soñado...",
    filter_all: "Todo",
    cat_electronics: "Electrónica",
    auth_login: "Iniciar sesión",
    common_save: "Guardar",
  },
  
  fr: {
    nav_home: "Accueil",
    nav_categories: "Catégories",
    nav_cart: "Panier",
    search_placeholder: "Rechercher avec IA ou décrire votre produit de rêve...",
    auth_login: "Connexion",
  },
  
  de: {
    nav_home: "Startseite",
    nav_categories: "Kategorien",
    nav_cart: "Warenkorb",
    search_placeholder: "Mit KI suchen oder Ihr Traumprodukt beschreiben...",
    auth_login: "Anmelden",
  },
  
  zh: {
    nav_home: "首页",
    nav_categories: "分类",
    nav_cart: "购物车",
    search_placeholder: "用AI搜索或描述您的梦想产品...",
    auth_login: "登录",
  },
  
  ja: {
    nav_home: "ホーム",
    nav_categories: "カテゴリー",
    nav_cart: "カート",
    search_placeholder: "AIで検索するか、夢の製品を説明してください...",
    auth_login: "ログイン",
  },
  
  ko: {
    nav_home: "홈",
    nav_categories: "카테고리",
    nav_cart: "장바구니",
    search_placeholder: "AI로 검색하거나 꿈의 제품을 설명하세요...",
    auth_login: "로그인",
  },
  
  pt: {
    nav_home: "Início",
    nav_categories: "Categorias",
    nav_cart: "Carrinho",
    search_placeholder: "Pesquisar com IA ou descrever seu produto dos sonhos...",
    auth_login: "Entrar",
  },
  
  ru: {
    nav_home: "Главная",
    nav_categories: "Категории",
    nav_cart: "Корзина",
    search_placeholder: "Искать с ИИ или описать продукт мечты...",
    auth_login: "Войти",
  },
};

// ============================================
// i18n Manager Class
// ============================================
class I18nManager {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    this.init();
  }
  
  detectLanguage() {
    // Check localStorage
    const saved = localStorage.getItem('app_language');
    if (saved && translations[saved]) return saved;
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) return browserLang;
    
    // Default to English
    return 'en';
  }
  
  init() {
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.dir;
    this.applyTranslations();
  }
  
  t(key) {
    return translations[this.currentLang]?.[key] || translations.en[key] || key;
  }
  
  setLanguage(lang) {
    if (!translations[lang]) return false;
    
    this.currentLang = lang;
    this.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = this.dir;
    
    this.applyTranslations();
    return true;
  }
  
  applyTranslations() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
  }
  
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    ];
  }
}

// Initialize
const i18n = new I18nManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { i18n, I18nManager };
}
