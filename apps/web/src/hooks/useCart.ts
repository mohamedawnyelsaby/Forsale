export const useCart = () => ({
  items: [],
  total: 0,
  count: 0,
  addItem: (item: any) => {},
  updateQuantity: (id: string, q: number) => {},
  removeItem: (id: string) => {},
  clearCart: () => {},
  loading: false
});
