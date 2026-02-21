import React, { forwardRef, HTMLAttributes } from "react";
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Spinner color variants
 */
export type SpinnerColor = "primary" | "secondary" | "white" | "gray";

/**
 * Spinner component props
 */
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Color of the spinner */
  color?: SpinnerColor;
  /** Whether to show a label */
  label?: string;
  /** Full screen loading overlay */
  fullScreen?: boolean;
  /** Custom speed for the animation (in seconds) */
  speed?: number;
}

/**
 * Size mappings in pixels
 */
const sizeMap: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

/**
 * Color mappings
 */
const colorMap: Record<SpinnerColor, string> = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-purple-600 dark:text-purple-400",
  white: "text-white",
  gray: "text-gray-600 dark:text-gray-400",
};

/**
 * Loading spinner component
 * A fully accessible animated spinner with multiple sizes and colors
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = "md",
      color = "primary",
      label = "Loading",
      fullScreen = false,
      speed = 1,
      className = "",
      ...props
    },
    ref
  ) => {
    const spinner = (
      <div
        ref={ref}
        className={`inline-block ${colorMap[color]} ${className}`}
        role="status"
        aria-live="polite"
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className={`${sizeMap[size]}`}
          style={{
            animation: `spin ${speed}s linear infinite`,
          }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );

    // Full screen loading overlay
    if (fullScreen) {
      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 
            dark:bg-gray-900/80 backdrop-blur-sm"
          role="alert"
          aria-busy="true"
          aria-label={label}
        >
          {spinner}
          {label && (
            <span className="ml-3 text-gray-600 dark:text-gray-300">{label}</span>
          )}
        </div>
      );
    }

    return spinner;
  }
);

Spinner.displayName = "Spinner";
