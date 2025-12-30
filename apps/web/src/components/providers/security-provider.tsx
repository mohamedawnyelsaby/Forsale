// ============================================
// Security Provider
// apps/web/src/components/providers/security-provider.tsx
// ============================================
'use client';

import { ReactNode } from 'react';

export function SecurityProvider({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce?: string;
}) {
  // Add CSP nonce to inline scripts/styles if needed
  return <>{children}</>;
}

// ============================================
// Analytics Provider
// apps/web/src/components/providers/analytics-provider.tsx
// ============================================
'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';


export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Privacy-preserving analytics
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Track page view (anonymously)
      logger.event('page_view', {
        path: pathname,
        // Don't track personal data
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// ============================================
// Error Boundary
// apps/web/src/components/error-boundary.tsx
// ============================================
'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from '@forsale/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Send to error tracking service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto max-w-md space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Oops!</h1>
            <p className="text-muted-foreground">
              Something went wrong. We've been notified and are working on it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// Toast Hook
// apps/web/src/hooks/use-toast.ts
// ============================================
import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = 'default',
    }: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      if (variant === 'destructive') {
        sonnerToast.error(title, { description });
      } else {
        sonnerToast.success(title, { description });
      }
    },
  };
}

// ============================================
// Next.js Config (Security Headers)
// next.config.js
// ============================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.minepi.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.forsale.app https://sdk.minepi.com https://api.minepi.com",
              "frame-src 'self' https://sdk.minepi.com",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'forsale-uploads.s3.amazonaws.com',
      'sdk.minepi.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

// ============================================
// Environment Variables (.env.production)
// ============================================
/*
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://forsale.app
NEXT_PUBLIC_API_URL=https://api.forsale.app

# Pi Network (TESTNET)
NEXT_PUBLIC_PI_NETWORK_MODE=testnet
PI_API_KEY=your_pi_testnet_api_key_here
PI_API_URL=https://api.minepi.com

# Pi Network (MAINNET) - Comment out for testnet
# NEXT_PUBLIC_PI_NETWORK_MODE=mainnet
# PI_API_KEY=your_pi_mainnet_api_key_here
# PI_API_URL=https://api.minepi.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/forsale?sslmode=require

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
ENCRYPTION_KEY=exactly-32-characters-long-key!

# Redis
REDIS_URL=rediss://default:password@host:6379

# Monitoring (Optional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Verification (Optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_google_verification_code
*/

// ============================================
// Type Definitions (pi-network.d.ts)
// apps/web/src/types/pi-network.d.ts
// ============================================
declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<{
        accessToken: string;
        user: { uid: string; username: string };
      }>;
      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, any>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
      openShareDialog: (title: string, message: string) => void;
    };
  }
}

export {};

// ============================================
// Example Usage Component
// apps/web/src/app/checkout/page.tsx
// ============================================
'use client';

import { usePiNetwork } from '@/components/providers/pi-network-provider';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { authenticate, createPayment, user, isLoading } = usePiNetwork();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Step 1: Authenticate if not already
      if (!user) {
        const auth = await authenticate();
        if (!auth) {
          return;
        }
      }

      // Step 2: Create payment
      const paymentId = await createPayment({
        amount: 10.5, // 10.5 Pi
        memo: 'Product purchase',
        metadata: {
          orderId: 'order_123',
          productId: 'product_456',
        },
      });

      if (paymentId) {
        toast({
          title: 'Payment Successful!',
          description: 'Your order will be processed shortly.',
        });
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      
      <button
        onClick={handlePayment}
        disabled={isLoading || processing}
        className="mt-4 rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay with Pi Network'}
      </button>
    </div>
  );
}
