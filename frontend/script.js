// ============================================
// 📄 FILENAME: script.js (FIXED WITH DEBUG)
// 📍 PATH: frontend/script.js
// ============================================

const API_BASE = "https://forsale-production.up.railway.app";

let selectedProduct = null;
let currentUser = null;
let currentPage = 1;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 Forsale AI initializing...");
  console.log("📍 API Base:", API_BASE);
  
  try {
    // Initialize app
    initializeApp();
    
    // Load products
    await loadProducts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show app
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    
    console.log("✅ App initialized successfully");
    
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    showError("Failed to initialize app: " + error.message);
  }
});

// ============================================
// APP INITIALIZATION
// ============================================

function initializeApp() {
  if (typeof i18n !== 'undefined') {
    i18n.init();
    renderLanguageSelector();
  }
  
  if (typeof searchUI !== 'undefined') {
    searchUI.init();
  }
  
  if (typeof cart !== 'undefined') {
    cart.init();
  }
  
  updateAllUI();
}

function updateAllUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (typeof i18n !== 'undefined') {
      el.textContent = i18n.t(key);
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (typeof i18n !== 'undefined') {
      el.placeholder = i18n.t(key);
    }
  });
}

// ============================================
// PRODUCT LOADING (FIXED)
// ============================================

async function loadProducts(page = 1) {
  try {
    console.log(`📦 Loading products... (Page ${page})`);
    showLoading();
    currentPage = page;
    
    // Try API first
    try {
      const url = `${API_BASE}/api/products?page=${page}&limit=20`;
      console.log("📡 Fetching:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Products received:", data);
      
      if (data.success && data.data) {
        displayProducts(data.data.products || []);
        displayPagination(data.data.pagination);
        console.log("✅ Products loaded successfully");
        return;
      }
      
    } catch (apiError) {
      console.warn("⚠️ API failed:", apiError.message);
      console.log("🔄 Falling back to mock data...");
    }
    
    // Fallback to mock data
    displayProducts(MOCK_PRODUCTS);
    displayPagination({
      page: 1,
      limit: 20,
      total: MOCK_PRODUCTS.length,
      pages: 1
    });
    console.log("✅ Mock products loaded");
    
  } catch (error) {
    console.error('❌ Load products failed:', error);
    showError('Failed to load products: ' + error.message);
    
    // Show mock products as last resort
    displayProducts(MOCK_PRODUCTS);
    
  } finally {
    hideLoading();
  }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayProducts(products) {
  const grid = document.getElementById("products-grid");
  if (!grid) {
    console.error("❌ products-grid element not found");
    return;
  }
  
  console.log("🎨 Displaying", products.length, "products");
  
  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fa-solid fa-box-open" style="font-size: 60px; color: var(--text-muted); opacity: 0.5;"></i>
        <p style="color: var(--text-muted); margin-top: 15px; font-size: 16px;">No products found</p>
        <button class="main-btn" onclick="loadProducts(1)" style="margin-top: 20px;">
          Reload Products
        </button>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => {
    const id = product.id;
    const name = product.name || product.title || 'Untitled Product';
    const price = product.price || product.price_pi || 0;
    const image = product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/400';
    const condition = product.condition || '';
    
    return `
      <div class="product-card glass-panel" onclick="openProductDetail(${id})">
        <div class="p-img-box">
          <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/400'">
          <div class="ai-tag">
            <i class="fa-solid fa-microchip"></i>
            <span>AI Verified</span>
          </div>
          ${condition ? `<div class="condition-badge">${condition}</div>` : ''}
        </div>
        <div class="p-details">
          <div class="p-name">${name}</div>
          <div class="p-price">${price} Pi</div>
        </div>
        <button class="quick-add-btn" onclick="event.stopPropagation(); quickAddToCart(${id})">
          <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    `;
  }).join('');
  
  console.log("✅ Products displayed");
}

function displayPagination(pagination) {
  const container = document.getElementById('pagination-container');
  if (!container || !pagination) return;
  
  const { page, pages, total } = pagination;
  
  if (pages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = `
    <button class="pagination-btn" onclick="loadProducts(${page - 1})" ${page === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;
  
  for (let i = 1; i <= Math.min(pages, 5); i++) {
    html += `
      <button class="pagination-btn ${i === page ? 'active' : ''}" onclick="loadProducts(${i})">
        ${i}
      </button>
    `;
  }
  
  html += `
    <button class="pagination-btn" onclick="loadProducts(${page + 1})" ${page === pages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
  
  container.innerHTML = html;
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
  console.error("❌", message);
  alert('❌ ' + message);
}

function showSuccess(message) {
  console.log("✅", message);
  alert('✅ ' + message);
}

// ============================================
// PRODUCT DETAIL
// ============================================

function openProductDetail(id) {
  console.log("📄 Opening product:", id);
  const product = findProductById(id);
  
  if (!product) {
    showError("Product not found");
    return;
  }
  
  selectedProduct = product;
  
  document.getElementById("detail-title").innerText = product.name || product.title;
  document.getElementById("detail-price").innerText = (product.price || product.price_pi) + " Pi";
  document.getElementById("detail-img").src = product.image || product.images?.[0] || 'https://via.placeholder.com/400';
  document.getElementById("detail-desc").innerText = product.description || 'No description available';
  
  document.getElementById("product-detail-modal").style.display = "block";
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").style.display = "none";
  selectedProduct = null;
}

function findProductById(id) {
  // Try to find in current displayed products first
  return MOCK_PRODUCTS.find(p => p.id === id);
}

// ============================================
// CART FUNCTIONS
// ============================================

function quickAddToCart(productId) {
  const product = findProductById(productId);
  if (!product) return;
  
  if (typeof cart !== 'undefined') {
    cart.addItem(product, 1);
  } else {
    showSuccess('Added to cart!');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
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
// LANGUAGE FUNCTIONS
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
// MOCK DATA
// ============================================

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    title: "iPhone 15 Pro Max",
    price: 0.05,
    price_pi: 0.05,
    description: "Brand new iPhone 15 Pro Max with all accessories",
    image: "https://images.unsplash.com/photo-1592286927505-b86dc33748b5?w=400",
    category: "electronics",
    condition: "New"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    title: "MacBook Pro M3",
    price: 0.1,
    price_pi: 0.1,
    description: "Latest MacBook Pro with M3 chip",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "electronics",
    condition: "New"
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    title: "AirPods Pro 2",
    price: 0.02,
    price_pi: 0.02,
    description: "AirPods Pro Gen 2 with Active Noise Cancellation",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
    category: "electronics",
    condition: "New"
  },
  {
    id: 4,
    name: "Nike Air Max 2024",
    title: "Nike Air Max 2024",
    price: 0.015,
    price_pi: 0.015,
    description: "Latest Nike Air Max sneakers",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "fashion",
    condition: "New"
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    title: "Sony WH-1000XM5",
    price: 0.025,
    price_pi: 0.025,
    description: "Premium noise-cancelling headphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
    category: "electronics",
    condition: "Like New"
  },
  {
    id: 6,
    name: "Gaming Chair RGB",
    title: "Gaming Chair RGB",
    price: 0.03,
    price_pi: 0.03,
    description: "Ergonomic gaming chair with RGB lighting",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400",
    category: "home",
    condition: "New"
  }
];

console.log("✅ Script loaded with", MOCK_PRODUCTS.length, "mock products");
