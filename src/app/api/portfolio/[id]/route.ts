import { NextResponse } from "next/server";
import { validateRouteParam } from "../../../../lib/route-params";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = validateRouteParam(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Invalid portfolio id", details: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ id: result.value, name: `Portfolio ${result.value}` });
}
