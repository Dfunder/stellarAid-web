import { describe, expect, it } from "vitest";
import { GET as getArtist } from "./artist/[id]/route";
import { GET as getMarketplace } from "./marketplace/[id]/route";
import { GET as getPortfolio } from "./portfolio/[id]/route";

type RouteHandler = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => Promise<Response>;

const routes: Array<{ name: string; handler: RouteHandler }> = [
  { name: "artist", handler: getArtist },
  { name: "marketplace", handler: getMarketplace },
  { name: "portfolio", handler: getPortfolio },
];

function callRoute(handler: RouteHandler, id: string) {
  return handler(new Request(`http://localhost/api/test/${encodeURI(id)}`), {
    params: Promise.resolve({ id }),
  });
}

describe.each(routes)("$name route", ({ handler }) => {
  it("returns 400 with a clear JSON error for malicious IDs", async () => {
    const maliciousIds = [
      "../admin",
      "..%2Fadmin",
      "artist%00admin",
      "' OR 1=1--",
      "<script>alert(1)</script>",
    ];

    for (const id of maliciousIds) {
      const response = await callRoute(handler, id);
      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toContain("application/json");
      const body = await response.json();
      expect(body.error).toMatch(/Invalid/);
      expect(body.message.length).toBeGreaterThan(0);
    }
  });

  it("returns 200 and the validated ID for a safe ID", async () => {
    const response = await callRoute(handler, "artist-42");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: "artist-42" });
  });
});
