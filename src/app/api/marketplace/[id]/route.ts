import { NextResponse } from "next/server";
import { validateId } from "../../../../lib/id-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const path = request instanceof Request ? new URL(request.url).pathname : "";
  const result = validateId((await params).id);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Invalid marketplace ID", message: result.error, details: result.error, path },
      { status: 400 },
    );
  }

  return NextResponse.json({
    id: result.value,
    name: `marketplace ${result.value}`,
  });
}
