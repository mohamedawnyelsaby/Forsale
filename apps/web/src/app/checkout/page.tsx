'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    // Simulate order placement
    setTimeout(() => {
      alert('🎉 Order Placed Successfully!\n\n✅ Payment secured by Coinsrow Escrow\n🤖 Logy AI is now monitoring your order');
      localStorage.removeItem('cart');
      router.push('/orders');
    }, 2000);
  };

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

        .header {
          background: rgba(15, 23, 42, 0.95);
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .secure-badge {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid #10B981;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          color: #10B981;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .steps {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .step {
          text-align: center;
        }

        .step-num {
          width: 50px;
          height: 50px;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          font-weight: 700;
        }

        .step.active .step-num {
          background: #10B981;
          border-color: #10B981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        .step-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .step.active .step-label {
          color: #10B981;
          font-weight: 600;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.875rem 1.25rem;
          color: white;
          font-family: inherit;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.05);
        }

        .escrow-box {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12));
          border: 2px solid #10B981;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .escrow-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .escrow-flow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .escrow-step {
          flex: 1;
          text-align: center;
        }

        .escrow-icon {
          width: 60px;
          height: 60px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          font-size: 1.8rem;
        }

        .escrow-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .arrow {
          color: #10B981;
          font-size: 1.5rem;
        }

        .place-order-btn {
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

        .place-order-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        }

        .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 968px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .escrow-flow {
            flex-direction: column;
          }

          .arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>

      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>
          🚀 Forsale
        </div>
        <div className="secure-badge">🔒 Secure Checkout</div>
      </div>

      <div className="container">
        <div className="steps">
          <div className="step">
            <div className="step-num">✓</div>
            <div className="step-label">Cart</div>
          </div>
          <div className="step active">
            <div className="step-num">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>

        <div className="checkout-grid">
          <div>
            <div className="card">
              <div className="card-title">📍 Shipping Address</div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue="Mohammed Ali" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" defaultValue="+971 50 123 4567" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" defaultValue="mohammed@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input type="text" className="form-input" defaultValue="Business Bay, Dubai" />
              </div>
            </div>

            <div className="escrow-box">
              <div className="escrow-title">🔒 How Coinsrow Escrow Protects You</div>
              <div className="escrow-flow">
                <div className="escrow-step">
                  <div className="escrow-icon">💰</div>
                  <div className="escrow-label">You pay<br/>Money held safely</div>
                </div>
                <div className="arrow">→</div>
                <div className="escrow-step">
                  <div className="escrow-icon">📦</div>
                  <div className="escrow-label">Seller ships<br/>product</div>
                </div>
                <div className="arrow">→</div>
                <div className="escrow-step">
                  <div className="escrow-icon">🤖</div>
                  <div className="escrow-label">AI tracks<br/>delivery</div>
                </div>
                <div className="arrow">→</div>
                <div className="escrow-step">
                  <div className="escrow-icon">✅</div>
                  <div className="escrow-label">You confirm<br/>Seller gets paid</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-title">📋 Order Summary</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FBBF24', marginTop: '1rem' }}>
                π {calculateTotal().toFixed(2)}
              </div>
              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : '🔒 Place Order Securely'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
