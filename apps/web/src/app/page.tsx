'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      const checkPi = () => {
        if (typeof window !== 'undefined' && (window as any).Pi) {
          (window as any).Pi.init({ version: "2.0", sandbox: false })
            .then(() => setPiReady(true))
            .catch((e: any) => console.error(e));
        } else {
          setTimeout(checkPi, 500);
        }
      };
      checkPi();
    };
    initPi();
  }, []);

  const handleStartShopping = async () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    try {
      // الخطوة دي بتصطاد أي عملية قديمة "معلقة" وبتقول للشبكة إحنا شفناها
      await Pi.authenticate(['payments', 'username'], (incompletePayment: any) => {
        console.log("Found pending payment:", incompletePayment.identifier);
      });

      // محاولة فتح الدفع الجديد
      Pi.createPayment({
        amount: 3.14,
        memo: "Test Step 10",
        metadata: { orderId: "reset_" + Date.now() }
      }, {
        onReadyForServerApproval: (id: string) => alert("تم إنشاء الدفع بنجاح! ID: " + id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("تمت العملية بنجاح!"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => {
           if(err.message.includes("pending")) {
             alert("لسه فيه عملية معلقة.. اضغط Dismiss وجرب تضغط على الزرار مرة تانية فوراً");
           } else {
             alert(err.message);
           }
        },
      });
    } catch (err: any) {
      alert("النظام بيعمل إعادة تعيين.. جرب تضغط تاني");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="border-b p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Forsale</div>
        <div className="flex gap-6 text-sm font-semibold text-gray-600">
          <span className="text-purple-600 cursor-pointer">Browse</span>
          <span className="cursor-pointer">Sell</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-black italic text-black">
          Buy & Sell Globally with <span className="text-purple-600 font-extrabold">AI</span>
        </h1>
        <p className="mb-12 text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          The world's first AI-native marketplace powered by Pi Network.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={handleStartShopping}
            className="rounded-2xl bg-purple-600 px-16 py-5 text-white font-black shadow-[0_8px_0_rgb(126,34,206)] hover:bg-purple-700 transition-all active:translate-y-1 active:shadow-none text-xl"
          >
            {piReady ? 'START SHOPPING' : 'جاري الاتصال...'}
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <span className={`w-3 h-3 rounded-full ${piReady ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-orange-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {piReady ? 'SDK READY' : 'CONNECTING'}
            </span>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="font-bold text-lg mb-2">Logy AI</h3>
            <p className="text-sm text-gray-400">مساعدك الذكي لإدارة مبيعاتك.</p>
          </div>
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="font-bold text-lg mb-2">Pi Payments</h3>
            <p className="text-sm text-gray-400">دفع آمن وسريع عبر البلوكشين.</p>
          </div>
          <div className="p-8 border-2 border-gray-50 rounded-[40px] hover:border-purple-100 transition-all">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="font-bold text-lg mb-2">Global Market</h3>
            <p className="text-sm text-gray-400">تواصل مع ملايين الرواد حول العالم.</p>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase">
        © 2026 FORSALE • POWERED BY PI NETWORK
      </footer>
    </div>
  );
}
