import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from './providers/ReduxProvider';
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
  title: {
    default: 'Lumora',
    template: '%s | Lumora',
  },
  description:
    'Blockchain-based crowdfunding on the Stellar Network. Empowering creators and changemakers worldwide.',
  keywords: ['crowdfunding', 'stellar', 'blockchain', 'web3', 'fundraising'],
  openGraph: {
    title: 'Lumora',
    description: 'Blockchain-based crowdfunding on the Stellar Network',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ErrorBoundary>
            <Header />
            {children}
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                // StellarAid theme styling
                success: {
                  style: {
                    background: '#10b981', // emerald-500
                    color: '#ffffff',
                    fontWeight: '500',
                    borderRadius: '8px',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444', // red-500
                    color: '#ffffff',
                    fontWeight: '500',
                    borderRadius: '8px',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                },
                loading: {
                  style: {
                    background: '#3b82f6', // blue-500
                    color: '#ffffff',
                    fontWeight: '500',
                    borderRadius: '8px',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                },
                // Default style for info toasts
                style: {
                  background: '#0ea5e9', // sky-500
                  color: '#ffffff',
                  fontWeight: '500',
                  borderRadius: '8px',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '12px 16px',
                  fontSize: '14px',
                  maxWidth: '400px',
                },
                duration: 4000,
              }}
            />
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}
