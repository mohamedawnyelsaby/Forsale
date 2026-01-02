'use client';

import { useEffect, useState, useCallback } from 'react';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  // 1. Initialize Pi SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        (window as any).Pi.init({ version: "2.0", sandbox: false });
        console.log("✅ Pi SDK Ready");
      } catch (e) {
        console.log("⏳ Initializing...");
      }
    }
  }, []);

  // 2. Handle Incomplete Payments (Cleaning legacy pending)
  const handleIncompletePayment = useCallback(async (payment: any) => {
    console.log("⚠️ Found incomplete payment:", payment.identifier);
    setStatusMessage(`⚠️ Cleaning pending transaction...`);

    try {
      const response = await fetch('/api/payments/incomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.identifier,
          reason: 'Auto-cancel legacy pending'
        })
      });

      const data = await response.json();
      if (data.success) {
        setStatusMessage('✅ Account cleared successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (error) {
      console.error("❌ Cleaning failed:", error);
      setStatusMessage('⚠️ Auto-clean failed. Try manual cancel.');
    }
  }, []);

  // 3. Payment Logic & Backend Integration
  const handleStartShopping = async () => {
    if (isProcessing) return;
    if (typeof window !== 'undefined' && (window as any).Pi) {
      const pi = (window as any).Pi;
      setIsProcessing(true);
      setStatusMessage('🔐 Authenticating...');

      try {
        const authResult = await pi.authenticate(['payments', 'username'], handleIncompletePayment);
        setUser(authResult.user);
        setStatusMessage(`💰 Creating payment for 3.14 Pi...`);

        await pi.createPayment({
          amount: 3.14,
          memo: "Forsale Step 10 Verification",
          metadata: { orderId: "order_01", userId: authResult.user.uid }
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId, 
                userId: authResult.user.uid, 
                amount: 3.14, 
                productName: "Product 01" 
              })
            });
            const data = await res.json();
            if (data.success) setStatusMessage('✅ Approved! Please sign in your wallet');
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });
            const data = await res.json();
            if (data.success) {
              setStatusMessage('🎉 Success! Product saved to database');
              setIsProcessing(false);
            }
          },
          onCancel: () => { setStatusMessage('❌ Payment Cancelled'); setIsProcessing(false); },
          onError: (error: any) => { setStatusMessage(`❌ Error: ${error.message}`); setIsProcessing(false); }
        });
      } catch (err) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-black">
      <h1 className="text-4xl font-black text-purple-600 mb-4 tracking-tighter">FORSALE</h1>
      <p className="text-gray-500 mb-8 font-bold text-center uppercase text-xs tracking-widest">
        AI-Native Marketplace | Step 10 Active
      </p>
      
      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold animate-pulse text-sm">
          {statusMessage}
        </div>
      )}

      <button 
        onClick={handleStartShopping}
        disabled={isProcessing}
        className="px-12 py-5 bg-purple-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all uppercase"
      >
        {isProcessing ? 'Processing...' : 'Start Shopping'}
      </button>

      <footer className="mt-20 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        Verified Pi Merchant v2.0
      </footer>
    </div>
  );
}
