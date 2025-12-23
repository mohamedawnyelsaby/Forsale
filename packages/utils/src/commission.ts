// FORSALE COMMISSION CALCULATOR - COMPLETE
// Copy to: packages/utils/src/commission.ts

import type {
  ProductCategory,
  CommissionRule,
  CommissionCalculation,
} from '@forsale/types';

// ============================================
// COMMISSION RATES
// ============================================

export const COMMISSION_RATES: Record<ProductCategory, CommissionRule> = {
  REAL_ESTATE: {
    category: 'REAL_ESTATE',
    sellerCommission: 0.5,
    buyerFee: 0,
    minCommission: 100,
    maxCommission: 50000,
    volumeDiscounts: [
      { minMonthlyVolume: 100000, discountPercentage: 20 },
      { minMonthlyVolume: 500000, discountPercentage: 40 },
    ],
  },
  VEHICLES: {
    category: 'VEHICLES',
    sellerCommission: 0.8,
    buyerFee: 0,
    minCommission: 50,
    maxCommission: 5000,
    volumeDiscounts: [
      { minMonthlyVolume: 50000, discountPercentage: 25 },
    ],
  },
  ELECTRONICS: {
    category: 'ELECTRONICS',
    sellerCommission: 3,
    buyerFee: 0,
    minCommission: 5,
    maxCommission: 500,
    volumeDiscounts: [
      { minMonthlyVolume: 5000, discountPercentage: 15 },
    ],
  },
  FASHION: {
    category: 'FASHION',
    sellerCommission: 4,
    buyerFee: 0,
    minCommission: 2,
    maxCommission: 200,
    volumeDiscounts: [
      { minMonthlyVolume: 3000, discountPercentage: 15 },
    ],
  },
  LUXURY_GOODS: {
    category: 'LUXURY_GOODS',
    sellerCommission: 2.5,
    buyerFee: 0,
    minCommission: 20,
    maxCommission: 3000,
    volumeDiscounts: [],
  },
  HOME_GARDEN: {
    category: 'HOME_GARDEN',
    sellerCommission: 3.5,
    buyerFee: 0,
    minCommission: 3,
    maxCommission: 300,
    volumeDiscounts: [],
  },
  BOOKS_MEDIA: {
    category: 'BOOKS_MEDIA',
    sellerCommission: 5,
    buyerFee: 0,
    minCommission: 0.5,
    maxCommission: 50,
    volumeDiscounts: [],
  },
  FOOD_GROCERY: {
    category: 'FOOD_GROCERY',
    sellerCommission: 2,
    buyerFee: 0,
    minCommission: 1,
    maxCommission: 100,
    volumeDiscounts: [],
  },
  TOYS_HOBBIES: {
    category: 'TOYS_HOBBIES',
    sellerCommission: 4.5,
    buyerFee: 0,
    minCommission: 2,
    maxCommission: 150,
    volumeDiscounts: [],
  },
  FREELANCE_SERVICES: {
    category: 'FREELANCE_SERVICES',
    sellerCommission: 5,
    buyerFee: 0,
    minCommission: 1,
    maxCommission: 500,
    volumeDiscounts: [],
  },
  DIGITAL_PRODUCTS: {
    category: 'DIGITAL_PRODUCTS',
    sellerCommission: 3,
    buyerFee: 0,
    minCommission: 1,
    maxCommission: 1000,
    volumeDiscounts: [],
  },
  DEFAULT: {
    category: 'DEFAULT',
    sellerCommission: 4,
    buyerFee: 0,
    minCommission: 2,
    maxCommission: 1000,
    volumeDiscounts: [],
  },
};

// ============================================
// CALCULATOR
// ============================================

export class CommissionCalculator {
  static calculate(
    category: ProductCategory,
    priceInPi: number,
    sellerMonthlyVolume: number = 0
  ): CommissionCalculation {
    const rule = COMMISSION_RATES[category] || COMMISSION_RATES.DEFAULT;

    let commission = (priceInPi * rule.sellerCommission) / 100;
    commission = Math.max(rule.minCommission, Math.min(commission, rule.maxCommission));

    let volumeDiscount = 0;
    for (const discount of rule.volumeDiscounts) {
      if (sellerMonthlyVolume >= discount.minMonthlyVolume) {
        volumeDiscount = discount.discountPercentage;
        break;
      }
    }

    if (volumeDiscount > 0) {
      commission = commission * (1 - volumeDiscount / 100);
    }

    return {
      grossPrice: priceInPi,
      commission: Math.round(commission * 100) / 100,
      netToSeller: Math.round((priceInPi - commission) * 100) / 100,
      effectiveRate: Math.round((commission / priceInPi) * 10000) / 100,
      volumeDiscount,
    };
  }
}
