"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  isPageError?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

/**
 * Global ErrorBoundary component to catch and handle React component errors
 * Provides fallback UI and retry mechanism for recoverable errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service (if available)
    if (typeof window !== "undefined") {
      // @ts-ignore - Sentry might not be installed
      if (window.Sentry?.captureException) {
        // @ts-ignore
        window.Sentry.captureException(error, {
          extra: errorInfo,
        });
      }
    }

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = async (): Promise<void> => {
    this.setState({ isRetrying: true });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    });
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          isRetrying={this.state.isRetrying}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          isPageError={this.props.isPageError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  onRetry: () => void;
  onReset: () => void;
  isPageError?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  isRetrying,
  onRetry,
  onReset,
  isPageError = false,
}: ErrorFallbackProps) {
  // Determine if this is a recoverable error
  const isRecoverable = !isNetworkError(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isPageError ? "Page Error" : "Something went wrong"}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && errorInfo && (
          <details className="mb-6 text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
              {error?.stack || errorInfo.componentStack || "No stack trace available"}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isRecoverable && (
            <Button
              onClick={onRetry}
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
            onClick={onReset}
            variant="outline"
            className="inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Contact Support Link */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          If this problem persists, please{" "}
          <a
            href="mailto:support@stellaraid.org"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <Mail className="w-3 h-3" />
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Check if error is network-related (recoverable)
 */
function isNetworkError(error: Error | null): boolean {
  if (!error) return false;
  
  const networkErrorMessages = [
    "Failed to fetch",
    "Network request failed",
    "NetworkError",
    "net::ERR_INTERNET_DISCONNECTED",
    "net::ERR_NAME_NOT_RESOLVED",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "timeout",
  ];

  return networkErrorMessages.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundary;
}

export default ErrorBoundary;
