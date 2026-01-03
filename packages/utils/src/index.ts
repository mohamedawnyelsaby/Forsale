export function formatPrice(amount: number): string {
  return `π ${amount.toFixed(2)}`;
}
export function generateOrderNumber(): string {
  return `FS-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
}
