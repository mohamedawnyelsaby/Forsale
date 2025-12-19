// ============================================
// 📄 FILENAME: search.js (Advanced Search & Filtering)
// 📍 PATH: frontend/js/search.js
// ============================================

class SearchEngine {
  constructor() {
    this.filters = {
      query: '',
      category: 'all',
      minPrice: null,
      maxPrice: null,
      condition: 'all',
      location: 'all',
      brand: 'all',
      sortBy: 'relevance', // relevance, price_low, price_high, newest, popular
      page: 1,
      limit: 20
    };
    
    this.categories = [
      { id: 'all', name: 'All Products', icon: 'fa-grid' },
      { id: 'electronics', name: 'Electronics', icon: 'fa-mobile-screen' },
      { id: 'fashion', name: 'Fashion', icon: 'fa-shirt' },
      { id: 'home', name: 'Home & Garden', icon: 'fa-house' },
      { id: 'sports', name: 'Sports & Outdoors', icon: 'fa-dumbbell' },
      { id: 'books', name: 'Books & Media', icon: 'fa-book' },
      { id: 'toys', name: 'Toys & Games', icon: 'fa-gamepad' },
      { id: 'automotive', name: 'Automotive', icon: 'fa-car' },
      { id: 'beauty', name: 'Beauty & Health', icon: 'fa-spa' },
      { id: 'pets', name: 'Pet Supplies', icon: 'fa-paw' },
      { id: 'jewelry', name: 'Jewelry', icon: 'fa-gem' },
      { id: 'music', name: 'Musical Instruments', icon: 'fa-music' },
    ];
    
    this.searchHistory = this.loadSearchHistory();
  }
  
  // ============================================
  // Search & Filter Methods
  // ============================================
  
