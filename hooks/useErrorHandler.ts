"use client";

import { useState, useCallback } from "react";
import { captureException, isRetryableError } from "@/lib/errorTracking";

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Custom hook for handling async operations with error boundary integration
 * Provides retry mechanism for recoverable errors
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let lastError: Error;
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        const data = await asyncFn();
        
        setState({
          data,
          isLoading: false,
          error: null,
          retryCount: currentRetry,
        });

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if error is recoverable
        if (!isRetryableError(lastError) || currentRetry === maxRetries) {
          // Non-recoverable error or max retries reached
          setState({
            data: null,
            isLoading: false,
            error: lastError,
            retryCount: currentRetry,
          });

          // Report to error tracking
          captureException(lastError, {
            retryCount: currentRetry,
            maxRetries,
          });

          if (onError) {
            onError(lastError);
          }

          return null;
        }

        // Retryable error - wait before retrying
        currentRetry++;
        setState((prev) => ({ ...prev, retryCount: currentRetry }));

        // Wait with linear backoff
        await new Promise((resolve) => setTimeout(resolve, retryDelay * currentRetry));
      }
    }

    return null;
  }, [asyncFn, maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      retryCount: 0,
    });
  }, []);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...state,
    execute,
    retry,
    reset,
    isRetrying: state.retryCount > 0 && state.isLoading,
  };
}

/**
 * Hook for handling component-level errors
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error | unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    
    // Report to error tracking
    captureException(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
}

export default useAsync;
