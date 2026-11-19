import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./error";

describe("error boundary", () => {
  it("offers a retry action without exposing internal error details", () => {
    const reset = vi.fn();
    const error = new Error("internal database password leaked");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorBoundary error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/internal database password leaked/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/digest/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("links back to the home route", () => {
    const reset = vi.fn();
    const error = new Error("test error");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ErrorBoundary error={error} reset={reset} />);

    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
