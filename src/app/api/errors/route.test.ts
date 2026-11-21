import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const validReport = {
  message: "Unexpected failure",
  stack: "Error: Unexpected failure\n  at Page",
  componentStack: "  at ErrorBoundary",
  route: "/campaigns/42",
  timestamp: "2026-01-01T00:00:00.000Z",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/errors", () => {
  it("logs a valid report with a structured prefix", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(makeRequest(validReport));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toContain("[server-error]");
    expect(error.mock.calls[0][1]).toMatchObject({
      message: validReport.message,
      route: validReport.route,
      timestamp: validReport.timestamp,
    });
  });

  it("rejects reports with missing fields", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(makeRequest({ message: "boom" }));

    expect(response.status).toBe(400);
    expect(error).not.toHaveBeenCalled();
  });

  it("rejects an invalid timestamp", async () => {
    const response = await POST(
      makeRequest({ ...validReport, timestamp: "not-a-date" }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/errors", {
        method: "POST",
        body: "not json",
      }),
    );

    expect(response.status).toBe(400);
  });
});
