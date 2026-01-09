// apps/web/src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
// ============================================
// FONTS CONFIGURATION
// ============================================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});
// ============================================
// METADATA
// ============================================
export const metadata: Metadata = {
  title: {
    default: 'ForSale - Pi Network Marketplace',
    template: '%s | ForSale',
  },
  description: 'Buy and sell with confidence using Pi cryptocurrency. Secure escrow, AI-powered features, and global marketplace.',
  keywords: ['Pi Network', 'Marketplace', 'Cryptocurrency', 'Buy', 'Sell', 'Escrow', 'Blockchain'],
  authors: [{ name: 'ForSale Team' }],
  creator: 'ForSale',
  publisher: 'ForSale',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://forsale-production.up.railway.app',
    title: 'ForSale - Pi Network Marketplace',
    description: 'Buy and sell with confidence using Pi cryptocurrency',
    siteName: 'ForSale',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ForSale - Pi Network Marketplace',
    description: 'Buy and sell with confidence using Pi cryptocurrency',
    creator: '@forsale',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
// ============================================
// ROOT LAYOUT
// ============================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <head>
        {/* Pi Network SDK */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
        
        {/* Google Fonts Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
