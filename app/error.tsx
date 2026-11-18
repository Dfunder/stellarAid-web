"use client";

import { useEffect } from "react";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-foreground/80">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
