"use client";

import { useTheme, type Theme } from "../hooks/useTheme";

const order: Theme[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const next = order[(order.indexOf(theme) + 1) % order.length] ?? "system";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}`}
      title={`Theme: ${theme}`}
      className="inline-flex items-center rounded-full border border-foreground/20 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {resolvedTheme === "dark" ? "Dark" : "Light"}
      {theme === "system" ? " (system)" : null}
    </button>
  );
}
