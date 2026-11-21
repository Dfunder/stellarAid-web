"use client";

import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, systemDark, cycleTheme } = useTheme();
  const current =
    theme === "system" ? `system (${systemDark ? "dark" : "light"})` : theme;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Color theme: ${current}. Activate to change theme.`}
      title={`Color theme: ${current}`}
      className="rounded-full border border-foreground/20 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {theme}
    </button>
  );
}
