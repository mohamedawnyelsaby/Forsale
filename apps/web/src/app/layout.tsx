// File: apps/web/src/app/layout.tsx
// Root Layout - Main Application Wrapper

import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import Script from 'next/script';

// Internal components
import { PiNetworkProvider } from '@/components/providers/pi-network-provider';
import { SecurityProvider } from '@/components/providers/security-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Styles
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Forsale - AI Marketplace',
  description: 'AI-Powered Global Marketplace on Pi Network',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* 
          CRITICAL: Load Pi SDK BEFORE any React components render
          This ensures Pi object is available when PiNetworkProvider initializes
        */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive"
        />
      </head>
      
      <body className="min-h-screen bg-background font-sans antialiased">
        <SecurityProvider nonce={nonce}>
          <PiNetworkProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
          </PiNetworkProvider>
        </SecurityProvider>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
