/**
 * SECURITY & UTILITY PROVIDERS
 * All-in-one file for security, analytics, error boundary, and toast hook
 * apps/web/src/components/providers/security-provider.tsx
 */

'use client';

import React, { Component, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';

// ============================================
// LOGGER (Simple implementation for client)
// ============================================

const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data);
  },
  event: (name: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EVENT] ${name}`, data);
    }
  },
};

// ============================================
// Security Provider
// ============================================

interface SecurityProviderProps {
  children: ReactNode;
  nonce?: string;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  // Add CSP nonce to inline scripts/styles if needed
  // In a real implementation, you'd inject the nonce into script tags
  return <>{children}</>;
}

// ============================================
// Error Boundary
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Send to error tracking service in production
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
// ============================================

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
// Analytics Provider
// ============================================

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
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
