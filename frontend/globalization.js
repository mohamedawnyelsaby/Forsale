// ============================================
// 📄 FILENAME: globalization.js
// 📍 PATH: frontend/globalization.js
// 🌍 Global Language & Region Management System
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system
    initLanguageSystem();
    
    // Set up language selection
    setupLanguageSelection();
    
    // Set up region-based features
    setupRegionFeatures();
});

/**
 * Initializes the language system
 */
function initLanguageSystem() {
    // Check if language is already set
    const savedLanguage = localStorage.getItem('forsale_lang') || 'en';
    const savedRegion = localStorage.getItem('forsale_region') || 'global';
    
    // Apply language and region
    applyLanguage(savedLanguage);
    applyRegion(savedRegion);
    
    // Update UI to reflect current language
    updateLanguageUI(savedLanguage, savedRegion);
}

/**
 * Sets up language selection event listeners
 */
function setupLanguageSelection() {
    // Language option buttons
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            const region = this.getAttribute('data-region');
            
            // Save preferences
            localStorage.setItem('forsale_lang', lang);
            localStorage.setItem('forsale_region', region);
            
            // Apply language and region
            applyLanguage(lang);
            applyRegion(region);
            
            // Hide language overlay
            document.getElementById('language-overlay').classList.add('hidden');
            
            // Show confirmation
            showNotification(`Language set to ${lang.toUpperCase()}`, 'success');
        });
    });
    
    // Skip language button
    document.getElementById('skip-language')?.addEventListener('click', function() {
        document.getElementById('language-overlay').classList.add('hidden');
        localStorage.setItem('forsale_lang', 'en');
        localStorage.setItem('forsale_region', 'global');
    });
}

/**
 * Applies language settings to the UI
 * @param {string} lang - Language code (e.g., 'en', 'ar')
 */
function applyLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Update direction for RTL languages
    if (['ar', 'he'].includes(lang)) {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key, lang);
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update current language display
    document.getElementById('current-language').textContent = lang.toUpperCase();
}

/**
 * Applies region settings to the UI
 * @param {string} region - Region code (e.g., 'global', 'middle-east')
 */
function applyRegion(region) {
    // Update data attribute for CSS targeting
    document.documentElement.setAttribute('data-region', region);
    
    // Update region-based styles
    updateRegionStyles(region);
}

/**
 * Updates UI to reflect current language selection
 * @param {string} lang - Current language code
 * @param {string} region - Current region code
 */
function updateLanguageUI(lang, region) {
    // Highlight current language option
    document.querySelectorAll('.language-option').forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        const optionRegion = option.getAttribute('data-region');
        
        if (optionLang === lang && optionRegion === region) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

/**
 * Updates region-specific styles
 * @param {string} region - Region code
 */
function updateRegionStyles(region) {
    // Add region class to body for CSS targeting
    document.body.className = region;
    
    // Update header region indicator
    const regionBadge = document.getElementById('user-trust-badge');
    if (regionBadge) {
        regionBadge.textContent = region.charAt(0).toUpperCase() + region.slice(1);
    }
}

/**
 * Gets translation for a given key
 * @param {string} key - Translation key
 * @param {string} lang - Language code
 * @returns {string} Translated text
 */
function getTranslation(key, lang) {
    const translations = {
        'en': {
            'search-placeholder': 'Search globally with AI...',
            'ai-shopper': 'Logy AI Personal Shopper',
            'safe-login': 'Secure Global Access',
            'welcome-msg': 'The Future of Global Commerce - Powered by Pi Network',
            'product-title': 'Product Details',
            'ai-analysis': 'Logy AI Price Analysis',
            'trust-score': 'Global Trust Index',
            'escrow-system': 'Secure Payment & Escrow System',
            'checkout': 'Order Summary',
            'settings': 'Account & Application Settings',
            'orders': 'AI-Managed Orders',
            'wallet': 'Pi Wallet',
            'notifications': 'Latest Notifications',
            'chat': 'Logy AI Chat'
        },
        'ar': {
            'search-placeholder': 'ابحث عالمياً بذكاء اصطناعي...',
            'ai-shopper': 'مساعد شخصي Logy AI',
            'safe-login': 'الوصول الآمن عالمياً',
            'welcome-msg': 'مستقبل التجارة العالمية - مدعوم بشبكة Pi',
            'product-title': 'تفاصيل المنتج',
            'ai-analysis': 'تحليل سعر Logy AI',
            'trust-score': 'مؤشر الثقة العالمي',
            'escrow-system': 'نظام الدفع الآمن والضمان',
            'checkout': 'ملخص الطلب',
            'settings': 'إعدادات الحساب والتطبيق',
            'orders': 'الطلبات المُدارة بالذكاء الاصطناعي',
            'wallet': 'محفظة Pi',
            'notifications': 'آخر التنبيهات',
            'chat': 'دردشة Logy AI'
        },
        // Add more languages as needed
    };
    
    return translations[lang]?.[key] || key;
}

/**
 * Shows notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    let notification = document.getElementById('global-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'global-notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

/**
 * Sets up region-specific features
 */
function setupRegionFeatures() {
    // Add event listeners for region filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const region = this.getAttribute('data-filter');
            applyRegion(region);
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}
