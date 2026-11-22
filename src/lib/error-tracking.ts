import { siteConfig } from "../config/site";

export type ErrorTrackingContext = {
  componentStack?: string;
  route?: string;
};

export type ErrorReport = {
  message: string;
  stack?: string;
  componentStack?: string;
  route: string;
  timestamp: string;
};

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const SECRET_PATTERN = /\b(?:token|secret|password|api[_-]?key)[_-]?[A-Za-z0-9._-]*/gi;

function sanitize(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(SECRET_PATTERN, "[redacted]");
}

function reportEndpoint(): string {
  if (typeof window !== "undefined") return "/api/errors";
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  return `${base.replace(/\/+$/, "")}/api/errors`;
}

export function buildErrorReport(
  error: unknown,
  context: ErrorTrackingContext = {},
): ErrorReport {
  const normalized =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error), stack: undefined };

  const report: ErrorReport = {
    message: sanitize(normalized.message) ?? "",
    stack: sanitize(normalized.stack),
    componentStack: context.componentStack,
    route:
      context.route ??
      (typeof window === "undefined" ? "server" : window.location.pathname),
    timestamp: new Date().toISOString(),
  };

  return report;
}

export function logError(error: unknown, context: ErrorTrackingContext = {}) {
  const report = buildErrorReport(error, context);

  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error("Application error", report);
  }

  try {
    if (typeof fetch !== "function") return report;
    void fetch(reportEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return report;
  }

  return report;
}
