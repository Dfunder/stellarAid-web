import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gives every navigation link a visible focus indicator", () => {
    render(<Header />);

    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("focus-visible:outline");
      expect(link.className).toContain("focus-visible:outline-2");
      expect(link.className).toContain("focus-visible:outline-offset-2");
      expect(link.className).toContain("focus-visible:outline-foreground");
    }
  });

  it("renders the theme control in the primary navigation", () => {
    render(<Header />);

    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toContainElement(screen.getByRole("combobox", { name: /theme/i }));
  });
});
