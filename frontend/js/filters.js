// ============================================
// 📄 FILENAME: filters.js (Enhanced Filter System)
// 📍 PATH: frontend/js/filters.js
// ============================================

class ProductFilters {
  constructor() {
    this.filters = {
      query: '',
      category: 'all',
      minPrice: null,
      maxPrice: null,
      condition: [],
      location: 'all',
      brands: [],
      rating: null,
      shippingType: [],
      sortBy: 'relevance',
      inStock: false,
      page: 1,
      limit: 20
    };
    
    this.priceRanges = [
      { label: 'Under 0.01 Pi', min: 0, max: 0.01 },
      { label: '0.01 - 0.05 Pi', min: 0.01, max: 0.05 },
      { label: '0.05 - 0.1 Pi', min: 0.05, max: 0.1 },
      { label: '0.1 - 0.5 Pi', min: 0.1, max: 0.5 },
      { label: 'Over 0.5 Pi', min: 0.5, max: null }
    ];
    
    this.conditions = [
      { id: 'new', label: 'New' },
      { id: 'like_new', label: 'Like New' },
      { id: 'excellent', label: 'Excellent' },
      { id: 'good', label: 'Good' },
      { id: 'fair', label: 'Fair' }
    ];
    
    this.shippingTypes = [
      { id: 'free', label: 'Free Shipping' },
      { id: 'fast', label: 'Fast Delivery (1-2 days)' },
      { id: 'standard', label: 'Standard (3-7 days)' },
      { id: 'international', label: 'International' }
    ];
    
    this.sortOptions = [
      { id: 'relevance', label: 'Most Relevant' },
      { id: 'newest', label: 'Newest First' },
      { id: 'price_low', label: 'Price: Low to High' },
      { id: 'price_high', label: 'Price: High to Low' },
      { id: 'popular', label: 'Most Popular' },
      { id: 'rating', label: 'Highest Rated' },
      { id: 'distance', label: 'Nearest First' }
    ];
  }
  
  // ============================================
  // Set Filters
  // ============================================
  
  setQuery(query) {
    this.filters.query = query;
    this.filters.page = 1;
  }
  
  setCategory(category) {
    this.filters.category = category;
    this.filters.page = 1;
  }
  
  setPriceRange(min, max) {
    this.filters.minPrice = min;
    this.filters.maxPrice = max;
    this.filters.page = 1;
  }
  
  toggleCondition(condition) {
    const index = this.filters.condition.indexOf(condition);
    if (index > -1) {
      this.filters.condition.splice(index, 1);
    } else {
      this.filters.condition.push(condition);
    }
    this.filters.page = 1;
  }
  
  toggleBrand(brand) {
    const index = this.filters.brands.indexOf(brand);
    if (index > -1) {
      this.filters.brands.splice(index, 1);
    } else {
      this.filters.brands.push(brand);
    }
    this.filters.page = 1;
  }
  
  setRating(rating) {
    this.filters.rating = rating;
    this.filters.page = 1;
  }
  
  toggleShipping(type) {
    const index = this.filters.shippingType.indexOf(type);
    if (index > -1) {
      this.filters.shippingType.splice(index, 1);
    } else {
      this.filters.shippingType.push(type);
    }
    this.filters.page = 1;
  }
  
  setSortBy(sortBy) {
    this.filters.sortBy = sortBy;
    this.filters.page = 1;
  }
  
  setInStockOnly(value) {
    this.filters.inStock = value;
    this.filters.page = 1;
  }
  
  setPage(page) {
    this.filters.page = page;
  }
  
  // ============================================
  // Get & Clear
  // ============================================
  
  getFilters() {
    return { ...this.filters };
  }
  
  getActiveFiltersCount() {
    let count = 0;
    if (this.filters.category !== 'all') count++;
    if (this.filters.minPrice || this.filters.maxPrice) count++;
    if (this.filters.condition.length > 0) count++;
    if (this.filters.brands.length > 0) count++;
    if (this.filters.rating) count++;
    if (this.filters.shippingType.length > 0) count++;
    if (this.filters.inStock) count++;
    return count;
  }
  
