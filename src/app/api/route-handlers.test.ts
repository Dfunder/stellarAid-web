import { describe, expect, it } from "vitest";
import { GET as getArtist } from "./artist/[id]/route";
import { GET as getMarketplace } from "./marketplace/[id]/route";
import { GET as getPortfolio } from "./portfolio/[id]/route";

type Handler = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => Promise<Response>;

const handlers: Array<[string, Handler]> = [
  ["artist", getArtist],
  ["marketplace", getMarketplace],
  ["portfolio", getPortfolio],
];

function request(id: string): Request {
  return new Request(`http://localhost/api/test/${encodeURIComponent(id)}`);
}

function context(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

describe("detail API routes", () => {
  it.each(handlers)("%s rejects malicious ids", async (_name, handler) => {
    const response = await handler(request("../secret"), context("../secret"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/invalid/i);
    expect(body.details).toMatch(/traversal/i);
  });

  it.each(handlers)("%s returns a sanitized payload for valid ids", async (name, handler) => {
    const response = await handler(request("item_1"), context("item_1"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("item_1");
    expect(body.name).toContain(name);
    expect(JSON.stringify(body)).not.toMatch(/[<>;'/\\]/);
  });
});
