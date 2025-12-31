'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { usePiNetwork } from '@/components/providers/pi-network-provider';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  quantity: number;
  seller: {
    id: string;
    piUsername: string;
    averageRating: number;
    totalSales: number;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    user: {
      piUsername: string;
    };
    createdAt: string;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = usePiNetwork();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.data.product);
      } else {
        toast.error('Product not found');
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in first');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Get or create cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Add item to cart
      const existingItem = cart.find((item: any) => item.productId === product!.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId: product!.id,
          title: product!.title,
          price: product!.price,
          image: product!.images[0],
          quantity,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success('Added to cart!');
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-purple-600">
              π {product.price.toFixed(4)}
            </span>
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">
            {product.description}
          </p>

          {/* Seller Info */}
          <Card className="mb-6">
            <CardBody>
              <h3 className="font-semibold mb-2">Seller Information</h3>
              <p className="text-gray-700">
                <span className="font-medium">Username:</span> {product.seller.piUsername}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Rating:</span> ⭐ {product.seller.averageRating.toFixed(1)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Total Sales:</span> {product.seller.totalSales}
              </p>
            </CardBody>
          </Card>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                −
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                +
              </button>
              <span className="text-sm text-gray-600">
                {product.quantity} available
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
              isLoading={addingToCart}
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleAddToCart}
              isLoading={addingToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-xl mb-4">Reviews</h3>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.user.piUsername}</span>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
