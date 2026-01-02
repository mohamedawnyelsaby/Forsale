'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    // Check for Pi SDK presence every 500ms
    const timer = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
          (window as any).Pi.init({ version: "2.0", sandbox: false });
          setIsSdkReady(true);
          clearInterval(timer);
        } catch (e) {
          console.log("Pi SDK initializing...");
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const handleStartShopping = async () => {
    // Direct call to Pi Payment - the priority is finishing Step 10
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        const paymentData = {
          amount: 3.14,
          memo: "Step 10 Validation",
          metadata: { test: "success" }
        };

        (window as any).Pi.createPayment(paymentData, {
          onReadyForServerApproval: (id: string) => {
            console.log("Payment ID:", id);
            // After payment starts, we can save to DB in background
            fetch('/api/products/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productName: "Order_Step_10", price: 3.14 }),
            });
          },
          onReadyForServerCompletion: (id: string, tx: string) => {
            alert("Transaction Complete! Step 10 is verified.");
          },
          onCancel: (id: string) => console.log("User cancelled"),
          onError: (err: any) => alert("Please try again: " + err.message),
        });
      } catch (err) {
        alert("Wait a second for Pi to connect...");
      }
    } else {
      alert("Open this app inside the Pi Browser.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Small Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Forsale</div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isSdkReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
          <span className="text-[10px] text-gray-400">{isSdkReady ? 'CONNECTED' : 'CONNECTING'}</span>
        </div>
      </header>

      {/* Hero Section - Keeping your original design */}
      <main className="flex-1 container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Buy & Sell Globally with <span className="text-purple-600">AI</span>
        </h1>
        <p className="mb-8 text-lg text-gray-500 max-w-2xl mx-auto">
          The world's first AI-native marketplace powered by Pi Network. 
          Zero fees, instant payments, intelligent assistance.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleStartShopping}
            className="rounded-lg bg-purple-600 px-10 py-4 text-white font-bold shadow-xl active:scale-95 transition-transform"
          >
            Start Shopping
          </button>
          <button className="rounded-lg border border-purple-600 px-10 py-4 text-purple-600 font-bold">
            Start Selling
          </button>
        </div>

        {/* Features - Your Design */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold mb-1">Logy AI Assistant</h3>
            <p className="text-sm text-gray-400">AI manages everything for you.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="font-bold mb-1">Pi Payments</h3>
            <p className="text-sm text-gray-400">Secure blockchain transactions.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-bold mb-1">Global Access</h3>
            <p className="text-sm text-gray-400">Buy and sell from anywhere.</p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-xs text-gray-300 border-t">
        © 2026 Forsale - Pi Network Merchant App
      </footer>
    </div>
  );
}
