export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/hooks/useCart';
import { usePiNetwork } from '@/components/providers/pi-network-provider';
import { toast } from 'sonner';

interface ShippingInfo {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, accessToken, createPayment } = usePiNetwork();
  const { items, total, clearCart } = useCart();

  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [_orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    // Redirect if not authenticated
    if (!user || !accessToken) {
      toast.error('Please sign in to continue');
      router.push('/cart');
      return;
    }
  }, [items, user, accessToken]);

  const handleCreateOrder = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in first');
      return;
    }

    // Validate shipping info
    const requiredFields: (keyof ShippingInfo)[] = [
      'fullName',
      'phone',
      'addressLine1',
      'city',
      'postalCode',
      'country',
    ];

    for (const field of requiredFields) {
      if (!shipping[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    try {
      setLoading(true);

      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingInfo: shipping,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const order = orderData.data.order;
      setOrderId(order.id);

      toast.success('Order created!');

      // Initiate Pi payment
      await handlePayment(order);

    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order: any) => {
    try {
      // Create payment with Pi Network
      const paymentId = await createPayment({
        amount: order.total,
        memo: `Order #${order.orderNumber}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
        },
      });

      if (paymentId) {
        // Payment successful
        toast.success('Payment completed!');
        clearCart();
        
        // Redirect to order confirmation
        setTimeout(() => {
          router.push(`/orders/${order.id}`);
        }, 1000);
      } else {
        toast.error('Payment was cancelled or failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    }
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Account</h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{user?.username}</p>
                    <p className="text-sm text-gray-600">Pi Network User</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={shipping.fullName}
                    onChange={(e: any) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1234567890"
                    value={shipping.phone}
                    onChange={(e: any) => handleInputChange('phone', e.target.value)}
                    required
                  />

                  <Input
                    label="Address"
                    placeholder="123 Main Street, Apt 4B"
                    value={shipping.addressLine1}
                    onChange={(e: any) => handleInputChange('addressLine1', e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="New York"
                      value={shipping.city}
                      onChange={(e: any) => handleInputChange('city', e.target.value)}
                      required
                    />
                    
                    <Input
                      label="Postal Code"
                      placeholder="10001"
                      value={shipping.postalCode}
                      onChange={(e: any) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Country"
                    placeholder="United States"
                    value={shipping.country}
                    onChange={(e: any) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </CardHeader>
              <CardBody>
                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        π {(item.price * item.quantity).toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>π {total.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-purple-600">π {total.toFixed(4)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateOrder}
                  isLoading={loading}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Pay with Pi Network'}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Secure payment powered by Pi Network
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
