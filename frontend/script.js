// ============================================
// 📄 FILENAME: script.js
// 📍 PATH: frontend/script.js
// 🌍 Core Application Functionality - Final Production Version
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core functionality
    initCoreFunctionality();
    
    // Set up modals
    setupModals();
    
    // Set up navigation
    setupNavigation();
    
    // Set up product interactions
    setupProductInteractions();
    
    // Set up form handling
    setupFormHandling();
    
    // Check network status
    checkNetworkStatus();
    
    // Initialize language system
    initLanguageSystem();
    
    // Set up language selection
    setupLanguageSelection();
    
    // Set up region-based features
    setupRegionFeatures();
    
    // Initialize trust badge
    initTrustBadge();
    
    // Load products
    loadProducts();
});

/**
 * Initializes core application functionality
 */
function initCoreFunctionality() {
    // Check if language overlay should be shown
    if (!localStorage.getItem('forsale_lang')) {
        document.getElementById('language-overlay').classList.remove('hidden');
    }
    
    // Prevent body scrolling when modal is open
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('show', function() {
            document.body.classList.add('no-scroll');
        });
        
        modal.addEventListener('hide', function() {
            document.body.classList.remove('no-scroll');
        });
    });
}

/**
 * Sets up modal functionality
 */
function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal .icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
        });
    });
    
    // Open product detail modal
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            document.getElementById('product-detail-modal').style.display = 'block';
            document.body.classList.add('no-scroll');
        });
    });
    
    // Open AI upload modal
    document.querySelector('.icon-btn.primary')?.addEventListener('click', function() {
        document.getElementById('ai-upload-modal').style.display = 'block';
        document.body.classList.add('no-scroll');
    });
    
    // Open settings modal
    document.querySelector('.icon-btn[data-tooltip="Settings"]')?.addEventListener('click', function() {
        document.getElementById('settingsModal').style.display = 'block';
        document.body.classList.add('no-scroll');
    });
}

/**
 * Sets up navigation functionality
 */
function setupNavigation() {
    // Footer navigation
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            document.querySelectorAll('.footer-nav .nav-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation (this would be expanded in a real app)
            const section = this.getAttribute('data-section');
            if (section) {
                navigateToSection(section);
            }
        });
    });
    
    // Language button
    document.getElementById('language-btn')?.addEventListener('click', function() {
        document.getElementById('language-overlay').classList.remove('hidden');
    });
}

/**
 * Sets up product interactions
 */
function setupProductInteractions() {
    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            document.querySelectorAll('.category-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Filter products (would be implemented in a real app)
            const category = this.getAttribute('data-category');
            filterProductsByCategory(category);
        });
    });
    
    // Tab selection
    document.querySelectorAll('.detail-tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.detail-tab-item').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabName = this.getAttribute('data-tab');
            document.querySelectorAll('.detail-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`detail-${tabName}`).style.display = 'block';
        });
    });
}

/**
 * Sets up form handling
 */
function setupFormHandling() {
    // Login form
    document.getElementById('login-btn')?.addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        // Simulate login
        showNotification('Logging in...', 'info');
        
        // Simulate login success after 1 second
        setTimeout(() => {
            showNotification('Login successful!', 'success');
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            document.body.classList.remove('no-scroll');
        }, 1000);
    });
    
    // Register button
    document.querySelector('.auth-footer a')?.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Registration coming soon', 'info');
    });
    
    // AI analysis button
    document.getElementById('start-analysis-btn')?.addEventListener('click', function() {
        showNotification('Analyzing product with AI...', 'info');
        
        // Simulate AI analysis
        setTimeout(() => {
            showNotification('Product analysis complete!', 'success');
            // In a real app, this would submit the product to the backend
        }, 2000);
    });
    
    // Fingerprint login
    document.getElementById('fingerprint-login-btn')?.addEventListener('click', function() {
        showNotification('Biometric authentication in progress...', 'info');
        
        // Simulate fingerprint login
        setTimeout(() => {
            showNotification('Biometric authentication successful!', 'success');
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            document.body.classList.remove('no-scroll');
        }, 1500);
    });
    
    // Pi Network login
    document.getElementById('pi-login-btn')?.addEventListener('click', function() {
        showNotification('Connecting to Pi Network...', 'info');
        
        // Simulate Pi Network login
        setTimeout(() => {
            showNotification('Pi Network login successful!', 'success');
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            document.body.classList.remove('no-scroll');
        }, 1500);
    });
}

/**
 * Initializes trust badge
 */
function initTrustBadge() {
    const trustBadge = document.getElementById('user-trust-badge');
    if (trustBadge) {
        trustBadge.textContent = '98%';
        trustBadge.style.background = 'linear-gradient(45deg, var(--trust-excellent), #1ABC9C)';
    }
}

