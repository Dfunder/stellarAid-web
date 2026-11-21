import { NextResponse } from "next/server";

const MAX_LENGTH = 2000;

function sanitizeString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+\b/g, "Bearer [redacted]")
    .replace(/\b(?:sk|pk|api|key|token)_[A-Za-z0-9]+\b/gi, "[redacted-token]")
    .slice(0, MAX_LENGTH);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const message = sanitizeString(payload.message);
  if (!message) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const report = {
    message,
    stack: sanitizeString(payload.stack),
    componentStack: sanitizeString(payload.componentStack),
    route: sanitizeString(payload.route),
    timestamp: sanitizeString(payload.timestamp) ?? new Date().toISOString(),
  };

  console.error("Client error report", report);
  return NextResponse.json({ ok: true }, { status: 202 });
}
