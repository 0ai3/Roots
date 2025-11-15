"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function PageThemeToggle({ showText = true }: { showText?: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // This is a legitimate hydration pattern - disable the warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const saved = localStorage.getItem("theme");
      const dark = saved === "dark";
      setIsDark(dark);
      if (dark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {
      // Ignore
    }
  }, [mounted]);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    try {
      if (newDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {
      // Ignore
    }
    try {
      window.dispatchEvent(
        new CustomEvent("theme-change", {
          detail: { isDark: newDark },
        })
      );
    } catch {
      // Ignore
    }
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium bg-white/90 text-neutral-900 border border-neutral-200">
        <Moon className="w-4 h-4 text-neutral-700" />
        <span>Dark</span>
      </div>
    );
  }

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
