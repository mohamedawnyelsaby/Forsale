export type PiNetworkMode = 'testnet' | 'mainnet';

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiPaymentDTO {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

export interface PiTransaction {
  txid: string;
  amount: number;
  verified: boolean;
  timestamp: string;
  from_address: string;
  to_address: string;
  _link: string;
}

export interface PiPaymentStatus {
  developer_approved: boolean;
  transaction_verified: boolean;
  developer_completed: boolean;
  cancelled: boolean;
  user_cancelled: boolean;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: string;
  status: PiPaymentStatus;
  transaction: PiTransaction | null;
}

export interface PiNetworkConfig {
  mode: PiNetworkMode;
  apiUrl: string;
  apiKey: string;
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  HOME_GARDEN = 'HOME_GARDEN',
  BOOKS_MEDIA = 'BOOKS_MEDIA',
  SPORTS_OUTDOORS = 'SPORTS_OUTDOORS',
  TOYS_GAMES = 'TOYS_GAMES',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  AUTOMOTIVE = 'AUTOMOTIVE',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  SERVICES = 'SERVICES',
  OTHER = 'OTHER',
}

export interface CommissionTier {
  minAmount: number;
  maxAmount: number;
  rate: number;
}

export interface CommissionResult {
  grossPrice: number;
  commission: number;
  netToSeller: number;
  effectiveRate: number;
  breakdown: {
    baseRate: number;
    volumeDiscount: number;
    categoryMultiplier: number;
  };
}
