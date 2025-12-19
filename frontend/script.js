// ============================================
// 📄 FILENAME: script.js (Main Application)
// 📍 PATH: frontend/script.js
// ============================================

const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
let paymentInProgress = false;
let currentUser = null;
let currentPage = 1;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 Forsale AI Global Marketplace loaded");
  console.log("📱 Pi App: blackstyle");
  
  // Initialize all systems
  initializeApp();
  
  // Load initial products
  await loadProducts();
  
  // Setup event listeners
  setupEventListeners();
  
  // Check if Pi Browser
  if (isPiBrowser()) {
    console.log("✅ Running in Pi Browser");
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    
    try {
      await authenticateUser();
    } catch (error) {
      console.log("⚠️ Auto-auth failed, will prompt when needed");
    }
  } else {
    console.log("⚠️ Not in Pi Browser - Demo mode");
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
  }
});

// ============================================
// APP INITIALIZATION
// ============================================

function initializeApp() {
  // Initialize i18n if available
  if (typeof i18n !== 'undefined') {
    i18n.init();
    renderLanguageSelector();
  }
  
  // Initialize search if available
  if (typeof searchEngine !== 'undefined' && typeof searchUI !== 'undefined') {
    searchUI.init();
  }
  
  // Initialize cart if available
  if (typeof cart !== 'undefined') {
    cart.init();
  }
  
  // Update UI
  updateAllUI();
}

function updateAllUI() {
  // Update navigation items
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (typeof i18n !== 'undefined') {
      el.textContent = i18n.t(key);
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (typeof i18n !== 'undefined') {
      el.placeholder = i18n.t(key);
    }
  });
}

// ============================================
// LANGUAGE SELECTOR
// ============================================

function renderLanguageSelector() {
  if (typeof i18n === 'undefined') return;
  
  const list = document.getElementById('language-list');
  if (!list) return;
  
  const languages = i18n.getAvailableLanguages();
  
  list.innerHTML = languages.map(lang => `
    <div class="language-item ${lang.code === i18n.currentLang ? 'active' : ''}"
         onclick="changeLanguage('${lang.code}')">
      <span class="language-flag">${lang.flag}</span>
      <span class="language-name">${lang.name}</span>
      ${lang.code === i18n.currentLang ? '<i class="fa-solid fa-check language-check"></i>' : ''}
    </div>
  `).join('');
}

function changeLanguage(langCode) {
  if (typeof i18n === 'undefined') return;
  
  const success = i18n.setLanguage(langCode);
  if (success) {
    renderLanguageSelector();
    updateAllUI();
    closeLanguageModal();
    
    // Reload products with new language
    loadProducts();
  }
}

function openLanguageModal() {
  document.getElementById('languageModal').style.display = 'block';
}

function closeLanguageModal() {
  document.getElementById('languageModal').style.display = 'none';
}

// ============================================
// PRODUCT LOADING
// ============================================

async function loadProducts(page = 1) {
  try {
    showLoading();
    currentPage = page;
    
    // If search engine is available, use it
    if (typeof searchEngine !== 'undefined') {
      searchEngine.setFilter('page', page);
      const results = await searchEngine.search();
      displayProducts(results.products);
      displayPagination(results.pagination);
    } else {
      // Fallback to mock data
      displayProducts(MOCK_PRODUCTS);
    }
    
  } catch (error) {
    console.error('Failed to load products:', error);
    showError('Failed to load products. Please try again.');
  } finally {
    hideLoading();
  }
}

