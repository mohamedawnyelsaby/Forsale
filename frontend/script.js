// ============================================
// 📄 FILENAME: script.js
// 📍 PATH: frontend/script.js
// 🌍 World-Class Application Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core functionality
    initCoreFunctionality();
    
    // Set up modals
    setupModals();
    
    // Set up navigation
    setupNavigation();
    
    // Set up form handling
    setupFormHandling();
    
    // Set up language system
    setupLanguageSystem();
    
    // Set up chat functionality
    setupChatFunctionality();
    
    // Check network status
    checkNetworkStatus();
    
    // Set up floating AI button
    setupFloatingAiButton();
});

function initCoreFunctionality() {
    // Hide auth container if user is already logged in
    if (localStorage.getItem('forsale_user')) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    }
    
    // Set initial language
    const savedLang = localStorage.getItem('forsale_lang') || 'en';
    const savedRegion = localStorage.getItem('forsale_region') || 'global';
    
    document.documentElement.setAttribute('lang', savedLang);
    document.documentElement.setAttribute('data-region', savedRegion);
    
    if (savedLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Update trust badge
    initTrustBadge();
}

function setupModals() {
    // Close buttons for all modals
    document.querySelectorAll('.modal .icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function setupNavigation() {
    // Footer navigation
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.footer-nav .nav-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            if (section) {
                navigateToSection(section);
            }
        });
    });
    
    // Header navigation buttons
    document.querySelector('.icon-btn.primary')?.addEventListener('click', function() {
        openModal('ai-upload-modal');
    });
    
    document.querySelector('.notification-icon-container')?.addEventListener('click', function() {
        openModal('notificationsModal');
    });
    
    document.querySelector('.icon-btn[data-tooltip="Settings"]')?.addEventListener('click', function() {
        openModal('settingsModal');
    });
    
    document.querySelector('.icon-btn[onclick="openCartModal()"]')?.addEventListener('click', function() {
        openModal('cartModal');
    });
}

function setupFormHandling() {
    // Login form submission
    document.getElementById('login-btn')?.addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        // Simulate login process
        showNotification('Logging in...', 'info');
        document.getElementById('login-btn').disabled = true;
        document.getElementById('login-btn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        
        setTimeout(() => {
            document.getElementById('login-btn').disabled = false;
            document.getElementById('login-btn').innerHTML = 'Secure Login <i class="fa-solid fa-arrow-right"></i>';
            
            const user = {
                id: 'user123',
                name: 'Pi User',
                email: email,
                trustScore: 98,
                region: localStorage.getItem('forsale_region') || 'global',
                language: localStorage.getItem('forsale_lang') || 'en'
            };
            
            localStorage.setItem('forsale_user', JSON.stringify(user));
            showNotification('Login successful!', 'success');
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }, 1500);
    });
    
    // Fingerprint login
    document.getElementById('fingerprint-login-btn')?.addEventListener('click', function() {
        showNotification('Biometric authentication in progress...', 'info');
        
        setTimeout(() => {
            const user = {
                id: 'user123',
                name: 'Pi User',
                email: 'user@example.com',
                trustScore: 98,
                region: localStorage.getItem('forsale_region') || 'global',
                language: localStorage.getItem('forsale_lang') || 'en'
            };
            
            localStorage.setItem('forsale_user', JSON.stringify(user));
            showNotification('Biometric authentication successful!', 'success');
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }, 1800);
    });
    
    // Pi Network login
    document.getElementById('pi-login-btn')?.addEventListener('click', function() {
        showNotification('Connecting to Pi Network...', 'info');
        
        setTimeout(() => {
            const user = {
                id: 'user123',
                name: 'Pi User',
                email: 'user@pi.com',
                trustScore: 98,
                region: localStorage.getItem('forsale_region') || 'global',
                language: localStorage.getItem('forsale_lang') || 'en'
            };
            
            localStorage.setItem('forsale_user', JSON.stringify(user));
            showNotification('Pi Network login successful!', 'success');
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }, 1800);
    });
}

