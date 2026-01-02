'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    // Look for Pi SDK every 1 second
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
          (window as any).Pi.init({ version: "2.0", sandbox: false });
          setPiReady(true);
          clearInterval(interval);
        } catch (e) {
          console.log("Waiting for Pi SDK...");
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartShopping = async () => {
    // If SDK is not ready, don't stop the user, try to init again
    if (!(window as any).Pi) {
      alert("Please open this link inside Pi Browser.");
      return;
    }

    setLoading(true);

    // STEP 1: Open Pi Payment immediately (To fix Step 10)
    try {
      const paymentData = {
        amount: 3.14,
        memo: "Validation Payment for Step 10",
        metadata: { productId: "test_001" }
      };

      const callbacks = {
        onReadyForServerApproval: (id: string) => {
          console.log("Approved:", id);
          // STEP 2: Save to DB only AFTER payment starts (Marwan's Task)
          fetch('/api/products/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName: "Successful Order", price: 3.14 }),
          });
        },
        onReadyForServerCompletion: (id: string, tx: string) => {
          setLoading(false);
          alert("Payment Success! Step 10 is now Complete.");
        },
        onCancel: (id: string) => setLoading(false),
        onError: (err: any) => {
          setLoading(false);
          alert("Pi Error: " + err.message);
        },
      };

      (window as any).Pi.createPayment(paymentData, callbacks);
    } catch (error) {
      setLoading(false);
      alert("Connection issue. Please refresh the page.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${piReady ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
            <span className="text-[10px] font-mono">{piReady ? 'SDK_READY' : 'SDK_LOADING'}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold">
              Buy & Sell Globally with <span className="text-purple-600">AI</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              The world's first AI-native marketplace powered by Pi Network.
              Zero fees, instant payments, intelligent assistance.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleStartShopping}
                className="rounded-lg bg-purple-600 px-8 py-3 text-white font-bold shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Opening Wallet...' : 'Start Shopping'}
              </button>
              <button className="rounded-lg border border-purple-600 px-8 py-3 text-purple-600">
                Start Selling
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why Forsale?</h2>
            <div className="grid gap-8 md:grid-cols-3 text-left">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="font-bold mb-2">Logy AI Assistant</h3>
                <p className="text-sm text-gray-500">AI handles everything from search to customer service.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl mb-4">💎</div>
                <h3 className="font-bold mb-2">Pi Payments</h3>
                <p className="text-sm text-gray-500">Zero fees, instant global transactions.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="font-bold mb-2">Global Access</h3>
                <p className="text-sm text-gray-500">Buy & sell from anywhere in the world.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        © 2026 Forsale - Powered by Pi Network
      </footer>
    </div>
  );
}
