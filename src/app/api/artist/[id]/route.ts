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
      { error: "Invalid artist id", details: result.error },
import { validateId } from "../../../../lib/id-validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const path = request instanceof Request ? new URL(request.url).pathname : "";
  const result = validateId((await params).id);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Invalid artist ID", message: result.error, path },
      { status: 400 },
    );
  }

  return NextResponse.json({ id: result.value, name: `Artist ${result.value}` });
}
