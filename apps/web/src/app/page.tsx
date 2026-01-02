'use client';

import { useEffect } from 'react';

export default function HomePage() {
  
  useEffect(() => {
    // Basic init on load, but we will force it again on click
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        (window as any).Pi.init({ version: "2.0", sandbox: false });
      } catch (e) {
        console.log("Pi Init wait...");
      }
    }
  }, []);

  const handleStartShopping = async () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      const pi = (window as any).Pi;
      
      try {
        // Force Re-init to wake up the SDK
        await pi.init({ version: "2.0", sandbox: false });

        const paymentData = {
          amount: 3.14,
          memo: "Step 10 Verification",
          metadata: { orderId: "step_10_final" }
        };

        const callbacks = {
          onReadyForServerApproval: (id: string) => {
            console.log("Payment Approved:", id);
            // Marwan's DB Save
            fetch('/api/products/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productName: "Product 01", price: 3.14 }),
            });
          },
          onReadyForServerCompletion: (id: string, tx: string) => {
            alert("Payment Success! Step 10 is complete.");
          },
          onCancel: (id: string) => console.log("Cancelled"),
          onError: (err: any) => alert("Pi Error: " + err.message),
        };

        pi.createPayment(paymentData, callbacks);
      } catch (err) {
        alert("Action failed. Please try one more time.");
      }
    } else {
      alert("Please open this app inside the Pi Browser.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-black">Forsale</div>
        <div className="flex gap-4 text-sm font-medium text-gray-600">
          <span>Browse</span>
          <span>Sell</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-black">
          Buy & Sell Globally with <span className="text-purple-600">AI</span>
        </h1>
        <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto">
          The world's first AI-native marketplace powered by Pi Network.
          Zero fees, instant payments, intelligent assistance.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleStartShopping}
            className="rounded-xl bg-purple-600 px-10 py-4 text-white font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
          >
            Start Shopping
          </button>
          <button className="rounded-xl border-2 border-purple-600 px-10 py-4 text-purple-600 font-bold">
            Start Selling
          </button>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3 text-left">
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2 text-black">Logy AI Assistant</h3>
            <p className="text-gray-500 text-sm">AI handles everything from search to customer service.</p>
          </div>
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2 text-black">Pi Payments</h3>
            <p className="text-gray-500 text-sm">Zero fees, instant global transactions on the blockchain.</p>
          </div>
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2 text-black">Global Access</h3>
            <p className="text-gray-500 text-sm">Buy & sell from anywhere in the world with ease.</p>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center text-gray-400 text-xs border-t">
        © 2026 Forsale - Verified Pi Network Merchant
      </footer>
    </div>
  );
}
