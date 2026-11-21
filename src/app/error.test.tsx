import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./error";

describe("error boundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers a retry action without exposing internal error details", () => {
    const reset = vi.fn();
    const error = new Error("internal database password leaked");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorBoundary error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/internal database password leaked/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/digest/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  it("links back to the home route", () => {
    const reset = vi.fn();
    const error = new Error("test error");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorBoundary error={error} reset={reset} />);

    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute(
      "href",
      "/",
    );
    fetchSpy.mockRestore();
  });

  it("posts a sanitized error report to the server", async () => {
    const reset = vi.fn();
    const error = new Error("leak test@example.com token_ABC123");
    error.stack = "Error: leak test@example.com token_ABC123\nat secret";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorBoundary error={error} reset={reset} />);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/errors");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(String(init.body));
    expect(body.message).not.toContain("test@example.com");
    expect(body.message).not.toContain("token_ABC123");
    expect(body.stack).not.toContain("test@example.com");
    expect(body.stack).not.toContain("token_ABC123");
    expect(body.route).toBe(window.location.pathname);
    expect(typeof body.timestamp).toBe("string");
    expect(body).not.toHaveProperty("componentStack");
  });
});
