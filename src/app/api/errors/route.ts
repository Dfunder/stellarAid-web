import { NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_STACK_LENGTH = 20000;
const MAX_ROUTE_LENGTH = 500;
const MAX_TIMESTAMP_LENGTH = 50;

function readString(value: unknown, maxLength: number): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.slice(0, maxLength)
    : undefined;
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return badRequest("Payload must be an object");
  }

  const body = payload as Record<string, unknown>;
  const message = readString(body.message, MAX_MESSAGE_LENGTH);
  const stack = readString(body.stack, MAX_STACK_LENGTH);
  const componentStack = readString(body.componentStack, MAX_STACK_LENGTH);
  const route = readString(body.route, MAX_ROUTE_LENGTH);
  const timestamp = readString(body.timestamp, MAX_TIMESTAMP_LENGTH);

  if (
    !message ||
    (!stack && !componentStack) ||
    !route ||
    !timestamp ||
    Number.isNaN(Date.parse(timestamp))
  ) {
    return badRequest("Missing or invalid error report fields");
  }

  console.error("[server-error] Application error", {
    message,
    stack,
    componentStack,
    route,
    timestamp,
  });

  return NextResponse.json({ ok: true });
}
