// ========================================
// FORSALE - COMPLETE JAVASCRIPT IMPLEMENTATION
// World-Class Marketplace Application
// ========================================

// ============ STATE MANAGEMENT ============
const AppState = {
  user: null,
  products: [],
  categories: [],
  cart: [],
  favorites: [],
  currentView: 'home',
  isAuthenticated: false,
  notifications: [],
  conversations: []
};

// ============ MOCK DATA ============
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 0.5,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
    seller: 'Ahmed Mohamed',
    verified: true,
    rating: 4.9,
    reviews: 234,
    condition: 'Excellent',
    category: 'Electronics',
    description: 'Excellent condition iPhone 15 Pro Max, 256GB, barely used with all accessories included.',
    hot: true
  },
  {
    id: 2,
    name: 'MacBook Pro M3',
    price: 1.2,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    seller: 'Sara Ali',
    verified: true,
    rating: 4.8,
    reviews: 156,
    condition: 'Like New',
    category: 'Electronics',
    description: 'MacBook Pro 14" with M3 chip, 16GB RAM, 512GB SSD. Perfect condition.',
    hot: false
  },
  {
    id: 3,
    name: 'Canon EOS R6',
    price: 0.8,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    seller: 'Mohamed Hassan',
    verified: true,
    rating: 4.7,
    reviews: 89,
    condition: 'Good',
    category: 'Camera',
    description: 'Professional camera with 24-105mm lens. Great for photography enthusiasts.',
    hot: false
  },
  {
    id: 4,
    name: 'Sony PlayStation 5',
    price: 0.3,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    seller: 'Omar Khaled',
    verified: true,
    rating: 5.0,
    reviews: 45,
    condition: 'Excellent',
    category: 'Gaming',
    description: 'PS5 with extra controller and 3 games. Barely used, still under warranty.',
    hot: true
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    price: 0.15,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    seller: 'Fatma Ahmed',
    verified: true,
    rating: 4.9,
    reviews: 178,
    condition: 'Like New',
    category: 'Audio',
    description: 'Second generation AirPods Pro with USB-C. Excellent sound quality.',
    hot: false
  },
  {
    id: 6,
    name: 'Samsung Galaxy S24',
    price: 0.4,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    seller: 'Karim Youssef',
    verified: false,
    rating: 4.6,
    reviews: 67,
    condition: 'Good',
    category: 'Electronics',
    description: 'Galaxy S24 Ultra 512GB, titanium gray. Minor scratches but fully functional.',
    hot: false
  }
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '📱', count: 2345 },
  { id: 2, name: 'Computers', icon: '💻', count: 1567 },
  { id: 3, name: 'Camera', icon: '📷', count: 892 },
  { id: 4, name: 'Gaming', icon: '🎮', count: 1234 },
  { id: 5, name: 'Audio', icon: '🎧', count: 678 },
  { id: 6, name: 'Fashion', icon: '👔', count: 3456 },
  { id: 7, name: 'Home', icon: '🏠', count: 2189 },
  { id: 8, name: 'Sports', icon: '⚽', count: 987 }
];

// ============ UTILITY FUNCTIONS ============
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.innerHTML = content;
  return element;
}

function formatPrice(price) {
  return `${price.toFixed(2)} Pi`;
}

function showNotification(message, type = 'success') {
  const notification = createElement('div', `notification notification-${type}`, message);
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============ AUTHENTICATION ============
function showLogin() {
  $('#auth-container').style.display = 'flex';
  $('#app-container').style.display = 'none';
}

function showApp() {
  $('#auth-container').style.display = 'none';
  $('#app-container').style.display = 'block';
}

function login(email, password) {
  // Mock login - في الواقع هنا API call
  if (email && password) {
    AppState.isAuthenticated = true;
    AppState.user = {
      email: email,
      name: 'Mohamed Awny',
      verified: true,
      avatar: 'https://ui-avatars.com/api/?name=Mohamed+Awny&background=0066FF&color=fff'
    };
    
    showNotification('✅ Login successful!', 'success');
    showApp();
    initializeApp();
  } else {
    showNotification('❌ Invalid credentials', 'error');
  }
}

function loginWithPi() {
  // Pi Network login
  if (typeof Pi !== 'undefined') {
    Pi.authenticate(['username', 'payments'], onIncompletePaymentFound).then(function(auth) {
      console.log('Pi authenticated:', auth);
      AppState.isAuthenticated = true;
      AppState.user = {
        username: auth.user.username,
        uid: auth.user.uid,
        verified: true
      };
      showNotification('✅ Pi Network login successful!', 'success');
      showApp();
      initializeApp();
    }).catch(function(error) {
      console.error('Pi authentication error:', error);
      showNotification('❌ Pi login failed', 'error');
    });
  } else {
    showNotification('⚠️ Pi SDK not available', 'warning');
  }
}

function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment found:', payment);
  // Handle incomplete payment
}

