'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    // Check for SDK every 1 second until found
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
          (window as any).Pi.init({ version: "2.0", sandbox: false });
          setPiReady(true);
          clearInterval(interval);
        } catch (e) {
          console.log("Waiting for Pi...");
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartShopping = async () => {
    if (!piReady) {
      alert("Pi Network is still loading... Please wait 3 seconds.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save to Database for Marwan
      await fetch('/api/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: "Final Test", price: 3.14 }),
      });

      // 2. Trigger Payment Window
      const paymentData = {
        amount: 3.14,
        memo: "Completing Step 10",
        metadata: { orderId: "step10-test" }
      };

      (window as any).Pi.createPayment(paymentData, {
        onReadyForServerApproval: (id: string) => console.log("Approved:", id),
        onReadyForServerCompletion: (id: string, tx: string) => {
          console.log("Success:", tx);
          alert("Payment Successful! Step 10 is now green.");
        },
        onCancel: (id: string) => setLoading(false),
        onError: (err: any) => {
          setLoading(false);
          alert("Payment Error: " + err.message);
        },
      });
    } catch (error) {
      setLoading(false);
      alert("System Busy. Please try again in a moment.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${piReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
            <span className="text-xs text-gray-500">{piReady ? 'Ready' : 'Connecting Pi...'}</span>
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
                disabled={loading}
                className={`rounded-lg px-8 py-3 text-white font-bold shadow-lg transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                }`}
              >
                {loading ? 'Processing...' : 'Start Shopping'}
              </button>
              <button className="rounded-lg border border-purple-600 px-8 py-3 text-purple-600 hover:bg-purple-50">
                Start Selling
              </button>
            </div>
          </div>
        </section>

        {/* Why Forsale Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why Forsale?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-sm border">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="mb-2 text-xl font-bold">Logy AI Assistant</h3>
                <p className="text-gray-600">AI handles everything from search to customer service</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm border">
                <div className="mb-4 text-4xl">💎</div>
                <h3 className="mb-2 text-xl font-bold">Pi Network Payments</h3>
                <p className="text-gray-600">Zero fees, instant global transactions</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm border">
                <div className="mb-4 text-4xl">🌍</div>
                <h3 className="mb-2 text-xl font-bold">Global Marketplace</h3>
                <p className="text-gray-600">Buy & sell from anywhere, 50+ languages</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 Forsale. Verified Pi Network Merchant.
      </footer>
    </div>
  );
}
