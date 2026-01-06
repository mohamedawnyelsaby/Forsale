// apps/web/src/app/products/[id]/ProductDetailClient.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Product } from './page';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState(product.shipping[0]?.id || '');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Memoized calculations
  const savings = useMemo(() => {
    if (product.price.original) {
      return product.price.original - product.price.current;
    }
    return 0;
  }, [product.price]);

  const totalPrice = useMemo(() => {
    const shipping = product.shipping.find(s => s.id === selectedShipping);
    return product.price.current * quantity + (shipping?.price || 0);
  }, [product.price.current, quantity, selectedShipping, product.shipping]);

  // Handlers
  const handleAddToCart = useCallback(() => {
    // TODO: Integrate with global state (Zustand/Redux/Context)
    console.log('Add to cart:', { productId: product.id, quantity, shipping: selectedShipping });
    alert(`✅ Added ${quantity}x ${product.name} to cart!`);
  }, [product.id, product.name, quantity, selectedShipping]);

  const handleBuyNow = useCallback(() => {
    // TODO: Integrate with checkout flow
    console.log('Buy now:', { productId: product.id, quantity, shipping: selectedShipping });
    window.location.href = '/checkout';
  }, [product.id, quantity, selectedShipping]);

  const handleNegotiate = useCallback(async () => {
    setIsNegotiating(true);
    // Simulate AI negotiation
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newPrice = product.price.current - 100;
    alert(`🤖 Logy AI Negotiation Success!\n\nNew Price: ${product.price.currency} ${newPrice}\nYou save additional ${product.price.currency} 100!`);
    setIsNegotiating(false);
  }, [product.price]);

  const handleARView = useCallback(() => {
    alert('🥽 AR Mode activated! In production, this would launch AR viewer.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>›</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-400 transition-colors">
            {product.category.name}
          </Link>
          <span>›</span>
          <span className="text-slate-300">{product.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24 h-fit"
          >
            {/* Main Image Display */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 group overflow-hidden">
              {/* AR Badge */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleARView}
                className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                🥽 Try in AR
              </motion.button>

              {/* Stock Badge */}
              {product.stock.available && product.stock.quantity && product.stock.quantity <= (product.stock.lowStockThreshold || 10) && (
                <div className="absolute top-4 right-4 z-10 bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold">
                  Only {product.stock.quantity} left!
                </div>
              )}

              {/* Image Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="text-9xl text-center py-12"
                >
                  {['📱', '📷', '🔋', '📡'][selectedImage]}
                </motion.div>
              </AnimatePresence>

              {/* Hover Effect Gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-transparent to-amber-500/0 group-hover:from-emerald-500/5 group-hover:to-amber-500/5 transition-all duration-500 rounded-3xl pointer-events-none" />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-4">
              {['📱', '📷', '🔋', '📡'].map((emoji, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`
                    aspect-square bg-white/5 backdrop-blur border-2 rounded-2xl
                    flex items-center justify-center text-4xl transition-all
                    ${selectedImage === idx 
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/30 bg-emerald-500/10' 
                      : 'border-white/10 hover:border-emerald-500/50'
                    }
                  `}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            
            {/* Product Title & Rating */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-lg">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < Math.floor(product.reviews.average) ? 'text-yellow-400' : 'text-slate-600'}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-slate-400 text-sm">
                  {product.reviews.average} ({product.reviews.total.toLocaleString()} reviews)
                </span>
                <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  ✓ Verified Product
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-xl border-2 border-amber-500/30 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-amber-400 font-mono">
                    {product.price.currency}{product.price.current.toLocaleString()}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNegotiate}
                  disabled={isNegotiating}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNegotiating ? '🤖 Negotiating...' : '🤖 Let AI Negotiate'}
                </motion.button>
              </div>

              {savings > 0 && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/10 flex-wrap">
                  <span className="text-slate-400 line-through text-lg">
                    {product.price.currency}{product.price.original?.toLocaleString()}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    -{product.price.discount}% OFF
                  </span>
                  <span className="text-emerald-400 font-bold">
                    You save {product.price.currency}{savings.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    {product.seller.name}
                    {product.seller.verified && <span className="text-emerald-400">✓</span>}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>⭐ {product.seller.rating}/5</span>
                    <span>•</span>
                    <span>{product.seller.totalProducts.toLocaleString()} products</span>
                    <span>•</span>
                    <span>{product.seller.totalSales.toLocaleString()} sales</span>
                  </div>
                </div>
              </div>
              
              <Link href="/messages">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-emerald-500/50 text-white py-3 rounded-xl font-bold transition-all"
                >
                  💬 Contact Seller
                </motion.button>
              </Link>
            </div>

            {/* Shipping Options */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🚚 Shipping Options</h3>
              
              <div className="space-y-3">
                {product.shipping.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedShipping(option.id)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl transition-all
                      ${selectedShipping === option.id
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : 'bg-black/20 border-2 border-white/10 hover:border-emerald-500/30'
                      }
                    `}
                  >
                    <div className="text-left">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.provider}
                        {option.isRecommended && (
                          <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Recommended</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {option.estimatedDays.min}-{option.estimatedDays.max} business days
                      </div>
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {option.currency}{option.price}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Escrow Protection */}
            {product.escrow.enabled && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 backdrop-blur-xl border-2 border-emerald-500/30 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🛡️ Coinsrow Escrow Protection</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.escrow.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                        {['✓', '🤖', '⚡', '🔒'][idx]}
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-xl text-white transition-all"
                >
                  −
                </motion.button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-black text-white">{quantity}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-xl text-white transition-all"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-5 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="sm:col-span-2 bg-white/5 hover:bg-white/10 border-2 border-emerald-500 text-white py-4 rounded-xl font-bold transition-all text-lg"
              >
                🛒 Add to Cart
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="sm:col-span-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 transition-all text-lg"
              >
                ⚡ Buy Now - {product.price.currency}{totalPrice.toLocaleString()}
              </motion.button>
            </div>

            {/* Product Description */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📝 Product Description</h3>
              <p className="text-slate-300 leading-relaxed">
                {product.longDescription || product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.attributes.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Specifications</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 capitalize">{attr.key.replace('_', ' ')}</span>
                      <span className="text-white font-semibold">{String(attr.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Floating AI Assistants */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => alert('🤖 Logy AI Assistant\n\nHow can I help you today?')}
          className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-full shadow-2xl shadow-emerald-500/50 flex items-center justify-center text-3xl hover:shadow-emerald-500/80 transition-all"
          title="Logy AI Assistant"
        >
          🤖
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => alert('👨‍💼 Marwan Support\n\n24/7 Available for help!')}
          className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full shadow-2xl shadow-amber-500/50 flex items-center justify-center text-3xl hover:shadow-amber-500/80 transition-all"
          title="Marwan Support"
        >
          👨‍💼
        </motion.button>
      </div>
    </div>
  );
}
