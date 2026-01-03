'use client';

import { useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOrders } from '@/hooks/useOrders';
import { usePiNetwork } from '@/components/providers/pi-network-provider';

export default function OrdersPage() {
  const { user } = usePiNetwork();
  const { orders, loading, error, fetchOrders } = useOrders();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardBody>
            <p className="text-center">Please sign in to view your orders</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardBody>
            <p className="text-center">Loading orders...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardBody>
            <p className="text-center text-red-500">Error: {error}</p>
            <div className="mt-4 text-center">
              <Button onClick={fetchOrders}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center">No orders found</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2">
                      Status: <span className="font-medium">{order.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {order.totalAmount} π
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item: any) => (
                      <li key={item.id} className="text-sm">
                        {item.product.title} x {item.quantity} - {item.price} π
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
