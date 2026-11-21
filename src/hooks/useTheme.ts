"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "stellaraid:theme";

const darkQuery = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getMediaQuery(): MediaQueryList | undefined {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return undefined;
  }
  return window.matchMedia(darkQuery);
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const media = getMediaQuery();
  media?.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media?.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function readSystemTheme(): "light" | "dark" {
  return getMediaQuery()?.matches ? "dark" : "light";
}

function persistTheme(next: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    return;
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");
  const systemTheme = useSyncExternalStore(
    subscribe,
    readSystemTheme,
    () => "light",
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    if (typeof window === "undefined") return;
    persistTheme(next);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return { theme, resolvedTheme, setTheme };
}
