'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bug,
  ChevronRight,
  ExternalLink,
  Home,
  Mail,
  RefreshCw,
  Search,
  WifiOff,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

interface HelpfulLink {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

const helpfulLinks: HelpfulLink[] = [
  {
    title: 'Go Home',
    description: 'Return to the main page',
    href: '/',
    icon: Home,
  },
  {
    title: 'Explore Projects',
    description: 'Browse available projects',
    href: '/explore',
    icon: Search,
  },
  {
    title: 'Dashboard',
    description: 'Access your dashboard',
    href: '/dashboard',
    icon: Zap,
  },
  {
    title: 'Help Center',
    description: 'Get help and support',
    href: '/about',
    icon: ExternalLink,
    external: true,
  },
];

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await reset();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/explore?q=${encodeURIComponent(query)}`;
    }
  };

  const isNetworkError = checkIsNetworkError(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full">
                {isNetworkError ? (
                  <WifiOff className="w-16 h-16 text-red-600 dark:text-red-400" />
                ) : (
                  <Bug className="w-16 h-16 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {isNetworkError
              ? 'We are having trouble connecting. Please check your internet connection and try again.'
              : 'We encountered an unexpected error. Our team has been notified and is working to fix it.'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border-red-200 dark:border-red-800">
              <details className="text-left">
                <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p>
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  <p>
                    <strong>Stack:</strong>
                  </p>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              </details>
            </Card>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
            variant="primary"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>

          <Link href="/" className="inline-flex">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Cannot find what you are looking for? Try searching our project directory.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            What would you like to do?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {helpfulLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            If this problem persists, please{' '}
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
              contact our support team
            </Link>{' '}
            with details about what you were doing when this error occurred.
          </p>
          <p className="mt-4">
            Need immediate help?{' '}
            <a
              href="mailto:support@stellaraid.org"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function checkIsNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'failed to fetch',
    'network request failed',
    'networkerror',
    'err_internet_disconnected',
    'err_name_not_resolved',
    'econnrefused',
    'etimedout',
    'timeout',
    'fetch failed',
  ];

  const message = error.message.toLowerCase();
  return networkErrorMessages.some((entry) => message.includes(entry));
}