/**
 * Loads products (simulated)
 */
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Clear skeleton loaders
    productsGrid.innerHTML = '';
    
    // Add sample products
    const products = [
        { id: 1, title: 'iPhone 15 Pro', price: '0.01', image: 'assets/placeholder-1.jpg' },
        { id: 2, title: 'Samsung Galaxy S24', price: '0.009', image: 'assets/placeholder-2.jpg' },
        { id: 3, title: 'MacBook Air M3', price: '0.5', image: 'assets/placeholder-3.jpg' },
        { id: 4, title: 'Sony WH-1000XM5', price: '0.05', image: 'assets/placeholder-4.jpg' }
    ];
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-trust-score', '99%');
        
        productCard.innerHTML = `
            <div class="p-img-box">
                <img src="${product.image}" alt="${product.title}">
                <div class="ai-tag"><i class="fa-solid fa-microchip"></i> AI Analyzed</div>
            </div>
            <div class="p-details">
                <div class="p-name">${product.title}</div>
                <div class="p-price">${product.price} Pi</div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

/**
 * Filters products by category
 * @param {string} category - Category to filter by
 */
function filterProductsByCategory(category) {
    // In a real app, this would make an API call to filter products
    showNotification(`Filtering by ${category}...`, 'info');
}

/**
 * Navigates to a specific section
 * @param {string} section - Section ID
 */
function navigateToSection(section) {
    // In a real app, this would handle navigation to different sections
    showNotification(`Navigating to ${section}...`, 'info');
}

/**
 * Checks network status
 */
function checkNetworkStatus() {
    const statusElement = document.getElementById('network-status');
    
    function updateStatus() {
        if (navigator.onLine) {
            statusElement.textContent = 'Online';
            statusElement.className = 'network-status online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'network-status offline';
        }
    }
    
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
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
 * Initializes language system
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
 * Sets up region-based features
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

/**
 * Handles voice search
 */
function startVoiceSearch() {
    showNotification('Voice search activated. Speak now!', 'info');
    
    // In a real app, this would use Web Speech API
    setTimeout(() => {
        showNotification('Voice search complete!', 'success');
    }, 2000);
}

/**
 * Handles visual search
 */
function openVisualSearch() {
    showNotification('Visual search activated. Upload an image!', 'info');
    
    // In a real app, this would open camera or image upload
}

/**
 * Handles AI recommendations
 */
function openAiRecommendations() {
    showNotification('Generating AI recommendations...', 'info');
    
    // In a real app, this would call AI recommendation engine
    setTimeout(() => {
        showNotification('AI recommendations ready!', 'success');
    }, 2000);
}

/**
 * Shows product detail tab
 * @param {string} tabName - Tab name
 * @param {Element} tabElement - Tab element
 */
function showDetailTab(tabName, tabElement) {
    // Remove active class from all tabs
    document.querySelectorAll('.detail-tab-item').forEach(t => {
        t.classList.remove('active');
    });
    
    // Add active class to clicked tab
    tabElement.classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('.detail-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`detail-${tabName}`).style.display = 'block';
}

/**
 * Opens checkout modal
 */
function openCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'block';
    document.body.classList.add('no-scroll');
}

/**
 * Closes product detail modal
 */
function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes AI upload modal
 */
function closeAiUploadModal() {
    document.getElementById('ai-upload-modal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes settings modal
 */
function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes checkout modal
 */
function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes orders modal
 */
function closeOrdersModal() {
    document.getElementById('ordersModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes wallet modal
 */
function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes notifications modal
 */
function closeNotificationsModal() {
    document.getElementById('notificationsModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes Logy AI modal
 */
function closeLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Closes cart modal
 */
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Opens Logy AI modal
 */
function openLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'block';
    document.body.classList.add('no-scroll');
}

/**
 * Opens cart modal
 */
function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
    document.body.classList.add('no-scroll');
}

/**
 * Shows register form
 */
function showRegister() {
    showNotification('Registration coming soon', 'info');
}

/**
 * Enables two-factor authentication
 */
function enableTwoFactorAuth() {
    showNotification('Two-factor authentication enabled!', 'success');
}

/**
 * Logs out user
 */
function logout() {
    showNotification('Logging out...', 'info');
    setTimeout(() => {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        document.body.classList.remove('no-scroll');
        showNotification('Logged out successfully!', 'success');
    }, 1000);
}

/**
 * Processes checkout
 */
function processCheckout() {
    showNotification('Processing payment...', 'info');
    setTimeout(() => {
        showNotification('Payment successful! Order confirmed.', 'success');
        document.getElementById('checkoutModal').style.display = 'none';
        document.body.classList.remove('no-scroll');
    }, 2000);
}

/**
 * Navigates to home
 */
function navigateToHome() {
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('auth-container').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

/**
 * Starts AI analysis
 */
function startAiAnalysis() {
    showNotification('Analyzing product with AI...', 'info');
    setTimeout(() => {
        showNotification('Product analysis complete!', 'success');
    }, 2000);
}
