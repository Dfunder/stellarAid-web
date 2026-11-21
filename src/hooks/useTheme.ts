"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "stellaraid:theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const themeOrder: Theme[] = ["system", "light", "dark"];
const themeListeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    return "system";
  }
  return "system";
}

function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(onChange: () => void) {
  themeListeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerTheme(): Theme {
  return "system";
}

function getSystemSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(DARK_QUERY).matches;
}

function subscribeSystemTheme(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getServerSystemSnapshot() {
  return false;
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    getServerTheme,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemSnapshot,
    getServerSystemSnapshot,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    writeStoredTheme(next);
  }, []);

  const cycleTheme = useCallback(() => {
    const index = themeOrder.indexOf(theme);
    writeStoredTheme(themeOrder[(index + 1) % themeOrder.length]);
  }, [theme]);

  return { theme, systemDark, setTheme, cycleTheme };
}
