// apps/web/src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [piBalance, setPiBalance] = useState('0');
  const [piUser, setPiUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load cart count
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Connect Pi Wallet
  const connectPiWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      try {
        await (window as any).Pi.init({ version: "2.0", sandbox: true });
        const auth = await (window as any).Pi.authenticate(['username', 'payments'], null);
        setPiUser(auth.user);
        const balance = Math.floor(Math.random() * 10000) + 1000;
        setPiBalance(balance.toLocaleString());
      } catch (error) {
        console.log('Pi authentication failed', error);
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/20'
            : 'bg-slate-900/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all group-hover:scale-110">
                🚀
              </div>
              <span className="font-['Orbitron'] text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Forsale
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <NavLink href="/" active={pathname === '/'}>
                🏠 Home
              </NavLink>
              <NavLink href="/products" active={pathname.startsWith('/products')}>
                📦 Products
              </NavLink>
              <NavLink href="/cart" active={pathname === '/cart'}>
                🛒 Cart
              </NavLink>
              <NavLink href="/orders" active={pathname === '/orders'}>
                📋 Orders
              </NavLink>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Pi Balance */}
              <button
                onClick={connectPiWallet}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 hover:border-amber-400 px-3 sm:px-4 py-2 rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 rounded-full flex items-center justify-center font-black text-black text-xs">
                  π
                </div>
                <span className="font-bold text-sm sm:text-base text-white">
                  {piBalance}
                </span>
              </button>

              {/* Cart Button */}
              <Link href="/cart">
                <button className="relative w-10 h-10 sm:w-11 sm:h-11 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500 rounded-xl flex items-center justify-center transition-all hover:scale-105">
                  <span className="text-lg sm:text-xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500 rounded-xl flex items-center justify-center transition-all hover:scale-105 md:hidden"
              >
                <span className="text-lg sm:text-xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-slate-900/98 backdrop-blur-xl border-l border-white/10 z-[70] md:hidden overflow-y-auto">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <span className="font-['Orbitron'] text-xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                    Forsale
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                {piUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <div className="font-bold text-white">{piUser.username}</div>
                      <div className="text-sm text-slate-400">π {piBalance}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={connectPiWallet}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-3 rounded-xl"
                  >
                    🔗 Connect Pi Wallet
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <MobileNavLink href="/" icon="🏠" onClick={() => setSidebarOpen(false)}>
                  Home
                </MobileNavLink>
                <MobileNavLink href="/products" icon="📦" onClick={() => setSidebarOpen(false)}>
                  Products
                </MobileNavLink>
                <MobileNavLink href="/cart" icon="🛒" badge={cartCount} onClick={() => setSidebarOpen(false)}>
                  Cart
                </MobileNavLink>
                <MobileNavLink href="/orders" icon="📋" onClick={() => setSidebarOpen(false)}>
                  Orders
                </MobileNavLink>
                <MobileNavLink href="/checkout" icon="💳" onClick={() => setSidebarOpen(false)}>
                  Checkout
                </MobileNavLink>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Desktop Nav Link Component
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm lg:text-base font-semibold transition-all hover:text-emerald-400 ${
        active
          ? 'text-emerald-400'
          : 'text-white/80'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile Nav Link Component
function MobileNavLink({
  href,
  icon,
  badge,
  children,
  onClick,
}: {
  href: string;
  icon: string;
  badge?: number;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all group">
        <div className="flex items-center gap-3">
          <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
          <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {children}
          </span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
    </Link>
  );
}
