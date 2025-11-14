"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import React from "react";

type Theme = "light" | "dark";

export default function ThemeToggle({
  theme,
  toggleTheme,
}: {
  theme: Theme;
  toggleTheme: () => void;
}) {
  return (
    <motion.button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all shadow-lg ${
        theme === "dark"
          ? "bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700/80"
          : "bg-white/90 border-neutral-200 hover:bg-neutral-50/90"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
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
