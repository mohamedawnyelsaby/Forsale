import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'ForSale - Pi Marketplace',
  description: 'Buy and sell using Pi Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
