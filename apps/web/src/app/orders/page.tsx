'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOrders } from '@/hooks/useOrders';
import { usePiNetwork } from '@/components/providers/pi-network-provider';

type OrderType = 'purchases' | 'sales';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  PENDING: 'Pending Payment',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const { user } = usePiNetwork();
  const [activeTab, setActiveTab] = useState<OrderType>('purchases');
  const { orders, loading, error, refetch } = useOrders(activeTab);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Sign in Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your orders
              </p>
              <Button onClick={() => window.location.reload()}>
                Sign In with Pi
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage your purchases and sales
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'purchases'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'sales'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Sales
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">Failed to Load Orders</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={refetch}>Try Again</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-semibold mb-2">
                  No {activeTab === 'purchases' ? 'purchases' : 'sales'} yet
                </h2>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'purchases'
                    ? 'Start shopping to see your orders here'
                    : 'List products to start selling'}
                </p>
                <Button onClick={() => window.location.href = '/products'}>
                  Browse Products
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id} hoverable>
                <CardBody>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                          }`}
                        >
                          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>

                      {/* Items Preview */}
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item: any, idx: number) => (
                          <p key={idx} className="text-sm text-gray-700">
                            {item.title} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.items.length - 2} more item(s)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-purple-600">
                          π {order.total.toFixed(4)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                        
                        {activeTab === 'purchases' && order.status === 'DELIVERED' && (
                          <Button size="sm" variant="outline">
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info for Sellers */}
                  {activeTab === 'sales' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Buyer:</span>{' '}
                        {order.buyer.piUsername}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
