"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from "lucide-react";

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
          },
        });
      }
    }

    console.error("Page error:", error);
  }, [error]);

  // Handle retry with loading state
  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    reset();
    setIsRetrying(false);
  };

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
