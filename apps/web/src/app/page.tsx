'use client';

import React, { useState, useEffect } from 'react';

export default function ForsalePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [piBalance, setPiBalance] = useState(0);
  const [cartCount, setCartCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      revealOnScroll();
    };
    
    window.addEventListener('scroll', handleScroll);

    animateValue('products', 0, 2567890, 2000);
    animateValue('sellers', 0, 500000, 2000);
    animateValue('users', 0, 1000000, 2000);

    createStars();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const createStars = () => {
    const bg = document.querySelector('.animated-bg');
    if (!bg) return;
    
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      bg.appendChild(star);
    }
  };

  const animateValue = (id: string, start: number, end: number, duration: number) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  };

  const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight - 100) {
        element.classList.add('revealed');
      }
    });
  };

  const connectWallet = () => {
    const balance = Math.floor(Math.random() * 10000) + 1000;
    setPiBalance(balance);
    alert(`✅ Demo Wallet Connected!\n\nWelcome, DemoUser!\n\nBalance: π ${balance.toLocaleString()}\n\n💡 To use real Pi Network:\n1. Register at developers.minepi.com\n2. Get your API key\n3. Update config.js`);
  };

  const categories = [
    { icon: '🏠', name: 'Real Estate', count: '450,892' },
    { icon: '🚗', name: 'Vehicles', count: '320,456' },
    { icon: '📱', name: 'Electronics', count: '890,234' },
    { icon: '👕', name: 'Fashion', count: '670,123' },
    { icon: '🏢', name: 'Services', count: '280,567' },
    { icon: '🌍', name: 'World Products', count: '1,234,567' }
  ];

  const products = [
    { icon: '📱', name: 'iPhone 15 Pro Max 256GB', location: 'Dubai, UAE • Natural Titanium', price: '2,450', badge: 'New', rating: 4.9 },
    { icon: '💻', name: 'MacBook Pro M3 Max 16"', location: 'Abu Dhabi • Space Black', price: '5,890', badge: 'Hot', rating: 5.0 },
    { icon: '🏠', name: 'Luxury Villa - Dubai Marina', location: 'Dubai Marina • 5 Bedrooms', price: '450,000', badge: '', rating: 4.8 },
    { icon: '🚗', name: 'BMW M4 Competition 2024', location: 'Sharjah • 3.0L Twin Turbo', price: '89,000', badge: 'New', rating: 4.9 }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0e1a] flex items-center justify-center z-[9999]">
        <div className="w-20 h-20 border-4 border-white/10 border-t-[#10B981] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] to-[#1a1f2e] text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .grid-bg {
          position: absolute;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: moveGrid 20s linear infinite;
          opacity: 0.3;
        }
        
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes logyPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }
        
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        
        .category-icon {
          animation: float 3s ease-in-out infinite;
        }
        
        .category-card:nth-child(1) .category-icon { animation-delay: 0s; }
        .category-card:nth-child(2) .category-icon { animation-delay: 0.2s; }
        .category-card:nth-child(3) .category-icon { animation-delay: 0.4s; }
        .category-card:nth-child(4) .category-icon { animation-delay: 0.6s; }
        .category-card:nth-child(5) .category-icon { animation-delay: 0.8s; }
        .category-card:nth-child(6) .category-icon { animation-delay: 1s; }
      `}</style>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="grid-bg" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-[1000] bg-[rgba(15,23,42,0.95)] backdrop-blur-[20px] border-b border-white/10 transition-all duration-300 ${scrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 cursor-pointer group transition-transform hover:scale-105">
              <div className="w-11 h-11 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-[logoGlow_3s_infinite]">
                🚀
              </div>
              <div className="orbitron text-xl font-black bg-gradient-to-r from-[#10B981] to-[#FBBF24] bg-clip-text text-transparent hidden sm:block">
                Forsale
              </div>
            </div>

            <div className="flex-1 max-w-md order-3 sm:order-none w-full sm:w-auto">
              <div className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all focus-within:border-[#10B981] focus-within:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="text-xl">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {piBalance > 0 ? (
                <div 
                  onClick={connectWallet}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-[rgba(251,191,36,0.2)] to-[rgba(245,158,11,0.2)] border-2 border-[#FBBF24] rounded-xl font-bold text-sm cursor-pointer hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all"
                >
                  <div className="w-6 h-6 bg-[#FBBF24] rounded-full flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                    π
                  </div>
                  <span className="whitespace-nowrap">π {piBalance.toLocaleString()}</span>
                </div>
              ) : (
                <div 
                  onClick={connectWallet}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-[rgba(251,191,36,0.2)] to-[rgba(245,158,11,0.2)] border-2 border-[#FBBF24] rounded-xl font-bold text-sm cursor-pointer hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all"
                >
                  <div className="w-6 h-6 bg-[#FBBF24] rounded-full flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                    π
                  </div>
                  <span className="whitespace-nowrap">Connect</span>
                </div>
              )}

              <button className="relative w-11 h-11 bg-white/5 border-2 border-white/10 rounded-xl flex items-center justify-center text-xl hover:bg-[#10B981] hover:border-[#10B981] hover:translate-y-[-2px] transition-all">
                🛒
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full text-white text-xs font-black flex items-center justify-center">
                  {cartCount}
                </span>
              </button>

              <button
                onClick={() => setSidebarOpen(true)}
                className="w-11 h-11 bg-white/5 border-2 border-white/10 rounded-xl flex items-center justify-center text-xl hover:bg-[#10B981] hover:border-[#10B981] hover:translate-y-[-2px] transition-all"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[1999]" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 right-0 w-[min(350px,85vw)] h-full z-[2000] bg-[rgba(15,23,42,0.98)] backdrop-blur-[20px] border-l border-white/10 overflow-y-auto">
            <div className="p-8 pb-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center text-xl">
                  🚀
                </div>
                <div className="orbitron text-xl font-black bg-gradient-to-r from-[#10B981] to-[#FBBF24] bg-clip-text text-transparent">
                  Forsale
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white text-2xl hover:bg-[#10B981] hover:rotate-90 transition-all"
              >
                ×
              </button>
            </div>

            <div className="p-6 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-[rgba(16,185,129,0.1)] transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#FBBF24] rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h3 className="font-bold">Guest User</h3>
                <p className="text-sm text-white/70">Login to continue</p>
              </div>
            </div>

            <div className="p-4">
              <div className="px-4 py-2 text-xs uppercase text-white/70 font-semibold tracking-wider mb-2">Main Menu</div>
              {[
                { icon: '🏠', label: 'Home' },
                { icon: '📦', label: 'Categories' },
                { icon: '🔍', label: 'Search' },
                { icon: '🛒', label: 'My Cart', badge: cartCount },
                { icon: '💬', label: 'Messages', badge: 5 },
                { icon: '🔔', label: 'Notifications', badge: 12 },
                { icon: '⚙️', label: 'Settings' }
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[rgba(16,185,129,0.1)] hover:border-r-[3px] hover:border-[#10B981] transition-all text-left"
                >
                  <span className="text-xl w-6">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-[#10B981] text-white rounded-xl text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="relative z-10 pt-24">
        {/* Hero */}
        <section className="py-20 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[rgba(16,185,129,0.1)] border border-[#10B981] rounded-full text-[#10B981] font-semibold mb-8 animate-[fadeInDown_1s_ease]">
              <span>⚡</span>
              <span className="text-sm">Powered by Pi Network • Protected by AI</span>
            </div>

            <h1 className="orbitron text-4xl sm:text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#10B981] via-[#FBBF24] to-[#3B82F6] bg-clip-text text-transparent animate-[fadeInUp_1s_ease_0.2s_both]">
              The Future of<br />Decentralized Commerce
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-10 animate-[fadeInUp_1s_ease_0.4s_both]">
              Buy and sell with confidence using Pi cryptocurrency, protected by advanced AI and blockchain escrow technology
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fadeInUp_1s_ease_0.6s_both]">
              <button className="px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-bold hover:translate-y-[-4px] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all">
                🔍 Explore Products
              </button>
              <button className="px-8 py-4 bg-white/5 border-2 border-white/10 text-white rounded-xl font-bold hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.1)] hover:translate-y-[-4px] transition-all">
                💼 Start Selling
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📦', id: 'products', label: 'Products Listed' },
              { icon: '👥', id: 'sellers', label: 'Active Sellers' },
              { icon: '🌍', id: 'users', label: 'Happy Users' },
              { icon: '💰', value: 'π 50M+', label: 'Trading Volume' }
            ].map((stat, i) => (
              <div
                key={i}
                className="scroll-reveal bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:translate-y-[-8px] hover:border-[#10B981] hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-[#10B981] before:to-[#FBBF24] before:scale-x-0 hover:before:scale-x-100 before:transition-transform"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="orbitron text-3xl font-black text-[#10B981] mb-2">
                  {stat.value || <span id={stat.id}>0</span>}
                </div>
                <div className="text-sm uppercase font-semibold text-white/70 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-reveal">
              <h2 className="orbitron text-4xl font-black mb-4 bg-gradient-to-r from-[#10B981] to-[#FBBF24] bg-clip-text text-transparent">
                Explore Categories
              </h2>
              <p className="text-white/70">Find what you're looking for across millions of listings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="scroll-reveal category-card bg-white/5 border border-white/10 rounded-3xl p-10 text-center cursor-pointer hover:translate-y-[-10px] hover:scale-[1.02] hover:border-[#10B981] hover:shadow-[0_25px_50px_rgba(16,185,129,0.3)] transition-all relative overflow-hidden before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(16,185,129,0.15),transparent_70%)] before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                >
                  <div className="category-icon text-7xl mb-4 relative z-10">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 relative z-10">{cat.name}</h3>
                  <p className="text-sm text-white/70 relative z-10">{cat.count} listings</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-reveal">
              <h2 className="orbitron text-4xl font-black mb-4 bg-gradient-to-r from-[#10B981] to-[#FBBF24] bg-clip-text text-transparent">
                Featured Products
              </h2>
              <p className="text-white/70">Handpicked deals from verified sellers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="scroll-reveal bg-white/5 border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:translate-y-[-10px] hover:border-[#10B981] hover:shadow-[0_25px_50px_rgba(16,185,129,0.3)] transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-[rgba(16,185,129,0.1)] to-[rgba(59,130,246,0.1)] flex items-center justify-center text-7xl relative overflow-hidden before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent)] before:animate-[shimmer_3s_infinite]">
                    {product.icon}
                    {product.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-[#10B981] text-white rounded-lg text-xs font-bold uppercase shadow-[0_4px_10px_rgba(16,185,129,0.5)] animate-[pulse_2s_infinite]">
                        {product.badge}
                      </div>
                    )}
                    <button className="absolute top-3 left-3 w-11 h-11 bg-black/70 backdrop-blur-[10px] rounded-full flex items-center justify-center text-xl hover:bg-[#10B981] hover:scale-[1.2] hover:rotate-[10deg] transition-all z-10">
                      ❤️
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-white/70 mb-4">
                      <span>📍</span>
                      {product.location}
                    </div>
                    <div className="orbitron text-2xl font-black text-[#FBBF24] mb-4">
                      π {product.price}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                        Verified
                      </div>
                      <div className="px-3 py-1 bg-[#10B981] text-white rounded-lg text-xs font-bold whitespace-nowrap">
                        ⭐ {product.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-reveal">
              <h2 className="orbitron text-4xl font-black mb-4 bg-gradient-to-r from-[#10B981] to-[#FBBF24] bg-clip-text text-transparent">
                Why Choose Forsale
              </h2>
              <p className="text-white/70">The safest way to buy and sell online</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🤖', title: 'Logy AI Protection', desc: 'Advanced AI monitors every transaction 24/7, detecting fraud and resolving disputes automatically' },
                { icon: '🔒', title: 'Coinsrow Escrow', desc: 'Your money is held securely until you confirm delivery. 100% buyer protection guaranteed' },
                { icon: '⚡', title: 'Pi Network Powered', desc: 'Fast, secure, and eco-friendly transactions using Pi cryptocurrency with zero fees' },
                { icon: '🌍', title: 'Global Marketplace', desc: 'Connect with millions of buyers and sellers worldwide in 10+ languages' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="scroll-reveal bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:translate-y-[-8px] hover:border-[#10B981] hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    {feature.icon}
