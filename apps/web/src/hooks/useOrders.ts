import { usePiNetwork } from '@/components/providers/pi-network-provider';
export const useOrders = () => ({
  orders: [],
  loading: false,
  error: null,
  fetchOrders: async () => {}
});
