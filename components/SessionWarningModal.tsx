"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { sessionUtils } from "@/lib/auth/sessionTimeout";

interface SessionWarningModalProps {
  isOpen: boolean;
  timeRemaining: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  isRefreshing?: boolean;
}

export function SessionWarningModal({
  isOpen,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
  isRefreshing = false,
}: SessionWarningModalProps) {
  const [displayTime, setDisplayTime] = useState("");

  // Update the displayed time every second
  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return;

    const updateTime = () => {
      setDisplayTime(sessionUtils.formatTimeRemaining(timeRemaining));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="p-6 shadow-2xl border-2 border-orange-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900">
                Session Expiring Soon
              </h2>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Your session will expire in{" "}
              <span className="font-mono font-bold text-orange-600 text-lg">
                {displayTime}
              </span>
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                To continue using the application, please choose an option below.
                If you don&apos;t act, you will be automatically logged out when your
                session expires.
              </p>
            </div>

            {/* Warning indicator */}
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {timeRemaining <= 60000
                  ? "Less than 1 minute remaining!"
                  : "Session timeout warning"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={onStayLoggedIn}
              disabled={isRefreshing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Stay Logged In
                </>
              )}
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout Now
            </Button>
          </div>

          {/* Auto-logout countdown */}
          {timeRemaining <= 30000 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-red-600 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Auto-logout in {displayTime}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Hook for managing the session warning modal
export function useSessionWarningModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showWarning = (time: number) => {
    setTimeRemaining(time);
    setIsOpen(true);
    setIsRefreshing(false);
  };

  const hideWarning = () => {
    setIsOpen(false);
    setTimeRemaining(0);
    setIsRefreshing(false);
  };

  const setRefreshing = (refreshing: boolean) => {
    setIsRefreshing(refreshing);
  };

  const updateTimeRemaining = (time: number) => {
    setTimeRemaining(time);
  };

  return {
    isOpen,
    timeRemaining,
    isRefreshing,
    showWarning,
    hideWarning,
    setRefreshing,
    updateTimeRemaining,
  };
}
