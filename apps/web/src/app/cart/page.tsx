'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setItems(cart);
    setLoading(false);
  };

  const updateQuantity = (productId: string, change: number) => {
    const updatedItems = items.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (productId: string) => {
    if (confirm('Remove this item from cart?')) {
      const updatedItems = items.filter(item => item.productId !== productId);
      setItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0e1a, #1a1f2e);
          color: white;
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          background: rgba(15, 23, 42, 0.95);
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10B981, #FBBF24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 2rem;
        }

        .cart-items {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.75rem;
        }

        .cart-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          display: grid;
          grid-template-columns: 90px 1fr auto;
          gap: 1.25rem;
          align-items: center;
          transition: all 0.3s;
        }

        .cart-item:hover {
          background: rgba(0, 0, 0, 0.4);
          border-color: #10B981;
        }

        .item-image {
          width: 90px;
          height: 90px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          cursor: pointer;
        }

        .item-details {
          flex: 1;
        }

        .item-title {
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }

        .item-title:hover {
          color: #10B981;
        }

        .item-price {
          font-size: 1.2rem;
          font-weight: 900;
          color: #FBBF24;
          margin-bottom: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          padding: 0.3rem;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
          color: white;
        }

        .qty-btn:hover {
          background: #10B981;
          border-color: #10B981;
        }

        .qty-value {
          min-width: 35px;
          text-align: center;
          font-weight: 700;
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .remove-btn {
          width: 36px;
          height: 36px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #EF4444;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1.1rem;
        }

        .remove-btn:hover {
          background: #EF4444;
          transform: scale(1.1);
        }

        .summary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.75rem;
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .summary-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row.total {
          font-size: 1.3rem;
          font-weight: 900;
          color: #10B981;
          padding-top: 1.25rem;
        }

        .checkout-btn {
          width: 100%;
          background: linear-gradient(135deg, #10B981, #059669);
          border: none;
          padding: 1.25rem;
          border-radius: 15px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: all 0.3s;
        }

        .checkout-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        }

        .continue-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 15px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.75rem;
          transition: all 0.3s;
        }

        .continue-btn:hover {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .empty-cart {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 968px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
          
          .cart-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .summary {
            position: static;
          }
        }
      `}</style>

      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>
          🚀 Forsale
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">🛒 Your Shopping Cart</h1>
        <p className="page-subtitle">Review your items before checkout</p>

        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1rem' }}>
              Start shopping to add items to your cart
            </p>
            <button className="checkout-btn" onClick={() => router.push('/products')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="item-image" onClick={() => router.push(`/products/${item.productId}`)}>
                    📱
                  </div>
                  
                  <div className="item-details">
                    <div className="item-title" onClick={() => router.push(`/products/${item.productId}`)}>
                      {item.title}
                    </div>
                    <div className="item-price">π {item.price.toFixed(2)}</div>
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.productId, -1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.productId, 1)}>+</button>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button className="remove-btn" onClick={() => removeItem(item.productId)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary">
              <div className="summary-title">Order Summary</div>
              
              <div className="summary-row">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>π {calculateTotal().toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: '#10B981' }}>FREE</span>
              </div>
              
              <div className="summary-row">
                <span>Escrow Protection</span>
                <span style={{ color: '#10B981' }}>FREE</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>π {calculateTotal().toFixed(2)}</span>
              </div>

              <button className="checkout-btn" onClick={() => router.push('/checkout')}>
                🔒 Proceed to Checkout
              </button>
              
              <button className="continue-btn" onClick={() => router.push('/products')}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
