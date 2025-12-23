// FORSALE SHARED TYPES - COMPLETE
// Copy to: packages/types/src/index.ts

// ============================================
// PI NETWORK TYPES
// ============================================

export type PiNetworkMode = 'testnet' | 'mainnet';

export interface PiNetworkConfig {
  mode: PiNetworkMode;
  apiUrl: string;
  apiKey: string;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  network: PiNetworkMode;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
  };
}

export interface PiUser {
  uid: string;
  username: string;
}

// ============================================
// COMMISSION TYPES
// ============================================

export type ProductCategory = 
  | 'REAL_ESTATE'
  | 'VEHICLES'
  | 'LUXURY_GOODS'
  | 'ELECTRONICS'
  | 'FASHION'
  | 'HOME_GARDEN'
  | 'BOOKS_MEDIA'
  | 'FOOD_GROCERY'
  | 'TOYS_HOBBIES'
  | 'FREELANCE_SERVICES'
  | 'DIGITAL_PRODUCTS'
  | 'DEFAULT';

export interface CommissionRule {
  category: ProductCategory;
  sellerCommission: number;
  buyerFee: number;
  minCommission: number;
  maxCommission: number;
  volumeDiscounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  minMonthlyVolume: number;
  discountPercentage: number;
}

export interface CommissionCalculation {
  grossPrice: number;
  commission: number;
  netToSeller: number;
  effectiveRate: number;
  volumeDiscount: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchFilters {
  query?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// CONSTANTS
// ============================================

export const APP_CONFIG = {
  APP_NAME: 'Forsale',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'PI',
} as const;
