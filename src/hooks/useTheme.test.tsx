import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, useTheme } from "./useTheme";

function stubSystemTheme(matches: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches,
    addEventListener: (type: string, listener: () => void) => {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === "change") listeners.delete(listener);
    },
  };
  vi.stubGlobal("matchMedia", vi.fn(() => media));

  return {
    setMatches(next: boolean) {
      media.matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    stubSystemTheme(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("restores a persisted theme and applies it to the document", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("persists selections and removes data-theme when following the system", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("tracks system preference changes through matchMedia", () => {
    const system = stubSystemTheme(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.systemDark).toBe(false);

    act(() => system.setMatches(true));
    expect(result.current.systemDark).toBe(true);
  });

  it("reacts to theme changes made in another tab", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_STORAGE_KEY,
          newValue: "dark",
        }),
      );
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
