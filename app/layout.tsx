import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ReduxProvider } from './providers/ReduxProvider';
import ToastProvider from '@/app/components/ui/ToastProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/common';
import { Header, Footer } from './components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6D28D9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://stellaraid.com'),
  title: {
    default: "StellarAid | Blockchain Crowdfunding on Stellar Network",
    template: "%s | StellarAid"
  },
  description: "Blockchain-based crowdfunding platform on the Stellar Network. Support creators, artists, and entrepreneurs with transparent, decentralized fundraising.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stellaraid.com/',
    siteName: 'StellarAid',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StellarAid - Blockchain Crowdfunding on Stellar Network'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "StellarAid | Blockchain Crowdfunding on Stellar Network",
    description: "Blockchain-based crowdfunding platform on the Stellar Network. Support creators, artists, and entrepreneurs with transparent, decentralized fundraising.",
    images: ['/og-image.jpg'],
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <a 
          href="#main-content" 
          className="skip-to-content"
        >
          Skip to main content
        </a>
        <ReduxProvider>
          <QueryProvider>
          <ErrorBoundary>
            <Header />
            {children}
            <Footer />
            <ToastProvider />
          </ErrorBoundary>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
