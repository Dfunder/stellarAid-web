import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "./useTheme";

const media = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    media.matches = false;
    vi.stubGlobal("matchMedia", vi.fn(() => media));
  });

  it("uses the system preference by default without setting data-theme", () => {
    media.matches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("applies and persists an explicit theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("stellaraid:theme")).toBe("dark");
  });

  it("restores a saved theme on mount", () => {
    localStorage.setItem("stellaraid:theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("removes data-theme when switching back to system", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("light"));
    expect(document.documentElement.dataset.theme).toBe("light");
    act(() => result.current.setTheme("system"));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(localStorage.getItem("stellaraid:theme")).toBe("system");
  });
});
