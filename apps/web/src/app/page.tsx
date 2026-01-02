'use client';

import { useEffect } from 'react';

export default function HomePage() {
  
  useEffect(() => {
    // Initialize Pi SDK immediately to clear the path for buttons
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        (window as any).Pi.init({ version: "2.0", sandbox: false });
      } catch (e) {
        console.error("SDK Init error:", e);
      }
    }
  }, []);

  const handleStartShopping = async () => {
    console.log("Button clicked!");
    
    // Check if Pi SDK exists in window
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        // 1. Save record for Marwan
        await fetch('/api/products/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName: "First Sale", price: 3.14 }),
        });

        // 2. Open Payment Window to complete Step 10
        const paymentData = {
          amount: 3.14,
          memo: "Initial App Testing",
          metadata: { internalId: "test-001" }
        };

        const callbacks = {
          onReadyForServerApproval: (id: string) => console.log("Approved:", id),
          onReadyForServerCompletion: (id: string, tx: string) => console.log("Success:", tx),
          onCancel: (id: string) => console.log("Cancelled"),
          onError: (err: any) => alert("Pi Error: " + err.message),
        };

        (window as any).Pi.createPayment(paymentData, callbacks);
      } catch (error) {
        alert("Action failed. Check console.");
      }
    } else {
      alert("Pi SDK not detected. Please open in Pi Browser.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <nav className="flex gap-4">
            <a href="#" className="text-sm">Browse</a>
            <a href="#" className="text-sm">Sell</a>
            <a href="#" className="text-sm">Sign In</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
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
                className="rounded-lg bg-purple-600 px-8 py-3 text-white hover:bg-purple-700 font-bold shadow-lg active:scale-95 transition-transform"
              >
                Start Shopping
              </button>
              <button className="rounded-lg border border-purple-600 px-8 py-3 text-purple-600 hover:bg-purple-50">
                Start Selling
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
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
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © 2026 Forsale. Built with AI. Powered by Pi Network.
      </footer>
    </div>
  );
}
