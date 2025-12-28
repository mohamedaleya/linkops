import './globals.css';
import { Outfit } from 'next/font/google';
import type React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import CookieBanner from '@/components/CookieBanner';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'LinkOps - Advanced URL Management & Analytics',
  description:
    'LinkOps is a professional, fast, and secure URL management platform with deep analytics and team collaboration features.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} flex min-h-screen flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="relative flex-1">
            {/* Global Decorative Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              {/* Gradient orbs */}
              <div className="bg-primary/10 absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
              <div className="bg-primary/5 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl [animation-delay:1s]" />

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
        </ThemeProvider>
      </body>
    </html>
  );
}
