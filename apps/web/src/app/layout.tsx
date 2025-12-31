/**
 * FORSALE ROOT LAYOUT - UPDATED WITH HEADER & FOOTER
 * apps/web/src/app/layout.tsx
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';

// Internal components
import { PiNetworkProvider } from '@/components/providers/pi-network-provider';
import { SecurityProvider } from '@/components/providers/security-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Styles
import './globals.css';

// Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

// Metadata
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://forsale.app';
const APP_NAME = 'Forsale';
const APP_DESCRIPTION = 'AI-Powered Global Marketplace on Pi Network - Buy and sell securely with cryptocurrency';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - AI-Powered Global Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    'marketplace',
    'pi network',
    'cryptocurrency',
    'e-commerce',
    'AI shopping',
    'global marketplace',
    'buy sell online',
    'secure payments',
    'blockchain marketplace',
  ],
  authors: [{ name: 'Forsale Team', url: APP_URL }],
  creator: 'Forsale',
  publisher: 'Forsale',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: `${APP_NAME} - AI-Powered Global Marketplace`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@forsale_app',
    creator: '@forsale_app',
    title: `${APP_NAME} - AI-Powered Global Marketplace`,
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
  },
  manifest: '/manifest.json',
  category: 'E-commerce',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://sdk.minepi.com" />
        <link rel="dns-prefetch" href="https://sdk.minepi.com" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      </head>
      
      <body className="min-h-screen bg-background font-sans antialiased">
        <SecurityProvider nonce={nonce}>
          <PiNetworkProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Header */}
              <Header />

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Footer */}
              <Footer />
            </div>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
              expand={false}
              pauseWhenPageIsHidden
            />
          </PiNetworkProvider>
        </SecurityProvider>
        
        {/* Development indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-0 left-0 z-50 rounded-tr bg-black/80 px-3 py-1 text-xs text-white">
            DEV MODE
          </div>
        )}
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
