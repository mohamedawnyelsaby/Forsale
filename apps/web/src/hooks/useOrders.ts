import { useState, useEffect } from 'react';
import { usePiNetwork } from '@/components/providers/pi-network-provider';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

export function useOrders(type: 'purchases' | 'sales' = 'purchases') {
  const { accessToken } = usePiNetwork();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchOrders();
    }
  }, [accessToken, type]);

  const fetchOrders = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/orders?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
