'use client';

export default function HomePage() {
  
  const handleStartShopping = async () => {
    // 1. Force identify Pi on every click
    const piWindow = (window as any).Pi;
    
    if (!piWindow) {
      alert("Please open this in Pi Browser");
      return;
    }

    try {
      // 2. Immediate Re-init to bypass "Not Initialized" error
      await piWindow.init({ version: "2.0", sandbox: false });

      // 3. Open Payment directly
      piWindow.createPayment({
        amount: 3.14,
        memo: "Final Step 10 Verification",
        metadata: { orderId: "success_10" }
      }, {
        onReadyForServerApproval: (id: string) => console.log("Approved:", id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("Success! Step 10 is GREEN"),
        onCancel: (id: string) => console.log("Cancelled"),
        onError: (err: any) => alert("Pi Error: " + err.message),
      });

      // 4. Save to DB in background (Marwan's requirement)
      fetch('/api/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: "Final Product", price: 3.14 }),
      });

    } catch (e) {
      // If init fails, we try to create payment anyway
      piWindow.createPayment({
        amount: 3.14,
        memo: "Emergency Trigger",
        metadata: { type: "emergency" }
      }, {
        onReadyForServerApproval: (id: string) => console.log(id),
        onReadyForServerCompletion: (id: string, tx: string) => alert("Step 10 Done"),
        onCancel: () => {},
        onError: (err: any) => alert("Critical Error: " + err.message),
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="text-2xl font-bold">Forsale</div>
        <nav className="flex gap-4 text-sm font-medium">
          <span className="text-purple-600">Browse</span>
          <span className="text-gray-400">Sell</span>
        </nav>
      </header>

      {/* Hero Section - YOUR ORIGINAL DESIGN */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Buy & Sell Globally with <span className="text-purple-600">AI</span>
          </h1>
          <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto">
            The world's first AI-native marketplace powered by Pi Network.
            Zero fees, instant payments, intelligent assistance.
          </p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleStartShopping}
              className="rounded-xl bg-purple-600 px-10 py-4 text-white font-bold shadow-2xl active:scale-95 transition-all"
            >
              Start Shopping
            </button>
            <button className="rounded-xl border-2 border-purple-600 px-10 py-4 text-purple-600 font-bold">
              Start Selling
            </button>
          </div>
        </section>

        {/* Why Forsale Section */}
        <section className="bg-gray-50 py-20 border-t">
          <div className="container mx-auto px-4">
            <h2 className="mb-16 text-center text-3xl font-bold">Why Forsale?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">Logy AI Assistant</h3>
                <p className="text-gray-500">AI manages everything from search to customer service.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-bold mb-2">Pi Payments</h3>
                <p className="text-gray-500">Zero fees, instant global transactions on the blockchain.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-2">Global Marketplace</h3>
                <p className="text-gray-500">Buy & sell from anywhere in the world with ease.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-gray-400 text-sm border-t">
        © 2026 Forsale. Built with AI. Powered by Pi Network.
      </footer>
    </div>
  );
}
