/**
 * Error Tracking Utility
 * Provides centralized error reporting with optional Sentry integration
 * Can be extended to support other error tracking services
 */

// Error tracking configuration
interface ErrorTrackingConfig {
  enabled: boolean;
  environment?: string;
  release?: string;
  sampleRate?: number;
}

interface ErrorContext {
  [key: string]: unknown;
}

interface Breadcrumb {
  category: string;
  message: string;
  level?: "info" | "warning" | "error";
  data?: Record<string, unknown>;
}

// Configuration store
let config: ErrorTrackingConfig = {
  enabled: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === "true",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_ERROR_SAMPLE_RATE || "1"),
};

// Initialize error tracking (call this in app initialization)
export function initErrorTracking(customConfig?: Partial<ErrorTrackingConfig>): void {
  if (customConfig) {
    config = { ...config, ...customConfig };
  }

  // Setup global error handlers if enabled
  if (config.enabled) {
    setupGlobalErrorHandlers();
    
    // Initialize Sentry if available
    initSentry();
  }
}

/**
 * Setup global error handlers for uncaught errors and unhandled promise rejections
 */
function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  // Handle uncaught errors
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    const errorObj = error || new Error(String(message));
    
    captureException(errorObj, {
      type: "uncaught-error",
      source,
      lineno,
      colno,
    });

    // Don't prevent default in development for easier debugging
    return process.env.NODE_ENV !== "development";
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));

    captureException(error, {
      type: "unhandled-promise-rejection",
    });
  };

  console.log("[ErrorTracking] Global error handlers initialized");
}

/**
 * Initialize Sentry if available and configured
 */
async function initSentry(): Promise<void> {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDsn) {
    console.log("[ErrorTracking] Sentry DSN not configured, skipping Sentry init");
    return;
  }

  try {
    // Dynamic require to avoid compile-time dependency
    // @ts-ignore - Module may not be installed
    let sentryModule: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sentryModule = require("@sentry/nextjs");
    } catch {
      console.log("[ErrorTracking] @sentry/nextjs not installed, skipping Sentry initialization");
      return;
    }
    
    if (!sentryModule || typeof sentryModule !== 'object') {
      console.log("[ErrorTracking] Sentry module invalid, skipping initialization");
      return;
    }
    
    const Sentry = sentryModule as {
      init?: (config: Record<string, unknown>) => Promise<void>;
      browserTracingIntegration?: () => unknown;
      replayIntegration?: (options: { maskAllText: boolean; blockAllMedia: boolean }) => unknown;
    };
    
    if (!Sentry.init) {
      console.log("[ErrorTracking] Sentry.init not found, skipping initialization");
      return;
    }
    
    const integrations: unknown[] = [];
    
    if (Sentry.browserTracingIntegration) {
      integrations.push(Sentry.browserTracingIntegration());
    }
    if (Sentry.replayIntegration) {
      integrations.push(Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }));
    }
    
    await Sentry.init({
      dsn: sentryDsn,
      environment: config.environment,
      release: config.release,
      sampleRate: config.sampleRate,
      integrations,
      tracesSampleRate: config.sampleRate,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    console.log("[ErrorTracking] Sentry initialized successfully");
  } catch (error) {
    console.log("[ErrorTracking] Sentry not available, skipping initialization");
  }
}

/**
 * Capture and report an exception
 */
export function captureException(
  error: Error,
  context?: ErrorContext
): void {
  if (!config.enabled) {
    console.error("[ErrorTracking] Error (tracking disabled):", error, context);
    return;
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[ErrorTracking] Captured error:", error, context);
  }

  // Report to Sentry if available
  if (typeof window !== "undefined") {
    // @ts-ignore - Sentry might not be installed
    if (window.Sentry?.captureException) {
      // @ts-ignore
      window.Sentry.captureException(error, {
        extra: context,
      });
    }
  }
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext
): void {
  if (!config.enabled) {
    console.log(`[ErrorTracking] Message (tracking disabled): ${message}`, context);
    return;
  }

  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.Sentry?.captureMessage) {
      // @ts-ignore
      window.Sentry.captureMessage(message, level, {
        extra: context,
      });
    }
  }
}

/**
 * Add breadcrumb for user actions
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  if (!config.enabled) return;

  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.Sentry?.addBreadcrumb) {
      // @ts-ignore
      window.Sentry.addBreadcrumb({
        category: breadcrumb.category,
        message: breadcrumb.message,
        level: breadcrumb.level || "info",
        data: breadcrumb.data,
      });
    }
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string } | null): void {
  if (!config.enabled) return;

  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.Sentry?.setUser) {
      // @ts-ignore
      window.Sentry.setUser(user);
    }
  }
}

/**
 * Set extra context for error tracking
 */
export function setExtraContext(context: ErrorContext): void {
  if (!config.enabled) return;

  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.Sentry?.setExtra) {
      Object.entries(context).forEach(([key, value]) => {
        // @ts-ignore
        window.Sentry.setExtra(key, value);
      });
    }
  }
}

/**
 * Create a retry wrapper for async functions with exponential backoff
 */
export function createRetryableFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): T {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args) as ReturnType<T>;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on non-recoverable errors
        if (!isRetryableError(lastError)) {
          throw lastError;
        }

        // Last attempt - throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Wait with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Increase delay for next attempt
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError!;
  }) as T;
}

/**
 * Check if an error is retryable (network-related)
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    "failed to fetch",
    "network request failed",
    "econnrefused",
    "etimedout",
    "timeout",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "network error",
  ];

  const message = error.message.toLowerCase();
  return retryableMessages.some((msg) => message.includes(msg));
}

/**
 * Type declaration for window.Sentry (for TypeScript)
 */
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: ErrorContext) => void;
      captureMessage: (message: string, level?: string, context?: ErrorContext) => void;
      addBreadcrumb: (breadcrumb: Breadcrumb) => void;
      setUser: (user: { id: string; email?: string; username?: string } | null) => void;
      setExtra: (key: string, value: unknown) => void;
      browserTracingIntegration?: () => unknown;
      replayIntegration?: (options: { maskAllText: boolean; blockAllMedia: boolean }) => unknown;
    };
  }
}

export default {
  initErrorTracking,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  setExtraContext,
  createRetryableFunction,
  isRetryableError,
};
