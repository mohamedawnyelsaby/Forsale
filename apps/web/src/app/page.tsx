'use client';

export default function HomePage() {
  
  const handleStartShopping = () => {
    // 1. الوصول المباشر لـ SDK بدون أي تعقيدات برمجية
    if (typeof window !== 'undefined' && (window as any).Pi) {
      const pi = (window as any).Pi;
      
      // 2. طلب الدفع فوراً (هذا ما تطلبه الخطوة 10)
      pi.createPayment({
        amount: 3.14,
        memo: "Testing Payment Step 10",
        metadata: { productId: "item_001" }
      }, {
        onReadyForServerApproval: (id: string) => {
          console.log("Approved", id);
          // 3. حفظ البيانات لمروان في الخلفية بعد التأكد من فتح النافذة
          fetch('/api/products/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName: "Test Product", price: 3.14 }),
          });
        },
        onReadyForServerCompletion: (id: string, tx: string) => alert("Success! Step 10 Green"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => alert("Error: " + err.message),
      });
    } else {
      alert("Please open in Pi Browser");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Header - تصميمك الأصلي */}
      <header className="border-b p-4 flex justify-between items-center bg-white">
        <div className="text-2xl font-bold">Forsale</div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-purple-600">Browse</span>
          <span>Sell</span>
          <span>Sign In</span>
        </div>
      </header>

      {/* Hero Section - تصميمك الأصلي */}
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-6xl font-black tracking-tighter">
          Buy & Sell Globally with <span className="text-purple-600">AI</span>
        </h1>
        <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto">
          The world's first AI-native marketplace powered by Pi Network.
          Zero fees, instant payments, intelligent assistance.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleStartShopping}
            className="rounded-xl bg-purple-600 px-12 py-4 text-white font-bold text-lg shadow-xl active:scale-90 transition-all"
          >
            Start Shopping
          </button>
          <button className="rounded-xl border-2 border-purple-600 px-12 py-4 text-purple-600 font-bold text-lg">
            Start Selling
          </button>
        </div>

        {/* Why Forsale - تصميمك الأصلي */}
        <div className="mt-32">
            <h2 className="text-4xl font-bold mb-16">Why Forsale?</h2>
            <div className="grid gap-8 md:grid-cols-3 text-left">
                <div className="p-8 border rounded-3xl">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold mb-2">Logy AI Assistant</h3>
                    <p className="text-gray-500">AI handles everything from search to customer service.</p>
                </div>
                <div className="p-8 border rounded-3xl">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-xl font-bold mb-2">Pi Payments</h3>
                    <p className="text-gray-500">Zero fees, instant global transactions on the blockchain.</p>
                </div>
                <div className="p-8 border rounded-3xl">
                    <div className="text-4xl mb-4">🌍</div>
                    <h3 className="text-xl font-bold mb-2">Global Access</h3>
                    <p className="text-gray-500">Buy & sell from anywhere in the world with ease.</p>
                </div>
            </div>
        </div>
      </main>

      <footer className="py-10 text-center text-gray-400 text-xs border-t">
        © 2026 Forsale - Verified Pi Network Merchant
      </footer>
    </div>
  );
}
