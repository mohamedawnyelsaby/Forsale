'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      const checkPi = () => {
        // التحقق من وجود SDK في نافذة المتصفح
        if (typeof window !== 'undefined' && (window as any).Pi) {
          (window as any).Pi.init({ version: "2.0", sandbox: false })
            .then(() => {
              setPiReady(true);
              console.log("Pi SDK Connected");
            })
            .catch((e: any) => console.error(e));
        } else {
          // إعادة المحاولة حتى يتم تحميل الـ SDK
          setTimeout(checkPi, 500);
        }
      };
      checkPi();
    };
    initPi();
  }, []);

  const handleStartShopping = () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    // وظيفة الدفع الأساسية - سيتم ربط مروان هنا غداً
    Pi.createPayment({
      amount: 3.14,
      memo: "Step 10 Final",
      metadata: { orderId: "initial_order_" + Date.now() }
    }, {
      onReadyForServerApproval: (id: string) => console.log("Payment ID:", id),
      onReadyForServerCompletion: (id: string, tx: string) => alert("Success!"),
      onCancel: (id: string) => console.log("Cancelled"),
      onError: (err: any) => console.error(err),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* Navbar بنفس التصميم الأصلي */}
      <header className="border-b p-4 flex justify-between items-center bg-white">
        <div className="text-2xl font-bold tracking-tighter">Forsale</div>
        <div className="flex gap-6 text-sm font-bold text-gray-500">
          <span className="text-purple-600 cursor-pointer">Browse</span>
          <span className="cursor-pointer hover:text-purple-600 transition-colors">Sell</span>
          <span className="cursor-pointer hover:text-purple-600 transition-colors">Sign In</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl md:text-6xl font-black italic tracking-tight">
          Buy & Sell Globally with <span className="text-purple-600">AI</span>
        </h1>
        <p className="mb-12 text-xl text-gray-400 max-w-2xl mx-auto font-medium">
          The world's first AI-native marketplace powered by Pi Network.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={handleStartShopping}
            className="rounded-2xl bg-purple-600 px-16 py-5 text-white font-black text-xl shadow-[0_8px_0_rgb(126,34,206)] hover:bg-purple-700 transition-all active:translate-y-1 active:shadow-none"
          >
            {piReady ? 'START SHOPPING' : 'CONNECTING...'}
          </button>
          
          {/* مؤشر اتصال الـ SDK */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <span className={`h-2.5 w-2.5 rounded-full ${piReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {piReady ? 'SDK READY' : 'CONNECTING SDK'}
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="font-bold text-lg mb-2">Logy AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Your intelligent assistant for seamless global trading.</p>
          </div>
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-bold text-lg mb-2">Pi Payments</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Secure and fast decentralized blockchain transactions.</p>
          </div>
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌍</div>
            <h3 className="font-bold text-lg mb-2">Global Market</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Connect with millions of Pioneers across the globe.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase">
        © 2026 FORSALE • POWERED BY PI NETWORK
      </footer>
    </div>
  );
}
