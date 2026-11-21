"use client";

import { useTheme, type Theme } from "../hooks/useTheme";

const options: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-toggle" className="text-sm text-foreground/70">
        Theme
      </label>
      <select
        id="theme-toggle"
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="rounded border border-foreground/20 bg-background px-2 py-1 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
