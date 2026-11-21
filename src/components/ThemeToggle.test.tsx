import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

const media = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cycles themes and persists each choice", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /color theme/i });
    expect(button).toHaveTextContent("system");

    fireEvent.click(button);
    expect(button).toHaveTextContent("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    fireEvent.click(button);
    expect(button).toHaveTextContent("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    fireEvent.click(button);
    expect(button).toHaveTextContent("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("includes the detected system preference in its accessible name", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /color theme/i });
    expect(button.getAttribute("aria-label")).toContain("system (dark)");
  });
});