  clearAll() {
    this.filters = {
      query: this.filters.query, // Keep search query
      category: 'all',
      minPrice: null,
      maxPrice: null,
      condition: [],
      location: 'all',
      brands: [],
      rating: null,
      shippingType: [],
      sortBy: 'relevance',
      inStock: false,
      page: 1,
      limit: 20
    };
  }
  
  // ============================================
  // Build Query String
  // ============================================
  
  toQueryString() {
    const params = new URLSearchParams();
    
    if (this.filters.query) params.append('q', this.filters.query);
    if (this.filters.category !== 'all') params.append('category', this.filters.category);
    if (this.filters.minPrice) params.append('minPrice', this.filters.minPrice);
    if (this.filters.maxPrice) params.append('maxPrice', this.filters.maxPrice);
    if (this.filters.condition.length > 0) params.append('condition', this.filters.condition.join(','));
    if (this.filters.location !== 'all') params.append('location', this.filters.location);
    if (this.filters.brands.length > 0) params.append('brand', this.filters.brands.join(','));
    if (this.filters.rating) params.append('minRating', this.filters.rating);
    if (this.filters.shippingType.length > 0) params.append('shipping', this.filters.shippingType.join(','));
    if (this.filters.inStock) params.append('inStock', 'true');
    params.append('sortBy', this.filters.sortBy);
    params.append('page', this.filters.page);
    params.append('limit', this.filters.limit);
    
    return params.toString();
  }
  
  // ============================================
  // Save/Load from URL
  // ============================================
  
  saveToURL() {
    const url = new URL(window.location);
    url.search = this.toQueryString();
    window.history.pushState({}, '', url);
  }
  
  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    this.filters.query = params.get('q') || '';
    this.filters.category = params.get('category') || 'all';
    this.filters.minPrice = params.get('minPrice') ? parseFloat(params.get('minPrice')) : null;
    this.filters.maxPrice = params.get('maxPrice') ? parseFloat(params.get('maxPrice')) : null;
    this.filters.condition = params.get('condition') ? params.get('condition').split(',') : [];
    this.filters.location = params.get('location') || 'all';
    this.filters.brands = params.get('brand') ? params.get('brand').split(',') : [];
    this.filters.rating = params.get('minRating') ? parseFloat(params.get('minRating')) : null;
    this.filters.shippingType = params.get('shipping') ? params.get('shipping').split(',') : [];
    this.filters.inStock = params.get('inStock') === 'true';
    this.filters.sortBy = params.get('sortBy') || 'relevance';
    this.filters.page = params.get('page') ? parseInt(params.get('page')) : 1;
  }
}

// ============================================
// Filter UI Component
// ============================================

class FilterUI {
  constructor(filterSystem) {
    this.filters = filterSystem;
    this.isOpen = false;
  }
  
  render() {
    const container = document.getElementById('filter-panel');
    if (!container) return;
    
    const activeCount = this.filters.getActiveFiltersCount();
    
    container.innerHTML = `
      <div class="filter-header">
        <div class="filter-title">
          <i class="fa-solid fa-filter"></i>
          <span data-i18n="filter_show">Filters</span>
          ${activeCount > 0 ? `<span class="filter-badge">${activeCount}</span>` : ''}
        </div>
        ${activeCount > 0 ? `
          <button class="filter-clear-btn" onclick="filterUI.clearAll()">
            <i class="fa-solid fa-xmark"></i>
            <span data-i18n="filter_clear">Clear All</span>
          </button>
        ` : ''}
      </div>
      
      <div class="filter-body ${this.isOpen ? 'open' : ''}">
        ${this.renderPriceFilter()}
        ${this.renderConditionFilter()}
        ${this.renderRatingFilter()}
        ${this.renderShippingFilter()}
        ${this.renderStockFilter()}
      </div>
      
      <button class="apply-filters-btn" onclick="filterUI.apply()">
        <i class="fa-solid fa-check"></i>
        <span data-i18n="filter_apply">Apply Filters</span>
      </button>
    `;
  }
  
  renderPriceFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">
          <i class="fa-solid fa-coins"></i>
          <span data-i18n="filter_price">Price Range</span>
        </label>
        <div class="price-range-options">
          ${this.filters.priceRanges.map(range => `
            <label class="filter-option">
              <input type="radio" 
                     name="price-range" 
                     ${this.filters.filters.minPrice === range.min && this.filters.filters.maxPrice === range.max ? 'checked' : ''}
                     onchange="filterUI.setPriceRange(${range.min}, ${range.max})">
              <span>${range.label}</span>
            </label>
          `).join('')}
        </div>
        <div class="custom-price">
          <label>Custom Range:</label>
          <div class="price-inputs">
            <input type="number" 
                   placeholder="Min" 
                   value="${this.filters.filters.minPrice || ''}"
                   onchange="filterUI.setCustomPrice('min', this.value)">
            <span>-</span>
            <input type="number" 
                   placeholder="Max" 
                   value="${this.filters.filters.maxPrice || ''}"
                   onchange="filterUI.setCustomPrice('max', this.value)">
          </div>
        </div>
      </div>
    `;
  }
  
  renderConditionFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">
          <i class="fa-solid fa-star"></i>
          <span data-i18n="filter_condition">Condition</span>
        </label>
        <div class="checkbox-options">
          ${this.filters.conditions.map(cond => `
            <label class="filter-option">
              <input type="checkbox" 
                     ${this.filters.filters.condition.includes(cond.id) ? 'checked' : ''}
                     onchange="filterUI.toggleCondition('${cond.id}')">
              <span>${cond.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderRatingFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">
          <i class="fa-solid fa-star"></i>
          <span data-i18n="filter_rating">Minimum Rating</span>
        </label>
        <div class="rating-options">
          ${[5, 4, 3, 2, 1].map(rating => `
            <label class="filter-option">
              <input type="radio" 
                     name="rating" 
                     ${this.filters.filters.rating === rating ? 'checked' : ''}
                     onchange="filterUI.setRating(${rating})">
              <span>
                ${Array(rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                ${Array(5 - rating).fill('<i class="fa-regular fa-star"></i>').join('')}
                & Up
              </span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderShippingFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">
          <i class="fa-solid fa-truck-fast"></i>
          <span data-i18n="filter_shipping">Shipping Options</span>
        </label>
        <div class="checkbox-options">
          ${this.filters.shippingTypes.map(type => `
            <label class="filter-option">
              <input type="checkbox" 
                     ${this.filters.filters.shippingType.includes(type.id) ? 'checked' : ''}
                     onchange="filterUI.toggleShipping('${type.id}')">
              <span>${type.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderStockFilter() {
    return `
      <div class="filter-group">
        <label class="filter-option">
          <input type="checkbox" 
                 ${this.filters.filters.inStock ? 'checked' : ''}
                 onchange="filterUI.toggleInStock(this.checked)">
          <span data-i18n="product_in_stock">In Stock Only</span>
        </label>
      </div>
    `;
  }
  
  // ============================================
  // Event Handlers
  // ============================================
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.render();
  }
  
  setPriceRange(min, max) {
    this.filters.setPriceRange(min, max);
  }
  
  setCustomPrice(type, value) {
    if (type === 'min') {
      this.filters.setPriceRange(value ? parseFloat(value) : null, this.filters.filters.maxPrice);
    } else {
      this.filters.setPriceRange(this.filters.filters.minPrice, value ? parseFloat(value) : null);
    }
  }
  
  toggleCondition(condition) {
    this.filters.toggleCondition(condition);
    this.render();
  }
  
  setRating(rating) {
    this.filters.setRating(rating);
  }
  
  toggleShipping(type) {
    this.filters.toggleShipping(type);
    this.render();
  }
  
  toggleInStock(value) {
    this.filters.setInStockOnly(value);
  }
  
  clearAll() {
    this.filters.clearAll();
    this.render();
    this.apply();
  }
  
  apply() {
    this.filters.saveToURL();
    if (typeof loadProducts === 'function') {
      loadProducts();
    }
  }
}

// Initialize
const productFilters = new ProductFilters();
const filterUI = new FilterUI(productFilters);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductFilters, FilterUI };
}
