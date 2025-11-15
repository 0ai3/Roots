"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
      const isDark = saved === "dark";
      setTheme(isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Ignore
    }
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      if (newTheme === "dark") {
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
          detail: { isDark: newTheme === "dark" },
        })
      );
    } catch {
      // Ignore
    }
  };

  // Prevent hydration mismatch by showing a neutral state until mounted
  if (!mounted) {
    return (
      <button
        className="fixed top-4 right-4 z-9999 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md border border-neutral-200 shadow-lg"
        aria-label="Toggle theme"
        disabled
      >
        <div className="absolute">
          <Moon className="w-5 h-5 text-neutral-400" />
        </div>
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed top-4 right-4 z-9999 w-12 h-12 rounded-full flex items-center justify-center ${
        theme === "dark"
          ? "bg-neutral-900/90 border-neutral-700"
          : "bg-white/90 border-neutral-200"
      } backdrop-blur-md border shadow-lg transition-colors`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon
          className={`w-5 h-5 ${
            theme === "dark" ? "text-lime-400" : "text-neutral-900"
          }`}
        />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? -180 : 0,
          scale: theme === "dark" ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun
          className={`w-5 h-5 ${
            theme === "dark" ? "text-lime-400" : "text-amber-600"
          }`}
        />
      </motion.div>
    </motion.button>
  );
}