function displayProducts(products) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  
  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open" style="font-size: 60px; color: var(--text-muted);"></i>
        <p style="color: var(--text-muted); margin-top: 15px;">No products found</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="product-card glass-panel" onclick="openProductDetail(${product.id})">
      <div class="p-img-box">
        <img src="${product.image || product.images?.[0] || 'placeholder.jpg'}" 
             alt="${product.name || product.title}">
        <div class="ai-tag">
          <i class="fa-solid fa-microchip"></i>
          <span data-i18n="product_verified">AI Verified</span>
        </div>
        ${product.condition ? `
          <div class="condition-badge">${product.condition}</div>
        ` : ''}
      </div>
      <div class="p-details">
        <div class="p-name">${product.name || product.title}</div>
        <div class="p-price">${product.price || product.price_pi} Pi</div>
        ${product.shipping_free ? `
          <div class="shipping-badge">
            <i class="fa-solid fa-truck"></i>
            <span data-i18n="product_shipping">Free Shipping</span>
          </div>
        ` : ''}
      </div>
      <button class="quick-add-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
        <i class="fa-solid fa-cart-plus"></i>
      </button>
    </div>
  `).join('');
}

function displayPagination(pagination) {
  const container = document.getElementById('pagination-container');
  if (!container || !pagination) return;
  
  const { page, pages, total } = pagination;
  
  if (pages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let paginationHTML = `
    <button class="pagination-btn" 
            onclick="loadProducts(${page - 1})"
            ${page === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;
  
  // Show max 5 page numbers
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(pages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === page ? 'active' : ''}"
              onclick="loadProducts(${i})">
        ${i}
      </button>
    `;
  }
  
  paginationHTML += `
    <button class="pagination-btn" 
            onclick="loadProducts(${page + 1})"
            ${page === pages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
  
  container.innerHTML = paginationHTML;
}

// ============================================
// PRODUCT DETAIL
// ============================================

async function openProductDetail(id) {
  try {
    // Find product (from search results or mock data)
    const product = findProductById(id);
    
    if (!product) {
      alert("❌ Product not found");
      return;
    }
    
    selectedProduct = product;
    
    // Populate modal
    document.getElementById("detail-title").innerText = product.name || product.title;
    document.getElementById("detail-price").innerText = (product.price || product.price_pi) + " Pi";
    document.getElementById("detail-img").src = product.image || product.images?.[0] || 'placeholder.jpg';
    document.getElementById("detail-desc").innerText = product.description || 'No description available';
    
    // AI Analysis (mock for now)
    document.getElementById("ai-score").innerText = "9.2";
    document.getElementById("ai-market-price").innerText = (product.price || product.price_pi) + " Pi";
    
    // Show modal
    document.getElementById("product-detail-modal").style.display = "block";
    
  } catch (error) {
    console.error('Failed to open product detail:', error);
    showError('Failed to load product details');
  }
}

function findProductById(id) {
  // Try to find in search results first
  if (typeof searchEngine !== 'undefined' && searchEngine.lastResults) {
    const found = searchEngine.lastResults.find(p => p.id === id);
    if (found) return found;
  }
  
  // Fallback to mock data
  return MOCK_PRODUCTS.find(p => p.id === id);
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").style.display = "none";
  selectedProduct = null;
}

// ============================================
// QUICK ADD TO CART
// ============================================

function quickAddToCart(productId) {
  const product = findProductById(productId);
  if (!product) return;
  
  if (typeof cart !== 'undefined') {
    cart.addItem(product, 1);
  } else {
    console.warn('Cart system not available');
    alert('Added to cart!');
  }
}

// ============================================
// UI HELPERS
// ============================================

function showLoading() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.style.display = 'flex';
  }
}

function hideLoading() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

function showError(message) {
  alert('❌ ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('main-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (typeof searchEngine !== 'undefined') {
          searchEngine.setFilter('query', e.target.value);
          searchUI.performSearch();
        }
      }, 500);
    });
  }
  
  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// ============================================
// PI NETWORK INTEGRATION
// ============================================

function isPiBrowser() {
  return typeof window.Pi !== "undefined";
}

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

// ============================================
// MOCK DATA (Fallback)
// ============================================

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro (Titanium)",
    price: 0.01,
    description: "iPhone 15 Pro in excellent condition with all accessories. 6 months warranty.",
    image: "https://images.unsplash.com/photo-1592286927505-b86dc33748b5?w=400",
    category: "electronics",
    condition: "Like New"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 0.05,
    description: "Brand new MacBook Pro M3 with official Apple warranty.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "electronics",
    condition: "New"
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    price: 0.02,
    description: "AirPods Pro Gen 2 with Active Noise Cancellation.",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
    category: "electronics",
    condition: "New"
  },
  {
    id: 4,
    name: "Nike Air Max 2024",
    price: 0.015,
    description: "Latest Nike Air Max sneakers, size 42.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "fashion",
    condition: "New"
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    price: 0.025,
    description: "Premium noise-cancelling headphones.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
    category: "electronics",
    condition: "Like New"
  },
  {
    id: 6,
    name: "Gaming Chair RGB",
    price: 0.03,
    description: "Ergonomic gaming chair with RGB lighting.",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400",
    category: "home",
    condition: "New"
  }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE,
    loadProducts,
    displayProducts,
    openProductDetail,
    quickAddToCart
  };
}
