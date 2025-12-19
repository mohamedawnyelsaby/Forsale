// ============================================
// 📄 FILENAME: script.js
// 📍 PATH: frontend/script.js
// 🌍 Core Application Functionality
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
});

/**
 * Initializes core application functionality
 */
function initCoreFunctionality() {
    // Check if language overlay should be shown
    if (!localStorage.getItem('forsale_lang')) {
        document.getElementById('language-overlay').classList.remove('hidden');
    }
    
    // Initialize trust badge
    initTrustBadge();
    
    // Load products
    loadProducts();
}

/**
 * Sets up modal functionality
 */
function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal .icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Open product detail modal
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            document.getElementById('product-detail-modal').style.display = 'block';
        });
    });
    
    // Open AI upload modal
    document.querySelector('.icon-btn.primary')?.addEventListener('click', function() {
        document.getElementById('ai-upload-modal').style.display = 'block';
    });
    
    // Open settings modal
    document.querySelector('.icon-btn[data-tooltip="Settings"]')?.addEventListener('click', function() {
        document.getElementById('settingsModal').style.display = 'block';
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
        
        // In a real app, this would call the authentication API
        showNotification('Logging in...', 'info');
        
        // Simulate login success after 1 second
        setTimeout(() => {
            showNotification('Login successful!', 'success');
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
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
