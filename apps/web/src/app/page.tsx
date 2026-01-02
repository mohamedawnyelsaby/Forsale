'use client';

export default function HomePage() {
  
  const handleStartShopping = () => {
    // حل جذري: بمجرد الضغط، ابحث عن Pi وافتح الدفع فوراً
    const pi = (window as any).Pi;
    
    if (pi) {
      try {
        pi.createPayment({
          amount: 3.14,
          memo: "Step 10 Confirmation",
          metadata: { order: "validation" }
        }, {
          onReadyForServerApproval: (id: string) => console.log("Approved", id),
          onReadyForServerCompletion: (id: string, tx: string) => alert("Success! Step 10 Done"),
          onCancel: (id: string) => console.log("Cancel"),
          onError: (err: any) => alert("Error: " + err.message),
        });
      } catch (e) {
        alert("Try again in 1 second");
      }
    } else {
      alert("Please use Pi Browser");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header - Simple & Clean */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Forsale</div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Browse</span>
          <span>Sell</span>
        </div>
      </header>

      {/* Hero Section - YOUR ORIGINAL DESIGN */}
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Buy & Sell Globally with <span className="text-purple-600">AI</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600 max-w-2xl mx-auto">
          The world's first AI-native marketplace powered by Pi Network.
          Zero fees, instant payments, intelligent assistance.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleStartShopping}
            className="rounded-lg bg-purple-600 px-10 py-4 text-white font-bold shadow-xl active:scale-95 transition-all"
          >
            Start Shopping
          </button>
          <button className="rounded-lg border border-purple-600 px-10 py-4 text-purple-600 font-bold">
            Start Selling
          </button>
        </div>

        {/* Features - YOUR ORIGINAL DESIGN */}
        <div className="mt-24 grid gap-8 md:grid-cols-3 text-left">
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Logy AI Assistant</h3>
            <p className="text-gray-500 text-sm">AI handles everything from search to customer service.</p>
          </div>
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">Pi Network Payments</h3>
            <p className="text-gray-500 text-sm">Zero fees, instant global transactions on the blockchain.</p>
          </div>
          <div className="p-8 border rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">Global Marketplace</h3>
            <p className="text-gray-500 text-sm">Buy & sell from anywhere in the world with ease.</p>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center text-gray-400 text-xs border-t">
        © 2026 Forsale - Verified Pi Network Application
      </footer>
    </div>
  );
}
