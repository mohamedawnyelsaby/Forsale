'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initializePi = async () => {
      const checkPi = () => {
        if (typeof window !== 'undefined' && (window as any).Pi) {
          (window as any).Pi.init({ version: "2.0", sandbox: false })
            .then(() => {
              console.log("Pi SDK Ready");
              setPiReady(true);
            })
            .catch((e: any) => console.error("Init error:", e));
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

      // STEP 1: Authenticate with Scopes (This fixes the "Missing Scope" error)
      const scopes = ['payments', 'username'];
      await Pi.authenticate(scopes, (onIncompletePaymentFound: any) => {
        console.log("Incomplete payment detected:", onIncompletePaymentFound);
      });

      // STEP 2: Create Payment
      Pi.createPayment(
        {
          amount: 3.14,
          memo: "Step 10 Validation",
          metadata: { orderId: "step_10_final" }
        },
        {
          onReadyForServerApproval: (id: string) => {
            console.log('Payment Approved. ID:', id);
          },
          onReadyForServerCompletion: (id: string, tx: string) => {
            alert("Payment successful! Step 10 is now complete.");
          },
          onCancel: (id: string) => {
            console.log("Payment cancelled");
          },
          onError: (err: any) => {
            alert(`Payment error: ${err.message}`);
          },
        }
      );
    } catch (err: any) {
      alert(`Auth Error: ${err.message}. Please check Developer Portal settings.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <nav className="flex gap-4">
            <span className="text-sm cursor-pointer hover:text-purple-600">Browse</span>
            <span className="text-sm cursor-pointer hover:text-purple-600">Sell</span>
            <span className="text-sm cursor-pointer hover:text-purple-600">Sign In</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Buy & Sell Globally with <span className="text-purple-600">AI</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 max-w-2xl mx-auto">
            The world's first AI-native marketplace powered by Pi Network.
            Zero fees, instant payments, intelligent assistance.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleStartShopping}
              disabled={!piReady}
              className="rounded-lg bg-purple-600 px-12 py-4 text-white font-bold shadow-lg hover:bg-purple-700 disabled:bg-gray-400 transition-all active:scale-95"
            >
              {piReady ? 'START SHOPPING' : 'INITIALIZING PI...'}
            </button>
            
            <div className="text-sm">
              Status: <span className={piReady ? 'text-green-600 font-bold' : 'text-orange-500'}>
                {piReady ? '● SDK READY' : '● CONNECTING...'}
              </span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-20 border-t">
          <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">Logy AI</h3>
              <p className="text-gray-500 text-sm">Smart assistant for all your trades.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-2">Pi Payments</h3>
              <p className="text-gray-500 text-sm">Fast, secure, and decentralized.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Global</h3>
              <p className="text-gray-500 text-sm">Connect with buyers worldwide.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 Forsale Store. Powered by Pi Network.
      </footer>
    </div>
  );
}
