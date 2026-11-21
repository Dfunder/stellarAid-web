export type ErrorTrackingContext = {
  componentStack?: string;
  route?: string;
};

function redactString(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+\b/g, "Bearer [redacted]")
    .replace(/\b(?:sk|pk|api|key|token)_[A-Za-z0-9]+\b/gi, "[redacted-token]")
    .slice(0, 2000);
}

function sanitizeField(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return redactString(trimmed);
}

export function buildErrorReport(
  error: unknown,
  context: ErrorTrackingContext = {},
) {
  const normalized =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error), stack: undefined };

  const route =
    context.route ??
    (typeof window === "undefined" ? undefined : window.location.pathname);

  return {
    message: sanitizeField(normalized.message) ?? "Unknown error",
    stack: sanitizeField(normalized.stack),
    componentStack: sanitizeField(context.componentStack),
    route: sanitizeField(route),
    timestamp: new Date().toISOString(),
  };
}

export function logError(error: unknown, context: ErrorTrackingContext = {}) {
  const report = buildErrorReport(error, context);

  if (typeof window !== "undefined") {
    console.error("Application error", report);
    try {
      void fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      return report;
    }
  }

  return report;
}
