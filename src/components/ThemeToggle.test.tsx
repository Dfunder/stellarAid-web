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
    vi.stubGlobal("matchMedia", vi.fn(() => media));
  });

  it("cycles themes and persists the selection", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /theme/i });
    expect(button.getAttribute("aria-label")).toContain("system");

    fireEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("stellaraid:theme")).toBe("light");

    fireEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("stellaraid:theme")).toBe("dark");

    fireEvent.click(button);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(localStorage.getItem("stellaraid:theme")).toBe("system");
  });
});
