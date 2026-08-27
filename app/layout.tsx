import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { ReduxProvider } from './providers/ReduxProvider';
import ThemeProvider from './providers/ThemeProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/common';
import { Header, Footer } from './components/layout';
import './globals.css';

const ToastProvider = dynamic(() => import('@/app/components/ui/ToastProvider'), { ssr: false });
// Font configuration
const inter = Inter({ subsets: ['latin'] });
// Viewport configuration for responsive design and theme color
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6D28D9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};
// Metadata configuration for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL('https://stellaraid.com'),
  title: {
    default: 'StellarAid | Blockchain Crowdfunding on Stellar Network',
    template: '%s | StellarAid',
  },
  description:
    'Blockchain-based crowdfunding platform on the Stellar Network. Support creators, artists, and entrepreneurs with transparent, decentralized fundraising.',
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
        alt: 'StellarAid - Blockchain Crowdfunding on Stellar Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StellarAid | Blockchain Crowdfunding on Stellar Network',
    description:
      'Blockchain-based crowdfunding platform on the Stellar Network. Support creators, artists, and entrepreneurs with transparent, decentralized fundraising.',
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
// Root layout component that wraps the entire application with global providers and layout components
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
