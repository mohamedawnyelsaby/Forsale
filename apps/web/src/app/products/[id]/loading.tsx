// apps/web/src/app/products/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-8">
          <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column Skeleton */}
          <div>
            {/* Main Image Skeleton */}
            <div className="aspect-square bg-slate-800/50 backdrop-blur rounded-3xl animate-pulse mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-shimmer" />
            </div>
            
            {/* Thumbnails Skeleton */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-slate-800/50 rounded-2xl animate-pulse relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Title Card Skeleton */}
            <div className="bg-white/5 rounded-3xl p-6 space-y-4">
              <div className="h-8 bg-slate-800 rounded w-3/4 animate-pulse" />
              <div className="h-8 bg-slate-800 rounded w-full animate-pulse" />
              <div className="flex gap-3">
                <div className="h-4 bg-slate-800 rounded w-24 animate-pulse" />
                <div className="h-4 bg-slate-800 rounded w-32 animate-pulse" />
              </div>
            </div>
            
            {/* Price Card Skeleton */}
            <div className="bg-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-12 bg-slate-800 rounded w-40 animate-pulse" />
                <div className="h-10 bg-slate-800 rounded w-32 animate-pulse" />
              </div>
              <div className="flex gap-3">
                <div className="h-4 bg-slate-800 rounded w-24 animate-pulse" />
                <div className="h-4 bg-slate-800 rounded w-20 animate-pulse" />
              </div>
            </div>
            
            {/* Seller Card Skeleton */}
            <div className="bg-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-800 rounded w-48 animate-pulse" />
                  <div className="h-3 bg-slate-800 rounded w-64 animate-pulse" />
                </div>
              </div>
              <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
            </div>

            {/* Shipping Options Skeleton */}
            <div className="bg-white/5 rounded-3xl p-6 space-y-3">
              <div className="h-6 bg-slate-800 rounded w-40 animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>

            {/* Escrow Card Skeleton */}
            <div className="bg-white/5 rounded-3xl p-6 space-y-4">
              <div className="h-6 bg-slate-800 rounded w-56 animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="grid sm:grid-cols-5 gap-4">
              <div className="sm:col-span-2 h-14 bg-slate-800 rounded-xl animate-pulse" />
              <div className="sm:col-span-3 h-14 bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
