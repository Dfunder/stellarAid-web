import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, useTheme } from "./useTheme";

function mockMatchMedia(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal("matchMedia", vi.fn(() => media));
  return {
    setDark(next: boolean) {
      media.matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("data-theme");
  });

  it("persists an explicit theme on the document root", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("follows system changes while set to system", () => {
    const system = mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => system.setDark(false));

    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("restores a saved preference over the system default", () => {
    mockMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });
});
