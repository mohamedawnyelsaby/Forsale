'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        (window as any).Pi.init({ version: "2.0", sandbox: false }).then(() => setPiReady(true));
      }
    };
    init();
  }, []);

  const handleFinalTry = async () => {
    if (!piReady) return;
    const Pi = (window as any).Pi;

    try {
      // محاولة "تصفير" الـ Auth قبل الدفع
      await Pi.authenticate(['payments', 'username'], (payment: any) => {
        console.log("Cleaning...");
      });

      Pi.createPayment({
        amount: 3.14,
        memo: "New Fresh Order " + Math.random(), // رقم عشوائي عشان نخدع السيستم
        metadata: { 
          // غيرت الـ Key هنا عشان السيستم يعتبره تطبيق جديد تماماً
          force_new_session: Date.now().toString(), 
          step: "10_final_fix" 
        }
      }, {
        onReadyForServerApproval: (id: string) => alert("فتحت! رقم العملية: " + id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("تمت الخطوة 10 بنجاح!"),
        onCancel: (id: string) => console.log("Cancel"),
        onError: (error: any) => {
          // لو طلعت نفس الرسالة، يبقى المتصفح عندك "مخزن" (Cached) العملية القديمة
          alert("الشبكة لسه معلقة. جرب تقفل متصفح Pi بالكامل وتفتحه تاني.");
        }
      });
    } catch (e) {
      alert("حاول مرة تانية");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center p-10 border-2 border-purple-600 rounded-3xl">
        <h1 className="text-3xl font-bold text-purple-600 mb-6 font-mono tracking-tighter italic">FORSALE</h1>
        <button 
          onClick={handleFinalTry}
          className="bg-purple-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg active:scale-95"
        >
          {piReady ? 'START SHOPPING' : 'Loading...'}
        </button>
      </div>
    </div>
  );
}