function setupLanguageSystem() {
    // Language selector in header
    document.getElementById('language-btn')?.addEventListener('click', function() {
        openModal('language-overlay');
    });
    
    // Language selection
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
            
            // Update UI
            updateLanguageUI(lang);
            
            // Close overlay
            closeModal(document.getElementById('language-overlay'));
            
            // Show confirmation
            showNotification(`Language set to ${lang.toUpperCase()}`, 'success');
        });
    });
    
    // Skip language selection
    document.getElementById('skip-language')?.addEventListener('click', function() {
        closeModal(document.getElementById('language-overlay'));
        localStorage.setItem('forsale_lang', 'en');
        localStorage.setItem('forsale_region', 'global');
    });
}

function applyLanguage(lang) {
    // Update HTML attributes
    document.documentElement.setAttribute('lang', lang);
    
    // Update text direction
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Get translations
    const translations = getTranslations(lang);
    
    // Update all elements with translation keys
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[key] || key;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update current language display
    document.getElementById('current-language').textContent = lang.toUpperCase();
    
    // Update direction-specific styles
    updateDirectionStyles(lang);
}

function applyRegion(region) {
    // Update region attribute
    document.documentElement.setAttribute('data-region', region);
    
    // Update trust badge
    document.getElementById('user-trust-badge').textContent = region.charAt(0).toUpperCase() + region.slice(1);
}

function getTranslations(lang) {
    const translations = {
        en: {
            'search-placeholder': 'Search globally with AI...',
            'safe-login': 'Secure Global Access',
            'welcome-msg': 'The Future of Global Commerce - Powered by Pi Network',
            'fingerprint-text': 'Biometric Pi Login',
            'pi-login-text': 'Pi Network Login',
            'chat-placeholder': 'Ask Logy AI anything about shopping, products, or orders...',
            'ai-suggestion-1': 'Find similar products',
            'ai-suggestion-2': 'Price comparison',
            'ai-suggestion-3': 'Shipping information'
        },
        ar: {
            'search-placeholder': 'ابحث عالمياً باستخدام الذكاء الاصطناعي...',
            'safe-login': 'الوصول الآمن عالمياً',
            'welcome-msg': 'مستقبل التجارة العالمية - مدعوم بشبكة Pi',
            'fingerprint-text': 'تسجيل الدخول بالبصمة',
            'pi-login-text': 'تسجيل الدخول بشبكة Pi',
            'chat-placeholder': 'اسأل Logy AI أي شيء عن التسوق، المنتجات، أو الطلبات...',
            'ai-suggestion-1': 'البحث عن منتجات مشابهة',
            'ai-suggestion-2': 'مقارنة الأسعار',
            'ai-suggestion-3': 'معلومات الشحن'
        },
        zh: {
            'search-placeholder': '使用AI全球搜索...',
            'safe-login': '安全全球访问',
            'welcome-msg': '全球商务的未来 - 由Pi网络驱动',
            'fingerprint-text': '生物识别Pi登录',
            'pi-login-text': 'Pi网络登录',
            'chat-placeholder': '向Logy AI询问有关购物、产品或订单的任何问题...',
            'ai-suggestion-1': '查找类似产品',
            'ai-suggestion-2': '价格比较',
            'ai-suggestion-3': '运输信息'
        },
        hi: {
            'search-placeholder': 'AI के साथ वैश्विक खोजें...',
            'safe-login': 'सुरक्षित वैश्विक पहुंच',
            'welcome-msg': 'वैश्विक वाणिज्य का भविष्य - Pi नेटवर्क द्वारा संचालित',
            'fingerprint-text': 'बायोमेट्रिक Pi लॉगिन',
            'pi-login-text': 'Pi नेटवर्क लॉगिन',
            'chat-placeholder': 'Logy AI से खरीदारी, उत्पादों, या आदेशों के बारे में कुछ भी पूछें...',
            'ai-suggestion-1': 'इसी तरह के उत्पाद खोजें',
            'ai-suggestion-2': 'मूल्य तुलना',
            'ai-suggestion-3': 'शिपिंग जानकारी'
        }
    };
    
    return translations[lang] || translations['en'];
}

function updateDirectionStyles(lang) {
    // Update text alignment for RTL languages
    if (lang === 'ar') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
}

