"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSessionTimeout } from "@/lib/auth/sessionTimeout";
import { SessionWarningModal, useSessionWarningModal } from "./SessionWarningModal";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  const router = useRouter();
  const { token, refreshToken: storedRefreshToken, login, logout } = useAuthStore();
  const {
    isOpen,
    timeRemaining,
    isRefreshing,
    showWarning,
    hideWarning,
    setRefreshing,
    updateTimeRemaining,
  } = useSessionWarningModal();

  // Utility function to show logout notifications
  const showLogoutNotification = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    if (typeof window !== "undefined") {
      // Create a simple notification (you can replace this with your preferred notification system)
      const notification = document.createElement("div");
      notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === "success" ? "bg-green-500 text-white" :
        type === "error" ? "bg-red-500 text-white" :
        type === "warning" ? "bg-orange-500 text-white" :
        "bg-blue-500 text-white"
      }`;
      notification.innerHTML = `
        <div class="flex items-center">
          <span class="mr-2">${
            type === "success" ? "✓" :
            type === "error" ? "✕" :
            type === "warning" ? "⚠" :
            "ℹ"
          }</span>
          <span>${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }, []);

  // Handle session timeout events
  const handleSessionWarning = useCallback((remainingTime: number) => {
    showWarning(remainingTime);
  }, [showWarning]);

  const handleSessionExpired = useCallback(() => {
    hideWarning();
    
    // Clear any stored session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      sessionStorage.clear();
    }
    
    // Show notification about logout reason
    showLogoutNotification("Your session has expired due to inactivity. Please log in again.");
    
    // Redirect to login page
    router.push("/auth/login");
  }, [hideWarning, router, showLogoutNotification]);

  const handleRefreshSuccess = useCallback(() => {
    hideWarning();
    showLogoutNotification("Your session has been extended successfully.", "success");
  }, [hideWarning, showLogoutNotification]);

  const handleRefreshFailure = useCallback((error: any) => {
    console.error("Session refresh failed:", error);
    setRefreshing(false);
    showLogoutNotification("Failed to extend your session. You will be logged out soon.");
  }, [setRefreshing, showLogoutNotification]);

  // Initialize session timeout monitoring
  const { refreshToken, getSessionState } = useSessionTimeout({
    onWarning: handleSessionWarning,
    onExpired: handleSessionExpired,
    onRefreshSuccess: handleRefreshSuccess,
    onRefreshFailure: handleRefreshFailure,
    warningThreshold: 5 * 60 * 1000, // 5 minutes
    checkInterval: 30 * 1000, // Check every 30 seconds
  });

  // Handle "Stay Logged In" button click
  const handleStayLoggedIn = useCallback(async () => {
    setRefreshing(true);
    
    try {
      const success = await refreshToken();
      if (!success) {
        showLogoutNotification("Failed to extend session. Please try again.");
      }
    } catch (error) {
      console.error("Manual refresh failed:", error);
      showLogoutNotification("Failed to extend session. You will be logged out.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken, setRefreshing, showLogoutNotification]);

  // Handle manual logout
  const handleLogout = useCallback(async () => {
    try {
      // Call logout API to invalidate server session
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always perform client-side logout regardless of API success
      hideWarning();
      logout();
      
      // Clear session data
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        sessionStorage.clear();
      }
      
      showLogoutNotification("You have been logged out successfully.");
      router.push("/auth/login");
    }
  }, [hideWarning, logout, router, showLogoutNotification]);

  // Update time remaining in modal
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const state = getSessionState();
        updateTimeRemaining(state.timeRemaining);
        
        // Auto-close if session is no longer in warning state
        if (!state.isWarning) {
          hideWarning();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, getSessionState, updateTimeRemaining, hideWarning]);

  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={isOpen}
        timeRemaining={timeRemaining}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
        isRefreshing={isRefreshing}
      />
    </>
  );
}

// Export a hook for accessing session manager functionality
export function useSessionManager() {
  const { getSessionState } = useSessionTimeout({
    warningThreshold: 5 * 60 * 1000,
    checkInterval: 30 * 1000,
  });

  return {
    getSessionState,
  };
}
