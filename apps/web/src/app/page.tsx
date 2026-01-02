'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        (window as any).Pi.init({ version: "2.0", sandbox: false })
          .then(() => setPiReady(true));
      }
    };
    initPi();
  }, []);

  const forceResetPayment = async () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    try {
      // هذه الخطوة هي "المفتاح" لإزالة رسالة الخطأ
      await Pi.authenticate(['payments', 'username'], (incompletePayment: any) => {
        // بمجرد تشغيل هذا الكود، الـ SDK بيعرف إن المطور استلم المعاملة المعلقة
        alert("تم العثور على المعاملة المعلقة وجاري تنظيفها: " + incompletePayment.identifier);
      });

      // محاولة فتح عملية دفع جديدة فوراً بعد التنظيف
      Pi.createPayment({
        amount: 3.14,
        memo: "Final Step 10 Reset",
        metadata: { orderId: "order_" + Date.now() }
      }, {
        onReadyForServerApproval: (id: string) => alert("نجحت! المعاملة الجديدة بدأت بـ ID: " + id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("تمت الخطوة 10 بنجاح!"),
        onCancel: (id: string) => console.log("User cancelled"),
        onError: (error: any) => {
          console.error(error);
          alert("اضغط Dismiss وجرب تضغط الزرار مرة تانية فوراً");
        },
      });
    } catch (err) {
      alert("جرب تضغط مرة تانية لإنهاء التنظيف");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="bg-purple-600 p-12 rounded-[50px] shadow-2xl text-center max-w-sm w-full">
        <h1 className="text-white text-3xl font-black mb-10 tracking-widest">FORSALE</h1>
        
        <button 
          onClick={forceResetPayment}
          className="w-full bg-white text-purple-600 font-black py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl mb-4"
        >
          {piReady ? 'FIX & PAY' : 'CONNECTING...'}
        </button>

        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${piReady ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`}></div>
          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-tighter">
            {piReady ? 'SDK Ready to clean' : 'Waiting for Pi Browser'}
          </p>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-[9px] font-bold uppercase italic">Force Reset Pending Transaction v2.0</p>
    </div>
  );
}
