// FORSALE PRODUCT PAGE - COMPLETE
// Copy to: apps/web/src/app/products/[id]/page.tsx

import { notFound } from 'next/navigation';

async function getProduct(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="/" className="text-2xl font-bold">
            Forsale
          </a>
          <nav className="flex gap-4">
            <a href="/" className="text-sm">
              Home
            </a>
            <a href="/products" className="text-sm">
              Browse
            </a>
          </nav>
        </div>
      </header>

      {/* Product Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square overflow-hidden rounded-lg bg-white"
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm text-gray-600">
                {product.category}
              </div>
              <h1 className="mb-4 text-4xl font-bold">{product.title}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600">
                  {product.price} π
                </span>
                {product.quantity > 0 ? (
                  <span className="text-sm text-green-600">In Stock</span>
                ) : (
                  <span className="text-sm text-red-600">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl">
                  {product.seller?.firstName?.[0] || '?'}
                </div>
                <div>
                  <div className="font-semibold">
                    {product.seller?.firstName} {product.seller?.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>⭐ {product.seller?.averageRating?.toFixed(1) || 'New'}</span>
                    <span>•</span>
                    <span>{product.seller?.totalSales || 0} sales</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">
                Buy with Pi Network
              </button>
              <button className="w-full rounded-lg border border-purple-600 px-6 py-3 font-semibold text-purple-600 hover:bg-purple-50">
                Add to Cart
              </button>
              <button className="w-full rounded-lg border px-6 py-3 font-semibold hover:bg-gray-50">
                Contact Seller
              </button>
            </div>

            {/* Description */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-3 text-xl font-bold">Description</h2>
              <p className="whitespace-pre-wrap text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-lg border bg-white p-4 text-center">
              <div>
                <div className="text-2xl font-bold">{product.views || 0}</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{product.saves || 0}</div>
                <div className="text-sm text-gray-600">Saves</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {product.reviews?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="rounded-lg border bg-white p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        {review.user?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {review.user?.firstName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
