import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/errors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts and redacts a valid error report", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "boom test@example.com token_ABC123",
        stack: "Error: boom test@example.com",
        route: "/broken",
        timestamp: "2026-01-01T00:00:00.000Z",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(consoleSpy).toHaveBeenCalled();
    const [, logged] = consoleSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(String(logged.message)).not.toContain("test@example.com");
    expect(String(logged.message)).not.toContain("token_ABC123");
    expect(logged.route).toBe("/broken");
  });

  it("rejects invalid payloads", async () => {
    const request = new Request("http://localhost/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