  async search() {
    try {
      const params = new URLSearchParams();
      
      if (this.filters.query) params.append('q', this.filters.query);
      if (this.filters.category !== 'all') params.append('category', this.filters.category);
      if (this.filters.minPrice) params.append('minPrice', this.filters.minPrice);
      if (this.filters.maxPrice) params.append('maxPrice', this.filters.maxPrice);
      if (this.filters.condition !== 'all') params.append('condition', this.filters.condition);
      if (this.filters.location !== 'all') params.append('location', this.filters.location);
      if (this.filters.brand !== 'all') params.append('brand', this.filters.brand);
      params.append('sortBy', this.filters.sortBy);
      params.append('page', this.filters.page);
      params.append('limit', this.filters.limit);
      
      const response = await fetch(`${API_BASE}/api/products/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        // Save to search history
        if (this.filters.query) {
          this.addToSearchHistory(this.filters.query);
        }
        
        return data.data;
      }
      
      throw new Error(data.message || 'Search failed');
      
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
  
  setFilter(key, value) {
    this.filters[key] = value;
    if (key !== 'page') {
      this.filters.page = 1; // Reset page on filter change
    }
  }
  
  clearFilters() {
    this.filters = {
      query: '',
      category: 'all',
      minPrice: null,
      maxPrice: null,
      condition: 'all',
      location: 'all',
      brand: 'all',
      sortBy: 'relevance',
      page: 1,
      limit: 20
    };
  }
  
  getActiveFiltersCount() {
    let count = 0;
    if (this.filters.category !== 'all') count++;
    if (this.filters.minPrice) count++;
    if (this.filters.maxPrice) count++;
    if (this.filters.condition !== 'all') count++;
    if (this.filters.location !== 'all') count++;
    if (this.filters.brand !== 'all') count++;
    return count;
  }
  
  // ============================================
  // Search History
  // ============================================
  
  loadSearchHistory() {
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  }
  
  saveSearchHistory() {
    localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
  }
  
  addToSearchHistory(query) {
    if (!query.trim()) return;
    
    // Remove if exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 20
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(0, 20);
    }
    
    this.saveSearchHistory();
  }
  
  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('search_history');
  }
  
  // ============================================
  // AI-Powered Search Suggestions
  // ============================================
  
  async getAISuggestions(query) {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(`${API_BASE}/api/search/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      return data.success ? data.data : [];
      
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }
  
  // ============================================
  // Visual Search (Image-based)
  // ============================================
  
  async visualSearch(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${API_BASE}/api/search/visual`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.success ? data.data : [];
      
    } catch (error) {
      console.error('Visual search error:', error);
      throw error;
    }
  }
}

// ============================================
// Search UI Component
// ============================================

class SearchUI {
  constructor(searchEngine) {
    this.engine = searchEngine;
    this.init();
  }
  
  init() {
    this.renderCategories();
    this.renderFilterPanel();
    this.attachEventListeners();
  }
  
  renderCategories() {
    const container = document.getElementById('level1-scroll');
    if (!container) return;
    
    container.innerHTML = this.engine.categories.map(cat => `
      <div class="cat-item ${this.engine.filters.category === cat.id ? 'active' : ''}" 
           data-category="${cat.id}"
           onclick="searchUI.selectCategory('${cat.id}')">
        <i class="fa-solid ${cat.icon}"></i>
        <span data-i18n="cat_${cat.id}">${cat.name}</span>
      </div>
    `).join('');
  }
  
  renderFilterPanel() {
    const panel = document.getElementById('filter-panel');
    if (!panel) return;
    
    const activeCount = this.engine.getActiveFiltersCount();
    
    panel.innerHTML = `
      <div class="filter-header">
        <div class="filter-title">
          <i class="fa-solid fa-filter"></i>
          <span data-i18n="filter_apply">Filters</span>
          ${activeCount > 0 ? `<span class="filter-badge">${activeCount}</span>` : ''}
        </div>
        ${activeCount > 0 ? `
          <button class="filter-clear-btn" onclick="searchUI.clearFilters()">
            <span data-i18n="filter_clear">Clear All</span>
          </button>
        ` : ''}
      </div>
      
      <div class="filter-groups">
        <!-- Price Range -->
        <div class="filter-group">
          <label data-i18n="filter_price">Price Range (Pi)</label>
          <div class="price-inputs">
            <input type="number" 
                   placeholder="Min" 
                   value="${this.engine.filters.minPrice || ''}"
                   onchange="searchUI.setPriceRange('min', this.value)">
            <span>-</span>
            <input type="number" 
                   placeholder="Max" 
                   value="${this.engine.filters.maxPrice || ''}"
                   onchange="searchUI.setPriceRange('max', this.value)">
          </div>
        </div>
        
        <!-- Condition -->
        <div class="filter-group">
          <label data-i18n="filter_condition">Condition</label>
          <select onchange="searchUI.setCondition(this.value)" value="${this.engine.filters.condition}">
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="used_like_new">Used - Like New</option>
            <option value="used_good">Used - Good</option>
            <option value="used_fair">Used - Fair</option>
          </select>
        </div>
        
        <!-- Sort By -->
        <div class="filter-group">
          <label>Sort By</label>
          <select onchange="searchUI.setSortBy(this.value)" value="${this.engine.filters.sortBy}">
            <option value="relevance">Most Relevant</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
      
      <button class="apply-filters-btn" onclick="searchUI.applyFilters()">
        <i class="fa-solid fa-check"></i>
        <span data-i18n="filter_apply">Apply Filters</span>
      </button>
    `;
  }
  
  selectCategory(categoryId) {
    this.engine.setFilter('category', categoryId);
    this.renderCategories();
    this.performSearch();
  }
  
  setPriceRange(type, value) {
    if (type === 'min') {
      this.engine.setFilter('minPrice', value ? parseFloat(value) : null);
    } else {
      this.engine.setFilter('maxPrice', value ? parseFloat(value) : null);
    }
  }
  
  setCondition(value) {
    this.engine.setFilter('condition', value);
  }
  
  setSortBy(value) {
    this.engine.setFilter('sortBy', value);
    this.performSearch();
  }
  
  clearFilters() {
    this.engine.clearFilters();
    this.renderCategories();
    this.renderFilterPanel();
    this.performSearch();
  }
  
  applyFilters() {
    this.performSearch();
  }
  
  async performSearch() {
    try {
      showLoading();
      const results = await this.engine.search();
      displayProducts(results.products);
      displayPagination(results.pagination);
    } catch (error) {
      showError('Search failed: ' + error.message);
    } finally {
      hideLoading();
    }
  }
  
  attachEventListeners() {
    // Search input with debounce
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.engine.setFilter('query', e.target.value);
          this.performSearch();
        }, 500);
      });
    }
    
    // Toggle filter panel
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
      filterToggle.addEventListener('click', () => {
        const panel = document.getElementById('filter-panel');
        panel.classList.toggle('open');
      });
    }
  }
}

// Initialize
const searchEngine = new SearchEngine();
const searchUI = new SearchUI(searchEngine);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchEngine, SearchUI };
}
