'use client';
export const dynamic = "force-dynamic";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const router = useRouter();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">السلة</h1>
      {items.length === 0 ? <p>السلة فارغة</p> : <Button onClick={() => router.push('/checkout')}>إتمام الشراء</Button>}
    </div>
  );
}
