"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, HTMLAttributes, ForwardRefRenderFunction, forwardRef } from "react";

/** Toast types */
export type ToastType = "success" | "error" | "warning" | "info";

/** Toast positions */
export type ToastPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right";

/** Toast duration options */
export type ToastDuration = "short" | "medium" | "long" | "persistent";

/** Individual toast props */
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: ToastDuration;
  onClose: (id: string) => void;
  isClosable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Toast context types */
export interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

/** Duration mappings in milliseconds */
const durationMap: Record<ToastDuration, number | null> = {
  short: 3000,
  medium: 5000,
  long: 8000,
  persistent: null,
};

/** Toast icon components */
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/** Border color classes */
const typeClasses: Record<ToastType, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  warning: "border-l-yellow-500",
  info: "border-l-blue-500",
};

/** Background classes */
const bgClasses: Record<ToastType, string> = {
  success: "bg-green-50 dark:bg-green-900/20",
  error: "bg-red-50 dark:bg-red-900/20",
  warning: "bg-yellow-50 dark:bg-yellow-900/20",
  info: "bg-blue-50 dark:bg-blue-900/20",
};

/** Generate unique ID */
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/** Create toast context */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** Toast hook */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

/** Toast provider props */
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

/** Toast provider component */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastProps, "id" | "onClose">): string => {
      const id = generateId();
      const newToast: ToastProps = {
        ...toast,
        id,
        onClose: (toastId: string) => removeToast(toastId),
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const createTypeToast = useCallback(
    (type: ToastType) => (message: string, title?: string) => {
      return addToast({ type, message, title });
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success: createTypeToast("success"),
    error: createTypeToast("error"),
    warning: createTypeToast("warning"),
    info: createTypeToast("info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position={position} toasts={toasts} />
    </ToastContext.Provider>
  );
};

/** Toast container props */
interface ToastContainerProps {
  position: ToastPosition;
  toasts: ToastProps[];
}

/** Toast container component */
const ToastContainer: React.FC<ToastContainerProps> = ({ position, toasts }) => {
  const positionClasses: Record<ToastPosition, string> = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
};

/** Individual toast item */
const ToastItem = forwardRef<HTMLDivElement, ToastProps>(function ToastItem(
  { id, type = "info", title, message, duration = "medium", onClose, isClosable = true, action, className = "", ...props },
  ref
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Handle animation on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Handle auto-dismiss
  useEffect(() => {
    const dismissTime = durationMap[duration];
    if (dismissTime) {
      const timer = setTimeout(() => {
        handleClose();
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  return (
    <div
      ref={ref}
      className={`
        pointer-events-auto
        transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        ${typeClasses[type]}
        bg-white dark:bg-gray-800 
        border-l-4 
        rounded-lg shadow-lg 
        overflow-hidden
        ${className}
      `}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      {...props}
    >
      <div className={`p-4 ${bgClasses[type]}`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">{icons[type]}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </p>
            )}
            <p className={`text-sm ${title ? "mt-1" : ""} text-gray-700 dark:text-gray-300`}>
              {message}
            </p>

            {/* Action button */}
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 
                  dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          {isClosable && (
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 
                dark:hover:text-gray-200 transition-colors focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

/** Standalone Toast component for manual control */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { id, type = "info", title, message, duration = "medium", onClose, isClosable = true, action, className = "", ...props },
  ref
) {
  return (
    <ToastItem
      ref={ref}
      id={id}
      type={type}
      title={title}
      message={message}
      duration={duration}
      onClose={onClose}
      isClosable={isClosable}
      action={action}
      className={className}
      {...props}
    />
  );
});

Toast.displayName = "Toast";

export default Toast;
