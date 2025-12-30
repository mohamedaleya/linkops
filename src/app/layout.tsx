import './globals.css';
import { Outfit } from 'next/font/google';
import type React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { EncryptionProvider } from '@/context/EncryptionContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import CookieBanner from '@/components/CookieBanner';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://linkops.at'),
  title: {
    default: 'LinkOps - Advanced URL Shortener & Link Management',
    template: 'LinkOps - %s',
  },
  description:
    'LinkOps is a professional, fast, and secure URL management platform with deep analytics and team collaboration features.',
  keywords: [
    'url shortener',
    'link management',
    'analytics',
    'short links',
    'branded links',
  ],
  authors: [{ name: 'LinkOps Team' }],
  creator: 'LinkOps',
  publisher: 'LinkOps',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'LinkOps',
    title: 'LinkOps - Advanced URL Shortener & Link Management',
    description:
      'Professional URL shortening with deep analytics, custom slugs, and enterprise-grade performance.',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'LinkOps' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkOps - Advanced URL Shortener & Link Management',
    description: 'Professional URL shortening with deep analytics.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'LinkOps',
              url: 'https://linkops.at',
              description:
                'Professional URL shortening and link management platform.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} flex min-h-screen flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EncryptionProvider>
            <Header />
            <main className="relative flex-1">
              {/* Global Decorative Background */}
              <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-primary/5 blur-3xl [animation-delay:1s]" />

                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>
              {children}
            </main>
            <Footer />
            <SonnerToaster position="bottom-right" />
            <Toaster />
            <CookieBanner />
          </EncryptionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
