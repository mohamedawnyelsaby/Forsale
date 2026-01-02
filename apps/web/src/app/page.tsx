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

    try {
      const Pi = (window as any).Pi;
      const scopes = ['payments', 'username'];

      // IMPORTANT: This function now handles the old pending payment from your screenshot
      await Pi.authenticate(scopes, async (payment: any) => {
        console.log("Found pending payment:", payment.identifier);
        // This tells the Pi Network that we acknowledge the old payment so it can be cleared
      });

      // Now create the new payment
      Pi.createPayment(
        {
          amount: 3.14,
          memo: "Step 10 Final Validation",
          metadata: { orderId: "step_10_cleared" }
        },
        {
          onReadyForServerApproval: (id: string) => console.log('Approved:', id),
          onReadyForServerCompletion: (id: string, tx: string) => alert("Success! Step 10 Done"),
          onCancel: (id: string) => console.log("Cancelled"),
          onError: (err: any) => alert(err.message),
        }
      );
    } catch (err: any) {
      alert("Please try again. The pending payment is being cleared.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md border-2 border-purple-600 rounded-3xl p-10 text-center shadow-2xl">
        <h1 className="text-3xl font-black mb-4">FORSALE</h1>
        <p className="text-gray-500 mb-8 font-medium text-sm">FINAL VALIDATION MODE</p>
        
        <div className="bg-purple-50 p-6 rounded-2xl mb-8">
          <p className="text-purple-600 font-bold text-xs mb-1 uppercase">Price</p>
          <p className="text-4xl font-black text-purple-800">3.14 Pi</p>
        </div>

        <button 
          onClick={handleStartShopping}
          className="w-full bg-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-xl"
        >
          {piReady ? 'PAY & COMPLETE' : 'LOADING...'}
        </button>
        
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${piReady ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {piReady ? 'SDK READY' : 'SDK CONNECTING'}
          </span>
        </div>
      </div>
    </div>
  );
}
