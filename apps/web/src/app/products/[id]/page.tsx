// apps/web/src/app/products/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// ============================================================================
// TYPE DEFINITIONS - Enterprise-grade Type Safety
// ============================================================================

export interface DynamicAttribute {
  key: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'color' | 'size';
  group?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'gallery' | 'feature';
  order: number;
}

export interface ShippingOption {
  id: string;
  provider: string;
  method: string;
  estimatedDays: { min: number; max: number };
  price: number;
  currency: string;
  icon: string;
  isRecommended?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  totalSales: number;
  joinedDate: string;
  avatar?: string;
  responseTime?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: Seller;
  shipping: ShippingOption[];
  attributes: DynamicAttribute[];
  reviews: {
    average: number;
    total: number;
    distribution: { [key: number]: number };
    items: ProductReview[];
  };
  stock: {
    available: boolean;
    quantity?: number;
    lowStockThreshold?: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  escrow: {
    enabled: boolean;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DATA FETCHING - ISR with Advanced Caching Strategy
// ============================================================================

async function getProduct(id: string): Promise<Product | null> {
  try {
    // In production, this would be an API call
    // Example: const res = await fetch(`${process.env.API_URL}/products/${id}`, {
    //   next: { revalidate: 3600 } // ISR: Revalidate every hour
    // });
    
    // Mock data for demonstration
    const mockProduct: Product = {
      id,
      slug: 'iphone-15-pro-max-256gb',
      name: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      description: 'Experience the pinnacle of smartphone innovation',
      longDescription: 'The iPhone 15 Pro Max features a stunning titanium design, powerful A17 Pro chip, and our most advanced camera system. With ProRAW and ProRes capabilities, this device is perfect for content creators and professionals.',
      price: {
        current: 2450,
        original: 2800,
        currency: 'π',
        discount: 12.5
      },
      images: [
        { id: '1', url: '/placeholder-phone.jpg', alt: 'iPhone 15 Pro Max Front', type: 'main', order: 1 },
        { id: '2', url: '/placeholder-camera.jpg', alt: 'iPhone 15 Pro Max Camera', type: 'gallery', order: 2 },
        { id: '3', url: '/placeholder-battery.jpg', alt: 'iPhone 15 Pro Max Battery', type: 'gallery', order: 3 },
        { id: '4', url: '/placeholder-chip.jpg', alt: 'iPhone 15 Pro Max Chip', type: 'gallery', order: 4 }
      ],
      category: {
        id: 'electronics',
        name: 'Electronics',
        slug: 'electronics'
      },
      seller: {
        id: 'seller-1',
        name: 'Tech Paradise Store',
        verified: true,
        rating: 4.9,
        totalProducts: 1245,
        totalSales: 8932,
        joinedDate: '2020-01-15',
        responseTime: '< 2 hours'
      },
      shipping: [
        {
          id: 'dhl',
          provider: 'DHL Express',
          method: 'express',
          estimatedDays: { min: 2, max: 3 },
          price: 25,
          currency: 'π',
          icon: '🚀',
          isRecommended: true
        },
        {
          id: 'fedex',
          provider: 'FedEx Standard',
          method: 'standard',
          estimatedDays: { min: 4, max: 5 },
          price: 18,
          currency: 'π',
          icon: '📦'
        },
        {
          id: 'aramex',
          provider: 'Aramex',
          method: 'economy',
          estimatedDays: { min: 5, max: 7 },
          price: 12,
          currency: 'π',
          icon: '🚛'
        }
      ],
      attributes: [
        { key: 'storage', value: '256GB', type: 'text', group: 'specs' },
        { key: 'color', value: 'Natural Titanium', type: 'color', group: 'appearance' },
        { key: 'ram', value: '8GB', type: 'text', group: 'specs' },
        { key: 'display', value: '6.7" Super Retina XDR', type: 'text', group: 'specs' },
        { key: 'chip', value: 'A17 Pro', type: 'text', group: 'performance' },
        { key: 'camera', value: '48MP Main', type: 'text', group: 'camera' }
      ],
      reviews: {
        average: 4.8,
        total: 1234,
        distribution: { 5: 950, 4: 200, 3: 50, 2: 20, 1: 14 },
        items: []
      },
      stock: {
        available: true,
        quantity: 15,
        lowStockThreshold: 10
      },
      seo: {
        metaTitle: 'iPhone 15 Pro Max 256GB - Natural Titanium | Forsale',
        metaDescription: 'Buy iPhone 15 Pro Max 256GB with secure escrow payment. Fast shipping, verified seller, 12.5% OFF. Save π 350 today!',
        keywords: ['iPhone 15 Pro Max', 'Apple', 'Smartphone', 'Titanium']
      },
      escrow: {
        enabled: true,
        features: [
          'Money held safely in escrow',
          'AI tracks delivery 24/7',
          'Instant release on confirm',
          'Full refund protection'
        ]
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z'
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockProduct;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// ============================================================================
// METADATA GENERATION - Advanced SEO Optimization
// ============================================================================

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found | Forsale',
      description: 'The requested product could not be found.'
    };
  }

  const { seo, name, price, images, seller } = product;
  
  return {
    title: seo?.metaTitle || `${name} | Forsale`,
    description: seo?.metaDescription || `Buy ${name} from ${seller.name}. ${price.discount ? `Save ${price.discount}% ` : ''}Secure escrow payment.`,
    keywords: seo?.keywords || [name, seller.name, 'buy online', 'secure payment'],
    openGraph: {
      title: name,
      description: seo?.metaDescription || name,
      images: images.filter(img => img.type === 'main').map(img => ({
        url: img.url,
        alt: img.alt
      })),
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: seo?.metaDescription || name,
      images: images[0]?.url
    },
    alternates: {
      canonical: `/products/${params.id}`
    }
  };
}

// ============================================================================
// STATIC PARAMS GENERATION - ISR Support
// ============================================================================

export async function generateStaticParams() {
  // In production, fetch all product IDs from your API
  // For demo purposes, returning empty array (will use ISR for all pages)
  return [];
}

// ============================================================================
// PAGE COMPONENT - Server Component with Optimal Data Flow
// ============================================================================

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

// Export revalidate for ISR
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow dynamic params beyond generateStaticParams