function setupChatFunctionality() {
    // Send message functionality
    document.getElementById('logy-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    document.querySelector('.logy-send-btn')?.addEventListener('click', function() {
        sendMessage();
    });
    
    // AI suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.textContent;
            document.getElementById('logy-input').value = message;
            sendMessage();
        });
    });
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response after delay
    setTimeout(() => {
        hideTypingIndicator();
        
        const responses = {
            'hello': 'Hello! I\'m Logy AI, your personal shopping assistant. How can I help you today?',
            'how are you': 'I\'m excellent! Ready to help you with your shopping needs. What can I assist you with?',
            'price': 'I can help you find the best prices! Just tell me what product you\'re interested in.',
            'shipping': 'I provide real-time shipping updates and tracking for all your orders. What would you like to know?',
            'product': 'I can analyze products with AI to give you detailed insights about quality, value, and authenticity!'
        };
        
        let response = 'I understand you\'re asking about "' + message + '". Let me help you with that!';
        
        // Check for keywords
        for (const [key, value] of Object.entries(responses)) {
            if (message.toLowerCase().includes(key)) {
                response = value;
                break;
            }
        }
        
        // Add AI response
        addMessage(response, 'ai');
    }, 1500);
}

function addMessage(text, sender) {
    const chatArea = document.querySelector('.chat-container');
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble msg-${sender}`;
    messageElement.textContent = text;
    
    chatArea.appendChild(messageElement);
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

function showTypingIndicator() {
    const chatArea = document.querySelector('.chat-container');
    const indicator = document.createElement('div');
    indicator.className = 'message-bubble msg-ai typing-indicator';
    indicator.innerHTML = '<i class="fa-solid fa-ellipsis"></i> Logy AI is typing...';
    indicator.id = 'typing-indicator';
    chatArea.appendChild(indicator);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function setupFloatingAiButton() {
    document.querySelector('.ai-floating-btn')?.addEventListener('click', function() {
        openLogyAiModal();
    });
}

function openLogyAiModal() {
    openModal('logyAiModal');
    
    // Focus on input field
    setTimeout(() => {
        document.getElementById('logy-input')?.focus();
    }, 300);
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first input if exists
        setTimeout(() => {
            const input = modal.querySelector('input, textarea');
            if (input) input.focus();
        }, 300);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('global-notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

function initTrustBadge() {
    const trustBadge = document.getElementById('user-trust-badge');
    if (trustBadge) {
        const savedRegion = localStorage.getItem('forsale_region') || 'global';
        trustBadge.textContent = savedRegion.charAt(0).toUpperCase() + savedRegion.slice(1);
    }
}

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

// Navigation functions
function navigateToSection(section) {
    showNotification(`Navigating to ${section}...`, 'info');
}

function openCartModal() {
    openModal('cartModal');
}

function openSettingsModal() {
    openModal('settingsModal');
}

function openNotificationsModal() {
    openModal('notificationsModal');
}

// Chat functions
function closeLogyAiModal() {
    closeModal(document.getElementById('logyAiModal'));
}

// Initialization
function updateLanguageUI(lang) {
    // Update language button text
    document.getElementById('current-language').textContent = lang.toUpperCase();
    
    // Update suggestion buttons
    if (lang === 'ar') {
        document.querySelectorAll('.suggestion-btn')[0].textContent = 'البحث عن منتجات مشابهة';
        document.querySelectorAll('.suggestion-btn')[1].textContent = 'مقارنة الأسعار';
        document.querySelectorAll('.suggestion-btn')[2].textContent = 'معلومات الشحن';
    } else {
        document.querySelectorAll('.suggestion-btn')[0].textContent = 'Find similar products';
        document.querySelectorAll('.suggestion-btn')[1].textContent = 'Price comparison';
        document.querySelectorAll('.suggestion-btn')[2].textContent = 'Shipping information';
    }
}

// Fallback for Pi SDK
document.addEventListener('pi:loaded', function() {
    console.log('Pi SDK loaded successfully');
});

document.addEventListener('pi:error', function(e) {
    console.error('Pi SDK error:', e.detail);
    showNotification('Pi Network connection error. Using fallback authentication.', 'error');
});
