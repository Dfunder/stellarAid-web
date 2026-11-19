export type ErrorTrackingContext = {
  componentStack?: string;
  route?: string;
};

export function logError(error: unknown, context: ErrorTrackingContext = {}) {
  const normalized =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error), stack: undefined };

  const report = {
    ...normalized,
    componentStack: context.componentStack,
    route: context.route ?? (typeof window === "undefined" ? undefined : window.location.pathname),
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    console.error("Application error", report);
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => undefined);
  }

  return report;
}
