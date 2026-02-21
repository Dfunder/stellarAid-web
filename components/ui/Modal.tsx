"use client";

import React, { useEffect, useCallback, forwardRef, ElementType, HTMLAttributes } from "react";
import { createPortal } from "react-dom";

/** Modal component variants */
export type ModalVariant = "default" | "centered" | "fullscreen";

/** Modal size options */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/** Modal component props */
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  as?: ElementType;
  overlayClassName?: string;
  disableScroll?: boolean;
}

/** Modal header props */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  onClose?: () => void;
}

/** Modal body props */
export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Modal footer props */
export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Modal component - A fully accessible dialog overlay */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    isOpen,
    onClose,
    variant = "default",
    size = "md",
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    disableScroll = true,
    overlayClassName = "",
    className = "",
    children,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref
) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      if (disableScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (disableScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, handleEscape, disableScroll]);

  if (!isOpen) return null;

  const sizeClasses: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  const variantClasses: Record<ModalVariant, string> = {
    default: "",
    centered: "items-center justify-center",
    fullscreen: "p-0",
  };

  const isFullscreen = variant === "fullscreen";

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex ${variantClasses[variant]} ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={ref}
        className={`
          relative z-10 w-full bg-white dark:bg-gray-800 
          rounded-lg shadow-xl transform transition-all
          ${isFullscreen ? "h-full rounded-none" : sizeClasses[size]}
          ${variant === "centered" ? "mx-4" : ""}
          ${className}
        `}
        {...props}
      >
        {showCloseButton && !isFullscreen && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 
              dark:hover:text-gray-200 transition-colors focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
});

/** Modal header component */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(function ModalHeader(
  { showCloseButton = true, onClose, className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 
            dark:hover:text-gray-200 transition-colors focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

/** Modal body component */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody(
  { className = "", children, ...props },
  ref
) {
  return (
    <div ref={ref} className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
});

/** Modal footer component */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(function ModalFooter(
  { className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Modal;
