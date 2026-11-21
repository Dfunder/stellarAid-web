import { NextResponse } from "next/server";
import {
  checkContactRateLimit,
  normalizeContactInput,
  validateContactInput,
} from "../../../lib/contact";

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const input = normalizeContactInput({
    name: typeof payload.name === "string" ? payload.name : "",
    email: typeof payload.email === "string" ? payload.email : "",
    message: typeof payload.message === "string" ? payload.message : "",
    company: typeof payload.company === "string" ? payload.company : "",
  });

  if (input.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const rate = checkContactRateLimit(getClientKey(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const errors = validateContactInput(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Invalid contact submission.", errors }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
