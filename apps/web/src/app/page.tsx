// File: apps/web/src/app/page.tsx
// Fixed Main Homepage with proper Pi SDK initialization

'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);
  
  // Check and initialize Pi SDK on component mount
  useEffect(() => {
    const initializePi = async () => {
      // Wait for Pi SDK to load
      const checkPi = () => {
        if (typeof window !== 'undefined' && (window as any).Pi) {
          setPiReady(true);
          
          // Initialize Pi SDK
          (window as any).Pi.init({ version: "2.0", sandbox: false })
            .then(() => {
              console.log("✅ Pi SDK initialized successfully");
            })
            .catch((e: any) => {
              console.error("Pi SDK init error:", e);
            });
        } else {
          setTimeout(checkPi, 500);
        }
      };
      
      checkPi();
    };

    initializePi();
  }, []);

  const handleStartShopping = async () => {
    if (!piReady || typeof window === 'undefined' || !(window as any).Pi) {
      alert('Please open this page in Pi Browser');
      return;
    }

    try {
      const Pi = (window as any).Pi;
      
      // Ensure SDK is initialized
      try {
        await Pi.init({ version: "2.0", sandbox: false });
      } catch (initError) {
        console.log('SDK already initialized');
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create payment
      Pi.createPayment(
        {
          amount: 3.14,
          memo: "Step 10 Validation",
          metadata: { orderId: "123" }
        },
        {
          onReadyForServerApproval: (id: string) => {
            console.log('Payment ID:', id);
          },
          onReadyForServerCompletion: (id: string, tx: string) => {
            alert(`Payment successful! TX: ${tx.substring(0, 10)}...`);
          },
          onCancel: (id: string) => {
            console.log("Payment cancelled:", id);
          },
          onError: (err: any) => {
            alert(`Payment error: ${err.message}`);
          },
        }
      );
    } catch (err: any) {
      alert(`Error: ${err.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <nav className="flex gap-4">
            <a href="/products" className="text-sm hover:text-purple-600">Browse</a>
            <a href="/test-payment" className="text-sm hover:text-purple-600">Test Payment</a>
            <a href="#" className="text-sm hover:text-purple-600">Sign In</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
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
                disabled={!piReady}
                className="rounded-lg bg-purple-600 px-8 py-3 text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {piReady ? 'Start Shopping' : 'Loading Pi SDK...'}
              </button>
              <a 
                href="/test-payment"
                className="inline-block rounded-lg border border-purple-600 px-8 py-3 text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Test Payment
              </a>
            </div>

            {/* SDK Status Indicator */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Pi SDK Status: {' '}
                <span className={piReady ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                  {piReady ? '✅ Ready' : '⏳ Loading...'}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
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
