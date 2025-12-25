// FORSALE SHARED TYPES - ENHANCED & PRODUCTION READY
// packages/types/src/index.ts

// ============================================
// BASE TYPES
// ============================================

export type UUID = string;
export type ISODateString = string;
export type PiAmount = number;

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'BUYER' | 'SELLER' | 'BOTH' | 'ADMIN';

export type VerificationLevel =
  | 'UNVERIFIED'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'PI_KYC_VERIFIED'
  | 'FORSALE_VERIFIED'
  | 'PREMIUM_SELLER'
  | 'ENTERPRISE';

export interface User {
  id: UUID;
  email: string;
  emailVerified: ISODateString | null;
  phone: string | null;
  phoneVerified: ISODateString | null;
  piUserId: string | null;
  piUsername: string | null;
  role: UserRole;
  verificationLevel: VerificationLevel;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  language: string;
  country: string | null;
  city: string | null;
  trustScore: number;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  totalOrders: number;
  totalSales: number;
  totalSpent: PiAmount;
  totalEarned: PiAmount;
  averageRating: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface UserPublicProfile {
  id: UUID;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  averageRating: number;
  totalSales: number;
  verificationLevel: VerificationLevel;
  createdAt: ISODateString;
}

// ============================================
// PRODUCT TYPES
// ============================================

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'ARCHIVED';

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

export interface Product {
  id: UUID;
  sellerId: UUID;
  title: string;
  description: string;
  category: ProductCategory;
  price: PiAmount;
  quantity: number;
  status: ProductStatus;
  images: string[];
  slug: string;
  views: number;
  saves: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  seller?: UserPublicProfile;
  reviews?: Review[];
}

export interface ProductCreateInput {
  title: string;
  description: string;
  category: ProductCategory;
  price: PiAmount;
  quantity: number;
  images: string[];
  sellerId: UUID;
}

export interface ProductUpdateInput {
  title?: string;
  description?: string;
  price?: PiAmount;
  quantity?: number;
  status?: ProductStatus;
  images?: string[];
}

export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  minPrice?: PiAmount;
  maxPrice?: PiAmount;
  sellerId?: UUID;
  status?: ProductStatus;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: UUID;
  orderNumber: string;
  buyerId: UUID;
  sellerId: UUID;
  status: OrderStatus;
  subtotal: PiAmount;
  shippingCost: PiAmount;
  commission: PiAmount;
  total: PiAmount;
  piTransactionId: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  buyer?: UserPublicProfile;
  seller?: UserPublicProfile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  title: string;
  price: PiAmount;
  quantity: number;
  commission: PiAmount;
  createdAt: ISODateString;
  product?: Product;
}

export interface OrderCreateInput {
  buyerId: UUID;
  sellerId: UUID;
  items: Array<{
    productId: UUID;
    quantity: number;
    price: PiAmount;
  }>;
  shippingCost: PiAmount;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: UUID;
  productId: UUID;
  userId: UUID;
  rating: number;
  comment: string | null;
  createdAt: ISODateString;
  user?: UserPublicProfile;
  product?: Product;
}

export interface ReviewCreateInput {
  productId: UUID;
  userId: UUID;
  rating: number;
  comment?: string;
}

// ============================================
// PI NETWORK TYPES
// ============================================

export type PiNetworkMode = 'testnet' | 'mainnet';

export interface PiNetworkConfig {
  mode: PiNetworkMode;
  apiUrl: string;
  apiKey: string;
}

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: PiAmount;
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

export interface PiPaymentCreateParams {
  amount: PiAmount;
  memo: string;
  metadata: Record<string, any>;
  uid: string;
}

// ============================================
// COMMISSION TYPES
// ============================================

export interface CommissionRule {
  category: ProductCategory;
  sellerCommission: number;
  buyerFee: number;
  minCommission: PiAmount;
  maxCommission: PiAmount;
  volumeDiscounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  minMonthlyVolume: PiAmount;
  discountPercentage: number;
}

export interface CommissionCalculation {
  grossPrice: PiAmount;
  commission: PiAmount;
  netToSeller: PiAmount;
  effectiveRate: number;
  volumeDiscount: number;
}

// ============================================
// LOGY AI TYPES
// ============================================

export interface LogyAIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LogyAIContext {
  userId: UUID;
  sessionId: string;
  language: string;
  currentPage?: string;
  recentProducts?: string[];
  orderHistory?: Order[];
}

export interface LogyRecommendation {
  recommendations: string[];
  reasoning: string;
}

export interface LogySearchAnalysis {
  searchQuery: string;
  filters: Record<string, any>;
  explanation: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchFilters {
  query?: string;
  category?: ProductCategory;
  minPrice?: PiAmount;
  maxPrice?: PiAmount;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// WALLET TYPES
// ============================================

export interface Wallet {
  id: UUID;
  userId: UUID;
  piAddress: string;
  piBalance: PiAmount;
  availableBalance: PiAmount;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ============================================
// ADDRESS TYPES
// ============================================

export interface Address {
  id: UUID;
  userId: UUID;
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: ISODateString;
}

export interface AddressCreateInput {
  userId: UUID;
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

export const APP_CONFIG = {
  APP_NAME: 'Forsale',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'PI',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ITEMS_PER_PAGE: 20,
  MIN_PRODUCT_PRICE: 0.01,
  MAX_PRODUCT_PRICE: 1000000,
} as const;

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  REAL_ESTATE: 'Real Estate',
  VEHICLES: 'Vehicles',
  LUXURY_GOODS: 'Luxury Goods',
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME_GARDEN: 'Home & Garden',
  BOOKS_MEDIA: 'Books & Media',
  FOOD_GROCERY: 'Food & Grocery',
  TOYS_HOBBIES: 'Toys & Hobbies',
  FREELANCE_SERVICES: 'Freelance Services',
  DIGITAL_PRODUCTS: 'Digital Products',
  DEFAULT: 'Other',
} as const;

// ============================================
// TYPE GUARDS
// ============================================

export function isProductCategory(value: string): value is ProductCategory {
  return Object.keys(PRODUCT_CATEGORIES).includes(value);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(value);
}

export function isProductStatus(value: string): value is ProductStatus {
  return ['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED'].includes(value);
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
