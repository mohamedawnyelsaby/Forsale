'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  // Use a simple state to check if we are in Pi Browser
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Force initialize even if it takes a moment
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        (window as any).Pi.init({ version: "2.0", sandbox: false });
        setIsReady(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMarwanAction = async (name: string, price: number) => {
    // This function will run NO MATTER WHAT when you click
    console.log("Button Clicked for:", name);

    try {
      // 1. Immediate Save to DB (Marwan's Task)
      await fetch('/api/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, price: price }),
      });

      // 2. Trigger Pi Payment Window
      if ((window as any).Pi) {
        const paymentData = {
          amount: price,
          memo: `Order: ${name}`,
          metadata: { productName: name }
        };

        const callbacks = {
          onReadyForServerApproval: (id: string) => console.log("Approved:", id),
          onReadyForServerCompletion: (id: string, tx: string) => console.log("Done:", tx),
          onCancel: (id: string) => console.log("Cancelled"),
          onError: (err: any) => alert("Payment Error: " + err.message),
        };

        await (window as any).Pi.createPayment(paymentData, callbacks);
      } else {
        alert("Pi SDK not found in window");
      }
    } catch (error) {
      console.error("Task failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-purple-600">Forsale</div>
        <div className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200">
          SYSTEM ACTIVE
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Personal Store</h1>
          <p className="text-gray-500">Click any product to save to DB and pay</p>
        </div>

        {/* Action Buttons (The Products) */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-2 border-purple-100 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Product 01</h2>
            <p className="text-3xl font-black text-purple-600 mb-6">3.14 Pi</p>
            <button 
              onClick={() => handleMarwanAction("Product 01", 3.14)}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition-all shadow-lg"
            >
              BUY & SAVE NOW
            </button>
          </div>

          <div className="border-2 border-purple-100 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Product 02</h2>
            <p className="text-3xl font-black text-purple-600 mb-6">10.00 Pi</p>
            <button 
              onClick={() => handleMarwanAction("Product 02", 10.00)}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition-all shadow-lg"
            >
              BUY & SAVE NOW
            </button>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-400 text-xs border-t">
        © 2026 Forsale - Verified Pi Application
      </footer>
    </div>
  );
}
