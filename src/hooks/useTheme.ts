"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "stellaraid:theme";
const listeners = new Set<() => void>();
let fallbackTheme: Theme = "system";

function mediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)");
}

function storedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    return fallbackTheme;
  }
  return fallbackTheme;
}

function serverTheme(): Theme {
  return "system";
}

function systemPrefersDark(): boolean {
  return mediaQuery()?.matches ?? false;
}

function serverPrefersDark(): boolean {
  return false;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = mediaQuery();
  if (typeof media?.addEventListener === "function") {
    media.addEventListener("change", onChange);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof media?.removeEventListener === "function") {
      media.removeEventListener("change", onChange);
    }
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, storedTheme, serverTheme);
  const systemDark = useSyncExternalStore(
    subscribe,
    systemPrefersDark,
    serverPrefersDark,
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
    fallbackTheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      fallbackTheme = next;
    }
    listeners.forEach((listener) => listener());
  }, []);

  const resolvedTheme: Exclude<Theme, "system"> =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  return { theme, resolvedTheme, setTheme };
}
