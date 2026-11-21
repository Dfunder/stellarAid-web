import { afterEach, describe, expect, it, vi } from "vitest";
import { logError } from "./error-tracking";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("logError", () => {
  it("posts a timestamped report from the browser", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const report = logError(new Error("boom"), {
      componentStack: "at Page",
      route: "/campaigns",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/errors");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      message: "boom",
      componentStack: "at Page",
      route: "/campaigns",
      timestamp: report.timestamp,
    });
  });

  it("posts to an absolute endpoint on the server", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    logError("server failure", { componentStack: "at layout" });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toMatch(/^https?:\/\/.+\/api\/errors$/);
  });

  it("does not throw into the UI when reporting fails", () => {
    vi.stubGlobal("fetch", vi.fn(() => {
      throw new Error("offline");
    }));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => logError(new Error("boom"))).not.toThrow();
  });
});
