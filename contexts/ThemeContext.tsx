"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((resolved: "light" | "dark") => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    // Read saved preference
    const saved =
      (localStorage.getItem("stellaraid-theme") as Theme) ?? "system";
    setThemeState(saved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolve = (t: Theme): "light" | "dark" => {
      if (t === "system") return mediaQuery.matches ? "dark" : "light";
      return t;
    };

    applyTheme(resolve(saved));

    const handleChange = () => {
      if (saved === "system") applyTheme(mediaQuery.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem("stellaraid-theme", t);
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const resolved =
        t === "system" ? (mediaQuery.matches ? "dark" : "light") : t;
      applyTheme(resolved);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