function logout() {
  AppState.isAuthenticated = false;
  AppState.user = null;
  showLogin();
  showNotification('👋 Logged out successfully', 'success');
}

// ============ RENDER FUNCTIONS ============
function renderProducts(products = MOCK_PRODUCTS) {
  const grid = $('#products-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  products.forEach(product => {
    const card = createElement('div', 'product-card');
    card.onclick = () => openProductDetail(product);
    
    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        ${product.verified ? '<div class="product-badge badge-verified"><i class="fa-solid fa-check-circle"></i> Verified</div>' : ''}
        ${product.hot ? '<div class="product-badge badge-hot" style="top: 40px;"><i class="fa-solid fa-fire"></i> Hot</div>' : ''}
        <div class="product-favorite ${isFavorite(product.id) ? 'active' : ''}" onclick="toggleFavorite(event, ${product.id})">
          <i class="fa-${isFavorite(product.id) ? 'solid' : 'regular'} fa-heart"></i>
        </div>
      </div>
      <div class="product-info">
        <div class="product-seller">
          <i class="fa-solid fa-user-check"></i>
          <span>${product.seller}</span>
        </div>
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <span class="rating-stars">⭐ ${product.rating}</span>
          <span>(${product.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="quick-buy" onclick="quickBuy(event, ${product.id})">Buy</button>
        </div>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

function renderCategories(categories = MOCK_CATEGORIES) {
  const container = $('#categories-scroll');
  if (!container) return;
  
  container.innerHTML = '';
  
  categories.forEach(category => {
    const card = createElement('div', 'category-card');
    card.onclick = () => filterByCategory(category.id);
    
    card.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <div class="category-name">${category.name}</div>
      <div class="category-count">${category.count.toLocaleString()}</div>
    `;
    
    container.appendChild(card);
  });
}

// ============ PRODUCT DETAIL ============
function openProductDetail(product) {
  const modal = $('#product-detail-modal');
  if (!modal) return;
  
  $('#detail-img').src = product.image;
  $('#detail-title').textContent = product.name;
  $('#detail-price').textContent = formatPrice(product.price);
  $('#detail-desc').textContent = product.description;
  
  // AI Price Analysis
  const marketPrice = (product.price * 1.3).toFixed(2);
  const discount = Math.round(((marketPrice - product.price) / marketPrice) * 100);
  $('#ai-score').textContent = product.rating.toFixed(1);
  $('#ai-market-price').textContent = `${marketPrice} Pi`;
  
  // Store current product for checkout
  AppState.currentProduct = product;
  
  modal.classList.add('active');
  modal.style.display = 'flex';
}

function closeProductDetail() {
  const modal = $('#product-detail-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// ============ CHECKOUT ============
function openCheckout() {
  if (!AppState.currentProduct) return;
  
  const product = AppState.currentProduct;
  $('#checkout-product-name').textContent = product.name;
  $('#checkout-product-price').textContent = formatPrice(product.price);
  $('#checkout-amount').textContent = product.price.toFixed(2);
  
  closeProductDetail();
  
  const modal = $('#checkoutModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
}

function closeCheckout() {
  const modal = $('#checkoutModal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

function checkout() {
  if (!AppState.currentProduct) return;
  
  const product = AppState.currentProduct;
  
  // Pi Network Payment
  if (typeof Pi !== 'undefined') {
    Pi.createPayment({
      amount: product.price,
      memo: `Purchase: ${product.name}`,
      metadata: { productId: product.id }
    }, {
      onReadyForServerApproval: function(paymentId) {
        console.log('Payment ready for approval:', paymentId);
        // Call backend to approve payment
        completePayment(paymentId, product);
      },
      onReadyForServerCompletion: function(paymentId, txid) {
        console.log('Payment completed:', paymentId, txid);
        showNotification('✅ Payment successful!', 'success');
        closeCheckout();
      },
      onCancel: function(paymentId) {
        console.log('Payment cancelled:', paymentId);
        showNotification('⚠️ Payment cancelled', 'warning');
      },
      onError: function(error, payment) {
        console.error('Payment error:', error);
        showNotification('❌ Payment failed', 'error');
      }
    });
  } else {
    // Mock payment for testing
    setTimeout(() => {
      showNotification('✅ Order placed successfully!', 'success');
      closeCheckout();
    }, 1000);
  }
}

function completePayment(paymentId, product) {
  // هنا API call للـ backend
  console.log('Completing payment:', paymentId, product);
  // In production: fetch('/api/payments/complete', { method: 'POST', body: JSON.stringify({ paymentId, product }) })
}

// ============ FAVORITES ============
function isFavorite(productId) {
  return AppState.favorites.includes(productId);
}

function toggleFavorite(event, productId) {
  event.stopPropagation();
  
  const index = AppState.favorites.indexOf(productId);
  if (index > -1) {
    AppState.favorites.splice(index, 1);
    showNotification('💔 Removed from favorites', 'info');
  } else {
    AppState.favorites.push(productId);
    showNotification('❤️ Added to favorites', 'success');
  }
  
  // Update UI
  renderProducts();
}

// ============ QUICK BUY ============
function quickBuy(event, productId) {
  event.stopPropagation();
  
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (product) {
    AppState.currentProduct = product;
    openCheckout();
  }
}

// ============ SEARCH ============
function setupSearch() {
  const searchInput = $('.search-input');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length > 2) {
      const filtered = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    } else if (query.length === 0) {
      renderProducts();
    }
  });
}

// ============ MODALS ============
function openModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// Convenience functions for specific modals
function openSettings() { openModal('settingsModal'); }
function closeSettings() { closeModal('settingsModal'); }
function openOrders() { openModal('ordersModal'); }
function closeOrders() { closeModal('ordersModal'); }
function openWallet() { openModal('walletModal'); }
function closeWallet() { closeModal('walletModal'); }
function openNotifications() { openModal('notificationsModal'); }
function closeNotifications() { closeModal('notificationsModal'); }
function openAiUpload() { openModal('ai-upload-modal'); }
function closeAiUpload() { closeModal('ai-upload-modal'); }
function openLogyAi() { openModal('logyAiModal'); }
function closeLogyAi() { closeModal('logyAiModal'); }

// ============ NAVIGATION ============
function setupNavigation() {
  const navItems = $$('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active from all
      navItems.forEach(n => n.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');
    });
  });
}

// ============ CATEGORY FILTER ============
function filterByCategory(categoryId) {
  const category = MOCK_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return;
  
  const filtered = MOCK_PRODUCTS.filter(p => p.category === category.name);
  renderProducts(filtered);
  
  showNotification(`📂 Showing ${category.name}`, 'info');
  
  // Update active category
  $$('.category-card').forEach(card => card.classList.remove('active'));
  event.target.closest('.category-card').classList.add('active');
}

// ============ TABS ============
function showTab(tabName, element) {
  // Hide all tab contents
  $$('.detail-tab-content').forEach(tab => tab.style.display = 'none');
  
  // Remove active from all tabs
  $$('.detail-tab-item').forEach(tab => tab.classList.remove('active'));
  
  // Show selected tab
  $(`#detail-${tabName}`).style.display = 'block';
  
  // Add active to clicked tab
  element.classList.add('active');
}

// ============ INITIALIZATION ============
function initializeApp() {
  console.log('🚀 Forsale App Initialized');
  
  // Load initial data
  AppState.products = MOCK_PRODUCTS;
  AppState.categories = MOCK_CATEGORIES;
  
  // Render UI
  renderProducts();
  renderCategories();
  
  // Setup features
  setupSearch();
  setupNavigation();
  
  console.log('✅ App ready');
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 DOM Loaded');
  
  // Check if already authenticated
  if (AppState.isAuthenticated) {
    showApp();
    initializeApp();
  } else {
    showLogin();
  }
  
  // Login button
  const loginBtn = $('#login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      const email = $('#login-email').value;
      const password = $('#login-password').value;
      login(email, password);
    });
  }
  
  // Pi Login button
  const piLoginBtn = $('#pi-login-btn');
  if (piLoginBtn) {
    piLoginBtn.addEventListener('click', loginWithPi);
  }
  
  // Fingerprint login (mock)
  const fingerprintBtn = $('#fingerprint-login-btn');
  if (fingerprintBtn) {
    fingerprintBtn.addEventListener('click', function() {
      showNotification('🔐 Biometric login (mock)', 'info');
      // Simulate fingerprint
      setTimeout(() => {
        login('demo@forsale.com', 'demo123');
      }, 1000);
    });
  }
  
  // Enter key for login
  $('#login-password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
  
  console.log('✅ Event listeners attached');
});

// ============ GLOBAL FUNCTIONS (for HTML onclick) ============
window.login = login;
window.loginWithPi = loginWithPi;
window.logout = logout;
window.openProductDetail = openProductDetail;
window.closeProductDetail = closeProductDetail;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.checkout = checkout;
window.toggleFavorite = toggleFavorite;
window.quickBuy = quickBuy;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.openOrders = openOrders;
window.closeOrders = closeOrders;
window.openWallet = openWallet;
window.closeWallet = closeWallet;
window.openNotifications = openNotifications;
window.closeNotifications = closeNotifications;
window.openAiUpload = openAiUpload;
window.closeAiUpload = closeAiUpload;
window.openLogyAi = openLogyAi;
window.closeLogyAi = closeLogyAi;
window.showTab = showTab;
window.filterByCategory = filterByCategory;
window.showRegister = () => showNotification('🔜 Registration coming soon!', 'info');

console.log('✅ Forsale JS Loaded');
