import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import Script from 'next/script'; // Import Next.js Script component

// Internal components
import { PiNetworkProvider } from '@/components/providers/pi-network-provider';
import { SecurityProvider } from '@/components/providers/security-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Styles
import './globals.css';

// Fonts configuration
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

// Metadata setup
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://forsale.app';
const APP_NAME = 'Forsale';
const APP_DESCRIPTION = 'AI-Powered Global Marketplace on Pi Network';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - AI Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
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
        {/* Important: Load Pi Network SDK */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
        
        <link rel="preconnect" href="https://sdk.minepi.com" />
        <link rel="dns-prefetch" href="https://sdk.minepi.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
