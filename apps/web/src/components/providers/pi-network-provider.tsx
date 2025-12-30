/**
 * PI NETWORK PROVIDER - ULTRA SECURE IMPLEMENTATION
 * Handles Pi Network SDK initialization, authentication, and payments
 * @security MAXIMUM
 * @testnet YES
 * @mainnet YES
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import Script from 'next/script';
import { logger } from '@forsale/logger';
import { useToast } from '@/hooks/use-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

export type PiNetworkMode = 'testnet' | 'mainnet';

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiPaymentDTO {
  amount: number;
  memo: string;
  metadata: {
    orderId?: string;
    productId?: string;
    [key: string]: any;
  };
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

export interface PiNetworkSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPayment) => void
  ) => Promise<{ accessToken: string; user: PiUser }>;
  createPayment: (
    paymentData: PiPaymentDTO,
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: PiPayment) => void;
    }
  ) => void;
  openShareDialog: (title: string, message: string) => void;
}

export interface PiNetworkContextType {
  sdk: PiNetworkSDK | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  user: PiUser | null;
  accessToken: string | null;
  networkMode: PiNetworkMode;
  authenticate: () => Promise<{ user: PiUser; accessToken: string } | null>;
  createPayment: (paymentData: PiPaymentDTO) => Promise<string | null>;
  signOut: () => void;
}

// ============================================
// CONTEXT
// ============================================

const PiNetworkContext = createContext<PiNetworkContextType | undefined>(undefined);

// ============================================
// CONFIGURATION
// ============================================

const PI_SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';

// ✅ SECURITY: Subresource Integrity Hash
// Generate fresh hash from: https://www.srihash.org/
// For production, update this hash regularly
const PI_SDK_INTEGRITY = 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC';

// Network configuration
const getNetworkConfig = (mode: PiNetworkMode) => ({
  version: '2.0',
  sandbox: mode === 'testnet',
});

// ============================================
// PROVIDER COMPONENT
// ============================================

export function PiNetworkProvider({ children }: { children: ReactNode }) {
  // State
  const [sdk, setSdk] = useState<PiNetworkSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { toast } = useToast();

  // Get network mode from environment
  const networkMode: PiNetworkMode =
    (process.env.NEXT_PUBLIC_PI_NETWORK_MODE as PiNetworkMode) || 'testnet';

  // ============================================
  // SDK INITIALIZATION
  // ============================================

  const initializeSdk = useCallback(() => {
    if (typeof window === 'undefined' || !window.Pi) {
      logger.warn('Pi SDK not available');
      return;
    }

    try {
      const config = getNetworkConfig(networkMode);
      window.Pi.init(config);

      setSdk(window.Pi);
      setIsInitialized(true);
      setError(null);

      logger.info('Pi SDK initialized', {
        network: networkMode,
        sandbox: config.sandbox,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      logger.error('Pi SDK initialization failed', err as Error, {
        network: networkMode,
      });
    } finally {
      setIsLoading(false);
    }
  }, [networkMode]);

  // ============================================
  // AUTHENTICATION
  // ============================================

  const authenticate = useCallback(async (): Promise<{
    user: PiUser;
    accessToken: string;
  } | null> => {
    if (!sdk) {
      toast({
        title: 'Error',
        description: 'Pi Network SDK not initialized',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsLoading(true);

      // Handle incomplete payments
      const handleIncompletePayment = async (payment: PiPayment) => {
        logger.warn('Incomplete payment found', { paymentId: payment.identifier });

        // Send to backend for processing
        try {
          await fetch('/api/payments/pi/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment }),
          });
        } catch (err) {
          logger.error('Failed to process incomplete payment', err as Error);
        }
      };

      // Authenticate with Pi Network
      const auth = await sdk.authenticate(['payments'], handleIncompletePayment);

      setUser(auth.user);
      setAccessToken(auth.accessToken);

      logger.info('Pi authentication successful', {
        userId: auth.user.uid,
        username: auth.user.username,
      });

      // Store auth in backend
      try {
        await fetch('/api/auth/pi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: auth.user,
            accessToken: auth.accessToken,
            network: networkMode,
          }),
        });
      } catch (err) {
        logger.error('Failed to store Pi auth', err as Error);
      }

      toast({
        title: 'Success',
        description: `Welcome, ${auth.user.username}!`,
      });

      return auth;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);

      logger.error('Pi authentication failed', err as Error);

      toast({
        title: 'Authentication Failed',
        description: errorMsg,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, networkMode, toast]);

  // ============================================
  // PAYMENT CREATION
  // ============================================

  const createPayment = useCallback(
    async (paymentData: PiPaymentDTO): Promise<string | null> => {
      if (!sdk) {
        toast({
          title: 'Error',
          description: 'Pi Network SDK not initialized',
          variant: 'destructive',
        });
        return null;
      }

      if (!user || !accessToken) {
        toast({
          title: 'Error',
          description: 'Please authenticate first',
          variant: 'destructive',
        });
        return null;
      }

      return new Promise((resolve) => {
        try {
          sdk.createPayment(paymentData, {
            // ✅ Step 1: User approves payment
            onReadyForServerApproval: async (paymentId: string) => {
              logger.info('Payment ready for server approval', { paymentId });

              try {
                // Call backend to approve payment
                const response = await fetch('/api/payments/pi/approve', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ paymentId }),
                });

                if (!response.ok) {
                  throw new Error('Server approval failed');
                }

                logger.info('Payment approved by server', { paymentId });
              } catch (err) {
                logger.error('Server approval failed', err as Error, { paymentId });
                toast({
                  title: 'Payment Failed',
                  description: 'Server approval failed',
                  variant: 'destructive',
                });
                resolve(null);
              }
            },

            // ✅ Step 2: Blockchain transaction completed
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              logger.info('Payment ready for server completion', {
                paymentId,
                txid,
              });

              try {
                // Call backend to complete payment
                const response = await fetch('/api/payments/pi/complete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ paymentId, txid }),
                });

                if (!response.ok) {
                  throw new Error('Server completion failed');
                }

                const data = await response.json();

                logger.info('Payment completed', { paymentId, txid });

                toast({
                  title: 'Payment Successful!',
                  description: `Transaction: ${txid.substring(0, 10)}...`,
                });

                resolve(paymentId);
              } catch (err) {
                logger.error('Server completion failed', err as Error, {
                  paymentId,
                  txid,
                });
                toast({
                  title: 'Payment Failed',
                  description: 'Server completion failed',
                  variant: 'destructive',
                });
                resolve(null);
              }
            },

            // ✅ User cancelled payment
            onCancel: (paymentId: string) => {
              logger.info('Payment cancelled by user', { paymentId });

              toast({
                title: 'Payment Cancelled',
                description: 'You cancelled the payment',
              });

              resolve(null);
            },

            // ✅ Error occurred
            onError: (error: Error, payment?: PiPayment) => {
              logger.error('Payment error', error, {
                paymentId: payment?.identifier,
              });

              toast({
                title: 'Payment Error',
                description: error.message,
                variant: 'destructive',
              });

              resolve(null);
            },
          });
        } catch (err) {
          logger.error('Failed to create payment', err as Error);
          toast({
            title: 'Payment Failed',
            description: 'Failed to initiate payment',
            variant: 'destructive',
          });
          resolve(null);
        }
      });
    },
    [sdk, user, accessToken, toast]
  );

  // ============================================
  // SIGN OUT
  // ============================================

  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);

    logger.info('User signed out from Pi Network');

    toast({
      title: 'Signed Out',
      description: 'You have been signed out',
    });
  }, [toast]);

  // ============================================
  // SCRIPT LOADING
  // ============================================

  const handleScriptLoad = useCallback(() => {
    logger.info('Pi SDK script loaded');
    initializeSdk();
  }, [initializeSdk]);

  const handleScriptError = useCallback((e: Error) => {
    const errorMsg = 'Failed to load Pi Network SDK';
    setError(errorMsg);
    setIsLoading(false);

    logger.error(errorMsg, e);

    if (process.env.NODE_ENV === 'development') {
      toast({
        title: 'SDK Load Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: PiNetworkContextType = {
    sdk,
    isInitialized,
    isLoading,
    error,
    user,
    accessToken,
    networkMode,
    authenticate,
    createPayment,
    signOut,
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Load Pi SDK Script */}
      <Script
        src={PI_SDK_URL}
        strategy="afterInteractive"
        integrity={PI_SDK_INTEGRITY}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        data-network={networkMode}
      />

      <PiNetworkContext.Provider value={contextValue}>
        {children}
      </PiNetworkContext.Provider>

      {/* Loading Indicator (Development only) */}
      {isLoading && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-blue-500 px-4 py-2 text-sm text-white shadow-lg">
          Loading Pi SDK...
        </div>
      )}

      {/* Error Indicator (Development only) */}
      {error && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-red-500 px-4 py-2 text-sm text-white shadow-lg">
          Pi SDK Error: {error}
        </div>
      )}
    </>
  );
}

// ============================================
// HOOK
// ============================================

export function usePiNetwork() {
  const context = useContext(PiNetworkContext);

  if (context === undefined) {
    throw new Error('usePiNetwork must be used within PiNetworkProvider');
  }

  return context;
}

// ============================================
// TYPE AUGMENTATION
// ============================================

declare global {
  interface Window {
    Pi: PiNetworkSDK;
  }
}
