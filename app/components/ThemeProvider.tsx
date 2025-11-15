"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    try {
      // Notify any non-React components listening for theme changes
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: next === "dark" } }));
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  // allow consumers to set the theme explicitly
  const setThemeExplicit = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    try {
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: t === "dark" } }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme: setThemeExplicit }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Keep the HTML class in sync with the theme for Tailwind's `dark:` variants

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
