import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundaryProvider } from "@/components/ErrorBoundaryProvider";
import { ToastProvider } from "@/components/ui";
import React, { Suspense } from "react";
import GlobalLoading from "@/components/GlobalLoading";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "StellarAid - Transparent Blockchain-Based Aid Platform",
    template: "%s | StellarAid"
  },
  description: "Connect donors with verified aid projects worldwide using Stellar blockchain for transparent, low-fee charitable giving. Make a real impact with every donation.",
  keywords: ["charity", "donations", "blockchain", "aid", "philanthropy", "Stellar", "transparent giving"],
  authors: [{ name: "StellarAid Team" }],
  creator: "StellarAid",
  publisher: "StellarAid",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://stellaraid.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'StellarAid - Transparent Blockchain-Based Aid Platform',
    description: 'Connect donors with verified aid projects worldwide using Stellar blockchain for transparent, low-fee charitable giving.',
    siteName: 'StellarAid',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StellarAid - Transparent Aid Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StellarAid - Transparent Blockchain-Based Aid Platform',
    description: 'Connect donors with verified aid projects worldwide using Stellar blockchain for transparent, low-fee charitable giving.',
    images: ['/og-image.jpg'],
    creator: '@stellaraid',
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
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StellarAid',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://stellaraid.com',
      logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://stellaraid.com'}/logo.png`,
      description: 'Transparent blockchain-based aid platform connecting donors with verified projects worldwide.',
      sameAs: [
        'https://twitter.com/stellaraid',
        'https://linkedin.com/company/stellaraid',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@stellaraid.com',
      },
    }),
  },
};

import NextAuthProvider from "@/components/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundaryProvider>
            <ToastProvider position="top-right" maxToasts={5}>
              <GlobalLoadingOverlay />
              <Suspense fallback={<GlobalLoading message="Loading..." />}>{children}</Suspense>
            </ToastProvider>
          </ErrorBoundaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
