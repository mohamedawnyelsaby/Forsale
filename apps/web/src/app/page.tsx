'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      const checkPi = () => {
        // التأكد من أن المتصفح يدعم Pi والـ SDK متاح
        if (typeof window !== 'undefined' && (window as any).Pi) {
          (window as any).Pi.init({ version: "2.0", sandbox: false })
            .then(() => {
              setPiReady(true);
              console.log("Pi SDK is connected and ready!");
            })
            .catch((e: any) => console.error("SDK Init Error:", e));
        } else {
          // المحاولة مرة أخرى كل نصف ثانية إذا لم يتم التحميل بعد
          setTimeout(checkPi, 500);
        }
      };
      checkPi();
    };
    initPi();
  }, []);

  const handleStartShopping = () => {
    if (!piReady) {
      alert("الـ SDK لسه بيحمل، انتظر ثواني...");
      return;
    }

    const Pi = (window as any).Pi;

    // الاتصال بالدفع - سيتم ربط مروان هنا غداً
    Pi.createPayment({
      amount: 3.14,
      memo: "Step 10 Final Confirmation",
      metadata: { orderId: "prod_initial_test" }
    }, {
      onReadyForServerApproval: (id: string) => console.log("Approved by Client:", id),
      onReadyForServerCompletion: (id: string, tx: string) => alert("تمت العملية بنجاح!"),
      onCancel: (id: string) => console.log("User cancelled payment"),
      onError: (err: any) => console.error("Payment Error:", err),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar بنفس تصميمك الأصلي */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold tracking-tighter text-black">Forsale</div>
          <nav className="flex gap-6">
            <span className="text-sm font-semibold text-purple-600 cursor-pointer">Browse</span>
            <span className="text-sm font-semibold text-gray-500 hover:text-purple-600 cursor-pointer">Sell</span>
            <span className="text-sm font-semibold text-gray-500 hover:text-purple-600 cursor-pointer">Sign In</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-6xl font-black tracking-tight text-black">
            Buy & Sell Globally with <span className="text-purple-600 italic">AI</span>
          </h1>
          <p className="mb-12 text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            The world's first AI-native marketplace powered by Pi Network.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={handleStartShopping}
              className="rounded-2xl bg-purple-600 px-14 py-5 text-white font-black text-xl shadow-2xl hover:bg-purple-700 transition-all active:scale-95 shadow-purple-200"
            >
              {piReady ? 'START SHOPPING' : 'CONNECTING SDK...'}
            </button>
            
            {/* مؤشر الحالة (Status Indicator) */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
              <span className={`h-2.5 w-2.5 rounded-full ${piReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {piReady ? 'SDK Connected' : 'SDK Offline'}
              </span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-gray-50/50 py-20 border-t border-gray-100">
          <div className="container mx-auto px-4 grid gap-10 md:grid-cols-3">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-bold mb-2">Logy AI</h3>
              <p className="text-gray-400 text-sm font-medium">Intelligent trading assistant.</p>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-lg font-bold mb-2">Pi Payments</h3>
              <p className="text-gray-400 text-sm font-medium">Secure blockchain transactions.</p>
            </div>
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-bold mb-2">Global Market</h3>
              <p className="text-gray-400 text-sm font-medium">Connecting Pioneers everywhere.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-300 text-[10px] font-bold tracking-[0.5em] uppercase border-t border-gray-50">
        © 2026 FORSALE • AI POWERED COMMERCE
      </footer>
    </div>
  );
}
