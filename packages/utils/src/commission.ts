import { ProductCategory, CommissionResult, CommissionTier } from '@forsale/types';

const COMMISSION_TIERS: CommissionTier[] = [
  { minAmount: 0, maxAmount: 10, rate: 0.15 },
  { minAmount: 10, maxAmount: 50, rate: 0.12 },
  { minAmount: 50, maxAmount: 200, rate: 0.10 },
  { minAmount: 200, maxAmount: 1000, rate: 0.08 },
  { minAmount: 1000, maxAmount: Infinity, rate: 0.05 },
];

const CATEGORY_MULTIPLIERS: Record<ProductCategory, number> = {
  [ProductCategory.ELECTRONICS]: 1.0,
  [ProductCategory.FASHION]: 0.9,
  [ProductCategory.HOME_GARDEN]: 0.95,
  [ProductCategory.BOOKS_MEDIA]: 0.85,
  [ProductCategory.SPORTS_OUTDOORS]: 0.95,
  [ProductCategory.TOYS_GAMES]: 0.9,
  [ProductCategory.HEALTH_BEAUTY]: 1.0,
  [ProductCategory.AUTOMOTIVE]: 1.05,
  [ProductCategory.FOOD_BEVERAGES]: 0.8,
  [ProductCategory.SERVICES]: 1.1,
  [ProductCategory.OTHER]: 1.0,
};

export class CommissionCalculator {
  static calculate(
    category: ProductCategory,
    grossAmount: number,
    sellerVolume: number = 0
  ): CommissionResult {
    if (grossAmount <= 0) throw new Error('Amount must be > 0');
    
    const tier = COMMISSION_TIERS.find(
      t => grossAmount >= t.minAmount && grossAmount < t.maxAmount
    ) || COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
    
    const baseRate = tier.rate;
    const categoryMultiplier = CATEGORY_MULTIPLIERS[category] || 1.0;
    const effectiveRate = baseRate * categoryMultiplier;
    
    const commission = Number((grossAmount * effectiveRate).toFixed(4));
    const netToSeller = Number((grossAmount - commission).toFixed(4));
    
    return {
      grossPrice: grossAmount,
      commission,
      netToSeller,
      effectiveRate: Number((effectiveRate * 100).toFixed(2)),
      breakdown: {
        baseRate: Number((baseRate * 100).toFixed(2)),
        volumeDiscount: 0,
        categoryMultiplier,
      },
    };
  }
}

export default CommissionCalculator;
