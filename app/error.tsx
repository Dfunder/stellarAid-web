'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  AlertTriangle,
  Home,
  Search,
  RefreshCw,
  ArrowLeft,
  Bug,
  Zap,
  Wifi,
  WifiOff,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

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

  // Log error for monitoring
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isNetworkError = error.message.toLowerCase().includes('network') ||
                        error.message.toLowerCase().includes('fetch');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Error Illustration */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900 rounded-full animate-pulse"></div>
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

        {/* Error Message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {isNetworkError
              ? "We're having trouble connecting. Please check your internet connection and try again."
              : "We encountered an unexpected error. Our team has been notified and is working to fix it."
            }
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border-red-200 dark:border-red-800">
              <details className="text-left">
                <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Message:</strong> {error.message}</p>
                  {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                  <p><strong>Stack:</strong></p>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              </details>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
            variant="primary"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Search Section */}
        <Card className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Can't find what you're looking for? Try searching our project directory.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </form>
        </Card>

        {/* Helpful Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            What would you like to do?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {helpfulLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <link.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            If this problem persists, please{' '}
            <Link
              href="/about"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              contact our support team
            </Link>
            {' '}with details about what you were doing when this error occurred.
          </p>
        </div>
      </div>
    </div>
  );
}"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, RefreshCw, Home, Mail, Bug, Search, ArrowRight, Heart, Users, Globe } from "lucide-react";

// Type definitions for Next.js error boundary
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router Error Page
 * This component is rendered when an error occurs in a route segment
 * It receives the error object and a reset function to attempt recovery
 */
export default function Error({ error, reset }: ErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Log error to tracking service on mount
  useEffect(() => {
    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== "undefined") {
      // @ts-ignore - Sentry might not be installed
      if (window.Sentry?.captureException) {
        // @ts-ignore
        window.Sentry.captureException(error, {
          tags: {
            type: "page-error",
            route: window.location.pathname,
            userAgent: navigator.userAgent,
          },
          extra: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
          },
        });
      }

      // Also log to console with structured data
      console.error("🚨 Page Error:", {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Send to custom error tracking service
      logErrorToService(error);
    }
  }, [error]);

  // Custom error logging function
  const logErrorToService = async (error: Error) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
      };

      // In a real app, this would send to your monitoring service
      // For now, we'll just log it (you can replace with actual service)
      console.log("📊 Error logged to monitoring service:", errorData);

      // Example: Send to your API endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // });
    } catch (loggingError) {
      console.error("❌ Failed to log error:", loggingError);
    }
  };

  // Handle retry with loading state
  const handleRetry = async () => {
    setIsRetrying(true);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    reset();
    setIsRetrying(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Determine if this is a network error (recoverable)
  const isNetworkError = checkIsNetworkError(error);
  const isRecoverable = !isNetworkError || error.message.includes("fetch");

  const helpfulLinks = [
    { href: "/explore", label: "Browse Projects", icon: Search, description: "Find projects to support" },
    { href: "/about", label: "About Us", icon: Users, description: "Learn about our mission" },
    { href: "/dashboard", label: "Dashboard", icon: Heart, description: "Manage your donations" },
    { href: "/privacy", label: "Help Center", icon: Globe, description: "Get help and support" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Illustration */}
        <div className="relative mb-8">
          <div className="mx-auto w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
          {/* Floating error indicators */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-destructive/20 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Error Title */}
        <h1 className="text-5xl font-bold text-destructive mb-2">Oops!</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Something went wrong
        </h2>

        {/* Friendly Error Message */}
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          We encountered an unexpected error. Our team has been notified and is working to fix it.
          In the meantime, try refreshing the page or explore other parts of our site.
        </p>

        {/* Error Digest (if available) */}
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: <code className="bg-muted px-2 py-1 rounded text-xs">{error.digest}</code>
          </p>
        )}

        {/* Search Functionality */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {isRecoverable && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </Button>
          )}

          <Link href="/">
            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">While you&apos;re here</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {helpfulLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Error Classification */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-foreground">
            {isNetworkError ? (
              <>
                <strong className="text-warning">Network Error:</strong> Please check your internet connection and try again.
                If the problem persists, our servers might be experiencing issues.
              </>
            ) : (
              <>
                <strong className="text-destructive">Application Error:</strong> This is on our end. Our technical team has been automatically notified
                and is working to resolve this issue.
              </>
            )}
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-primary hover:underline flex items-center justify-center gap-1 mx-auto mb-4"
            >
              <Bug className="w-4 h-4" />
              {showDetails ? "Hide" : "Show"} error details
            </button>

            {showDetails && (
              <div className="text-left bg-muted rounded-lg p-4 max-h-48 overflow-auto">
                <pre className="text-xs text-destructive whitespace-pre-wrap">
                  {error.stack || "No stack trace available"}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground mb-2">
            Need immediate help?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@stellaraid.org"
              className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
            <span className="text-muted-foreground hidden sm:block">•</span>
            <a
              href="https://discord.gg/stellaraid"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
            >
              <Users className="w-4 h-4" />
              Join Discord Community
            </a>
          </div>
        </div>

        {/* Fun Recovery Message */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            "Errors are just unexpected features waiting to be discovered." - Anonymous Developer
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Thanks for your patience while we fix this! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

  // Determine if this is a network error (recoverable)
  const isNetworkError = checkIsNetworkError(error);
  const isRecoverable = !isNetworkError || error.message.includes("fetch");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>

        {/* Error Digest (if available) */}
        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Bug className="w-4 h-4" />
              {showDetails ? "Hide" : "Show"} error details
            </button>
            
            {showDetails && (
              <div className="mt-2 text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-auto">
                <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
                  {error.stack || "No stack trace available"}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isRecoverable && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Error Classification */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {isNetworkError ? (
              <>
                <strong>Network Error:</strong> Please check your internet connection and try again.
              </>
            ) : (
              <>
                <strong>Application Error:</strong> Our team has been notified. If this persists, please contact support.
              </>
            )}
          </p>
        </div>

        {/* Contact Support */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          Need help?{" "}
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
  );
}

/**
 * Check if the error is network-related
 */
function checkIsNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    "failed to fetch",
    "network request failed",
    "networkerror",
    "err_internet_disconnected",
    "err_name_not_resolved",
    "econnrefused",
    "etimedout",
    "timeout",
    "fetch failed",
  ];

  const message = error.message.toLowerCase();
  return networkErrorMessages.some((msg) => message.includes(msg));
}
