"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function PageThemeToggle({ showText = true }: { showText?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const dark = saved === "dark";
      setIsDark(dark);
      if (dark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {
      // ignore
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", next ? "dark" : "light");
      // notify other components on the page that theme changed
      try {
        window.dispatchEvent(
          new CustomEvent("theme-change", { detail: { isDark: next } })
        );
      } catch (e) {
        // ignore if dispatch fails
      }
    } catch (e) {
      // noop
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        isDark
          ? "bg-neutral-800/60 text-white border border-neutral-700"
          : "bg-white/90 text-neutral-900 border border-neutral-200"
      }`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700" />
      )}
      {showText && <span>{isDark ? "Light" : "Dark"}</span>}
    </motion.button>
  );
}
