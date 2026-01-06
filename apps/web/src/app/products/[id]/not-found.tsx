// apps/web/src/app/products/[id]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="text-9xl mb-6 animate-bounce">🔍</div>
        
        {/* 404 Title */}
        <h1 className="text-4xl font-black text-white mb-4">
          Product Not Found
        </h1>
        
        {/* Description */}
        <p className="text-slate-400 mb-8 leading-relaxed">
          The product you're looking for doesn't exist or has been removed from our marketplace.
        </p>
        
        {/* Suggestions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">What you can do:</h3>
          <ul className="text-slate-300 text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Check if the URL is correct</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Search for similar products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Browse our categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span>Contact seller if you have the link</span>
            </li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/search">
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-105">
              🔍 Search Products
            </button>
          </Link>
          
          <Link href="/">
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
              🏠 Go Home
            </button>
          </Link>
        </div>

        {/* Popular Categories Quick Links */}
        <div className="mt-12">
          <p className="text-slate-500 text-sm mb-4">Popular Categories:</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/category/electronics">
              <span className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-all cursor-pointer">
                📱 Electronics
              </span>
            </Link>
            <Link href="/category/fashion">
              <span className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-all cursor-pointer">
                👔 Fashion
              </span>
            </Link>
            <Link href="/category/home">
              <span className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-all cursor-pointer">
                🏠 Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
