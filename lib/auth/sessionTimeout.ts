"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";

// Session timeout configuration
const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export interface SessionTimeoutOptions {
  onWarning?: (timeRemaining: number) => void;
  onExpired?: () => void;
  onRefreshSuccess?: () => void;
  onRefreshFailure?: (error: unknown) => void;
  warningThreshold?: number;
  checkInterval?: number;
}

export interface SessionTimeoutState {
  isWarning: boolean;
  timeRemaining: number;
  isRefreshing: boolean;
}

// JWT token utilities
const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }
    const payload = JSON.parse(atob(payloadSegment));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Invalid token format:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true;
  
  return Date.now() >= expirationTime;
};

const getTimeRemaining = (token: string): number => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return 0;
  
  return Math.max(0, expirationTime - Date.now());
};

// Session timeout hook
export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const {
    onWarning,
    onExpired,
    onRefreshSuccess,
    onRefreshFailure,
    warningThreshold = WARNING_THRESHOLD,
    checkInterval = CHECK_INTERVAL,
  } = options;

  const { token, refreshToken: storedRefreshToken, login, logout } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Clear all timeouts and intervals
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  // Handle session expiration
  const handleExpiration = useCallback(async () => {
    cleanup();
    
    // Try to refresh the token first
    if (!isRefreshingRef.current && storedRefreshToken) {
      isRefreshingRef.current = true;
      
      try {
        const response = await authApi.refreshToken();
        
        if (response.status === 200 && response.data) {
          // Update auth store with new token
          login(response.data.user, response.data.token, response.data.refreshToken);
          onRefreshSuccess?.();
          return; // Don't logout if refresh succeeded
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        onRefreshFailure?.(error);
      } finally {
        isRefreshingRef.current = false;
      }
    }
    
    // If refresh failed or wasn't attempted, logout
    logout();
    onExpired?.();
  }, [cleanup, storedRefreshToken, login, logout, onExpired, onRefreshSuccess, onRefreshFailure]);

  // Manual refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!token || !storedRefreshToken || isRefreshingRef.current) return false;
    
    isRefreshingRef.current = true;
    
    try {
      const response = await authApi.refreshToken();
      
      if (response.status === 200 && response.data) {
        login(response.data.user, response.data.token, response.data.refreshToken);
        onRefreshSuccess?.();
        return true;
      }
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      onRefreshFailure?.(error);
    } finally {
      isRefreshingRef.current = false;
    }
    
    return false;
  }, [token, storedRefreshToken, login, onRefreshSuccess, onRefreshFailure]);

  // Start monitoring session
  const startMonitoring = useCallback(() => {
    if (!token) return;
    
    cleanup();
    
    // Check token immediately
    if (isTokenExpired(token)) {
      handleExpiration();
      return;
    }
    
    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      if (!token) {
        cleanup();
        return;
      }
      
      const timeRemaining = getTimeRemaining(token);
      
      if (timeRemaining === 0) {
        handleExpiration();
        return;
      }
      
      // Show warning when approaching expiration
      if (timeRemaining <= warningThreshold && !warningTimeoutRef.current) {
        onWarning?.(timeRemaining);
        
        // Set timeout for actual expiration
        warningTimeoutRef.current = setTimeout(() => {
          handleExpiration();
        }, timeRemaining);
      }
    }, checkInterval);
  }, [token, cleanup, handleExpiration, onWarning, warningThreshold, checkInterval]);

  // Effect to manage session monitoring
  useEffect(() => {
    if (token) {
      startMonitoring();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [token, startMonitoring, cleanup]);

  // Get current session state
  const getSessionState = useCallback((): SessionTimeoutState => {
    if (!token) {
      return {
        isWarning: false,
        timeRemaining: 0,
        isRefreshing: isRefreshingRef.current,
      };
    }
    
    const timeRemaining = getTimeRemaining(token);
    
    return {
      isWarning: timeRemaining > 0 && timeRemaining <= warningThreshold,
      timeRemaining,
      isRefreshing: isRefreshingRef.current,
    };
  }, [token, warningThreshold]);

  return {
    refreshToken,
    getSessionState,
    cleanup,
  };
}

// Utility functions for external use
export const sessionUtils = {
  getTokenExpirationTime,
  isTokenExpired,
  getTimeRemaining,
  formatTimeRemaining: (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
};
