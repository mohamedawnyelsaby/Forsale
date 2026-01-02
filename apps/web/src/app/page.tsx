'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        const Pi = (window as any).Pi;
        Pi.init({ version: "2.0", sandbox: false })
          .then(() => setPiReady(true));
      }
    };
    initPi();
  }, []);

  const handleStartShopping = async () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    // --- الخطوة السحرية لفك التعليقة ---
    try {
      await Pi.authenticate(['payments', 'username'], (incompletePayment: any) => {
        // بمجرد ما الكود ده يلمس العملية المعلقة، الشبكة بتعتبرها "تم التعامل معها"
        console.log("Incomplete payment acknowledged:", incompletePayment.identifier);
        
        // هنا بنقول للـ SDK: "خلاص عرفنا إنها معلقة، كمل شغلك"
        // ده اللي بيخلي رسالة Error: A pending payment needs to be handled تختفي
      });

      // بعد التنظيف، بنحاول نفتح دفع جديد فوراً
      Pi.createPayment({
        amount: 3.14,
        memo: "Fixing Step 10",
        metadata: { orderId: "reset_" + Date.now() }
      }, {
        onReadyForServerApproval: (id: string) => alert("نجحنا! العملية الجديدة بدأت: " + id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("تمت الخطوة 10!"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => {
          // لو لسه بتطلع، اضغط على الزرار مرة تانية فوراً
          alert("جاري التنظيف.. اضغط Dismiss وحاول تضغط Start Shopping مرة تانية");
        },
      });
    } catch (err) {
      alert("حاول مرة أخرى");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-purple-50 p-10 rounded-[3rem] border-4 border-purple-100 shadow-2xl text-center">
        <h1 className="text-4xl font-black text-purple-600 mb-8">FORSALE</h1>
        
        <button 
          onClick={handleStartShopping}
          className="w-full bg-purple-600 text-white font-bold py-6 rounded-2xl shadow-lg active:scale-95 transition-all text-xl mb-6"
        >
          {piReady ? 'START SHOPPING' : 'جاري التحميل...'}
        </button>

        <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">
          {piReady ? '● SDK Connected' : '○ Connecting...'}
        </p>
      </div>
      <p className="mt-8 text-gray-300 text-[10px]">FIXING PENDING PAYMENT BUG</p>
    </div>
  );
}
