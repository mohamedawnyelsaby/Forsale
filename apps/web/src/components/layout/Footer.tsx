// apps/web/src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-slate-900/50 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                🚀
              </div>
              <span className="font-['Orbitron'] text-2xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Forsale
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The future of decentralized commerce. Buy and sell with confidence using Pi cryptocurrency.
            </p>
            <div className="flex gap-3">
              <SocialButton icon="📘" href="#" label="Facebook" />
              <SocialButton icon="🐦" href="#" label="Twitter" />
              <SocialButton icon="📷" href="#" label="Instagram" />
              <SocialButton icon="💼" href="#" label="LinkedIn" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/products">Products</FooterLink>
              <FooterLink href="/cart">Shopping Cart</FooterLink>
              <FooterLink href="/orders">My Orders</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">Contact Us</FooterLink>
              <FooterLink href="#">Safety Tips</FooterLink>
              <FooterLink href="#">Dispute Resolution</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
              <FooterLink href="#">Escrow Terms</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {currentYear} Forsale. All rights reserved. Powered by Pi Network.
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Secured by</span>
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 rounded-full">
                <span className="text-sm">🔒</span>
                <span className="text-emerald-400 font-bold text-sm">Coinsrow Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 opacity-50" />
    </footer>
  );
}

// Social Button Component
function SocialButton({ icon, href, label }: { icon: string; href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20"
    >
      <span className="text-lg">{icon}</span>
    </a>
  );
}

// Footer Link Component
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-slate-400 hover:text-emerald-400 transition-colors text-sm block py-1"
      >
        {children}
      </Link>
    </li>
  );
}
