"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary as ClientErrorBoundary } from "@/components/ErrorBoundary";

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

/**
 * ErrorBoundaryProvider wraps the application with a global ErrorBoundary
 * This should be placed at the root of the application
 */
export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  return (
    <ClientErrorBoundary>
      {children}
    </ClientErrorBoundary>
  );
}

export default ErrorBoundaryProvider;
