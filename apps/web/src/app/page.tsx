'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [piReady, setPiReady] = useState(false);

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        (window as any).Pi.init({ version: "2.0", sandbox: false })
          .then(() => setPiReady(true))
          .catch(() => {});
      } else {
        const interval = setInterval(() => {
          if ((window as any).Pi) {
            (window as any).Pi.init({ version: "2.0", sandbox: false })
              .then(() => {
                setPiReady(true);
                clearInterval(interval);
              });
          }
        }, 500);
      }
    };
    initPi();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-black tracking-tighter text-black">Forsale</div>
        <nav className="flex gap-8">
          <span className="text-sm font-bold text-purple-600 cursor-pointer">Browse</span>
          <span className="text-sm font-bold text-gray-400 cursor-pointer hover:text-black">Sell</span>
          <span className="text-sm font-bold text-gray-400 cursor-pointer hover:text-black">Sign In</span>
        </nav>
      </header>

      {/* Main Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-4xl text-6xl font-black leading-none tracking-tight text-black md:text-8xl">
          BUY & SELL <br />
          GLOBALLY WITH <span className="text-purple-600 italic">AI</span>
        </h1>
        
        <p className="mt-8 max-w-xl text-lg font-medium text-gray-400">
          The world's first AI-native marketplace powered by Pi Network.
        </p>

        <div className="mt-12 flex flex-col items-center gap-6">
          <button 
            className="group relative rounded-2xl bg-purple-600 px-16 py-6 text-xl font-black text-white transition-all active:translate-y-1"
            style={{ boxShadow: '0 8px 0 rgb(126, 34, 206)' }}
            onClick={() => {
              if(piReady) {
                (window as any).Pi.createPayment({
                  amount: 3.14,
                  memo: "Test",
                  metadata: { orderId: "1" }
                }, {
                  onReadyForServerApproval: (id: string) => console.log(id),
                  onReadyForServerCompletion: (id: string, tx: string) => console.log(tx),
                  onCancel: () => {},
                  onError: () => {}
                });
              }
            }}
          >
            {piReady ? 'START SHOPPING' : 'CONNECTING...'}
          </button>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${piReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
              {piReady ? 'SDK Connected' : 'Waiting for Pi Browser'}
            </span>
          </div>
        </div>

        {/* Features Minimalist */}
        <div className="mt-32 grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🤖</span>
            <h3 className="font-bold text-black">Logy AI</h3>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">💎</span>
            <h3 className="font-bold text-black">Pi Payments</h3>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🌍</span>
            <h3 className="font-bold text-black">Global Market</h3>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-200">
          © 2026 FORSALE • TECHNOLOGY
        </p>
      </footer>
    </div>
  );
}
