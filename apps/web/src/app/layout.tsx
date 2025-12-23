// FORSALE WEB APP - ROOT LAYOUT - COMPLETE
// Copy to: apps/web/src/app/layout.tsx

import { Inter, Space_Grotesk } from 'next/font/google';
import { Metadata } from 'next';
import { Toaster } from 'sonner';
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
  title: 'Forsale - AI-Powered Global Marketplace',
  description: 'Buy and sell globally with AI assistance on Pi Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          async
          src="https://sdk.minepi.com/pi-sdk.js"
          data-network={process.env.PI_NETWORK_MODE || 'testnet'}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
