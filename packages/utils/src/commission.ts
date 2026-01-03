import type { ProductCategory } from '@forsale/types';
export class CommissionCalculator {
  static calculate(category: ProductCategory, amount: number, volumeDiscount: number = 0) {
    const rate = 0.05;
    const commission = amount * rate;
    return { grossPrice: amount, commission, netToSeller: amount - commission, effectiveRate: rate, baseRate: rate, volumeDiscount };
  }
}

export default CommissionCalculator;
