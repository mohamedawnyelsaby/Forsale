'use client';

import { useEffect } from 'react';

export default function HomePage() {
  
  useEffect(() => {
    // This initializes the SDK to remove the red error and enable Step 10
    if (typeof window !== 'undefined' && (window as any).Pi) {
      (window as any).Pi.init({ version: "2.0", sandbox: false });
    }
  }, []);

  const handleStartShopping = async () => {
    // Marwan's Goal: Save to DB and Open Pi Payment
    try {
      // 1. Save data to database
      await fetch('/api/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: "Test Product", price: 3.14 }),
      });

      // 2. Open Pi Payment window
      if ((window as any).Pi) {
        const paymentData = {
          amount: 3.14,
          memo: "Testing Step 10",
          metadata: { productName: "Test Product" }
        };

        const callbacks = {
          onReadyForServerApproval: (id: string) => console.log(id),
          onReadyForServerCompletion: (id: string, tx: string) => console.log(tx),
          onCancel: (id: string) => console.log("Cancelled"),
          onError: (err: any) => console.error(err),
        };

        await (window as any).Pi.createPayment(paymentData, callbacks);
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <nav className="flex gap-4">
            <a href="#" className="text-sm">Browse</a>
            <a href="#" className="text-sm">Sell</a>
            <a href="#" className="text-sm">Sign In</a>
          </nav>
        </div>
      </header>

      {/* Hero Section - YOUR ORIGINAL DESIGN */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold">
              Buy & Sell Globally with{' '}
              <span className="text-purple-600">AI</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              The world's first AI-native marketplace powered by Pi Network.
              Zero fees, instant payments, intelligent assistance.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleStartShopping}
                className="rounded-lg bg-purple-600 px-8 py-3 text-white hover:bg-purple-700 font-bold"
              >
                Start Shopping
              </button>
              <button className="rounded-lg border border-purple-600 px-8 py-3 text-purple-600 hover:bg-purple-50">
                Start Selling
              </button>
            </div>
          </div>
        </section>

        {/* Features - YOUR ORIGINAL DESIGN */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Why Forsale?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="mb-2 text-xl font-bold">Logy AI Assistant</h3>
                <p className="text-gray-600">
                  AI handles everything from search to customer service
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl">💎</div>
                <h3 className="mb-2 text-xl font-bold">Pi Network Payments</h3>
                <p className="text-gray-600">
                  Zero fees, instant global transactions
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl">🌍</div>
                <h3 className="mb-2 text-xl font-bold">Global Marketplace</h3>
                <p className="text-gray-600">
                  Buy & sell from anywhere, 50+ languages
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-600">
        © 2026 Forsale. Built with AI. Powered by Pi Network.
      </footer>
    </div>
  );
}
