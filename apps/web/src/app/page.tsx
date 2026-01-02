'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
          await (window as any).Pi.init({ version: "2.0", sandbox: false });
          setPiReady(true);
          
          // AUTO-CLEAN: This will look for that annoying pending payment and try to handle it
          (window as any).Pi.authenticate(['payments', 'username'], (payment: any) => {
             console.log("Found a stuck payment. Attempting to clear...");
             // This empty callback acknowledges the payment to the SDK
          }).catch((e: any) => console.log("Clean-up check done"));

        } catch (e) { console.error(e); }
      } else {
        setTimeout(initPi, 500);
      }
    };
    initPi();
  }, []);

  const clearAndPay = async () => {
    const Pi = (window as any).Pi;
    try {
      // 1. Force identify the user
      await Pi.authenticate(['payments'], (payment: any) => {
        alert("Found pending payment ID: " + payment.identifier + ". Please wait 5 seconds and click again to override.");
      });

      // 2. Try to open the new payment window
      Pi.createPayment({
        amount: 3.14,
        memo: "Forcing Step 10 Completion",
        metadata: { orderId: "reset_step_10" }
      }, {
        onReadyForServerApproval: (id: string) => alert("Payment Created! ID: " + id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("Step 10 Done!"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => alert("Technical Hint: " + err.message)
      });
    } catch (err: any) {
      alert("System Busy: The old payment is still clearing. Please try one last time in 1 minute.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl border-4 border-purple-600 text-center max-w-sm w-full">
        <h1 className="text-4xl font-black text-purple-600 mb-2 italic">FORSALE</h1>
        <p className="text-xs font-bold text-slate-400 mb-8 tracking-[0.2em]">RECOVERY MODE</p>
        
        <button 
          onClick={clearAndPay}
          className="w-full bg-purple-600 text-white h-20 rounded-3xl font-black text-xl shadow-[0_10px_0_rgb(126,34,206)] active:shadow-none active:translate-y-2 transition-all"
        >
          {piReady ? 'FIX & PAY' : 'WAITING...'}
        </button>

        <p className="mt-8 text-[10px] text-slate-400 leading-relaxed">
          If you see "Pending payment", it means the Pi Network is still holding your old transaction. 
          The code above is now trying to force a reset.
        </p>
      </div>
    </div>
  );
}
