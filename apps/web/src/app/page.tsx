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
              setPiReady(true);
              // محاولة تنظيف آلي لأي عملية قديمة عند فتح الصفحة
              (window as any).Pi.authenticate(['payments'], (p: any) => console.log("Pending found"));
            })
            .catch((e: any) => console.error(e));
        } else {
          setTimeout(checkPi, 500);
        }
      };
      checkPi();
    };
    initializePi();
  }, []);

  const handleStartShopping = async () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    try {
      // الخطوة دي بتمسح الـ Pending برمجياً
      await Pi.authenticate(['payments', 'username'], (incompletePayment: any) => {
        console.log("Stuck payment identified:", incompletePayment.identifier);
        // هنا الكود بيعرف المتصفح إننا شفنا العملية القديمة وهنتعامل معاها
      });

      // فتح بوابة الدفع الجديدة
      Pi.createPayment({
        amount: 3.14,
        memo: "Step 10 Final Test",
        metadata: { orderId: "order_" + Date.now() }
      }, {
        onReadyForServerApproval: (id: string) => console.log("Approved:", id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("Success! Step 10 Done"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => alert(err.message),
      });
    } catch (err: any) {
      alert("System Reset: Please click the button one more time.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Forsale</div>
          <nav className="flex gap-4">
            <span className="text-sm hover:text-purple-600 cursor-pointer">Browse</span>
            <span className="text-sm hover:text-purple-600 cursor-pointer">Sell</span>
            <span className="text-sm hover:text-purple-600 cursor-pointer">Sign In</span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Buy & Sell Globally with <span className="text-purple-600">AI</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 max-w-2xl mx-auto">
            The world's first AI-native marketplace powered by Pi Network.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleStartShopping}
              className="rounded-lg bg-purple-600 px-8 py-3 text-white hover:bg-purple-700 transition-colors font-bold shadow-lg active:scale-95"
            >
              {piReady ? 'Start Shopping' : 'Loading Pi SDK...'}
            </button>
            <div className="text-sm text-gray-500">
              Pi SDK Status: <span className={piReady ? 'text-green-600 font-bold' : 'text-orange-500'}>
                {piReady ? '✅ Ready' : '⏳ Connecting...'}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold mb-2">Logy AI Assistant</h3>
              <p className="text-gray-500 text-sm">AI handles everything for you.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-bold mb-2">Pi Payments</h3>
              <p className="text-gray-500 text-sm">Instant global transactions.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold mb-2">Global Market</h3>
              <p className="text-gray-500 text-sm">Buy & sell from anywhere.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 Forsale. Built with AI. Powered by Pi Network.
      </footer>
    </div>
  );
}
