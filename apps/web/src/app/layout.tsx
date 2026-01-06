// apps/web/src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    url: 'https://forsale.com',
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
        {/* Global Background with Stars Animation */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="stars-container" id="starsContainer"></div>
        </div>

        {/* Header - Appears on all pages */}
        <Header />

        {/* Main Content */}
        <main className="min-h-[calc(100vh-200px)]">
          {children}
        </main>

        {/* Footer - Appears on all pages */}
        <Footer />

        {/* Background Stars Animation Script */}
        <Script id="stars-animation" strategy="afterInteractive">
          {`
            (function() {
              const container = document.getElementById('starsContainer');
              if (!container || container.children.length > 0) return;
              
              for (let i = 0; i < 150; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.cssText = \`
                  position: absolute;
                  width: 2px;
                  height: 2px;
                  background: white;
                  border-radius: 50%;
                  left: \${Math.random() * 100}%;
                  top: \${Math.random() * 100}%;
                  animation: twinkle \${2 + Math.random() * 3}s infinite;
                  animation-delay: \${Math.random() * 3}s;
                \`;
                container.appendChild(star);
              }
            })();
          `}
        </Script>

        {/* Global Styles */}
        <style jsx global>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }

          .stars-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          /* Smooth Scroll */
          html {
            scroll-behavior: smooth;
          }

          /* Selection Colors */
          ::selection {
            background-color: rgba(16, 185, 129, 0.3);
            color: white;
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.5);
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 185, 129, 0.8);
          }
        `}</style>
      </body>
    </html>
  );
}
