"use client";

import React from "react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";

export default function Footer({ theme }: { theme: Theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mt-16 pt-8 border-t text-center ${
        theme === "dark"
          ? "border-neutral-800 text-neutral-400"
          : "border-neutral-200 text-neutral-600"
      }`}
    >
      <div className="flex flex-wrap justify-center gap-8 mb-6">
        {["About", "Features", "Community", "Privacy", "Terms"].map((link) => (
          <a
            key={link}
            href="#"
            className={`text-sm transition-colors ${
              theme === "dark"
                ? "hover:text-lime-400"
                : "hover:text-emerald-600"
            }`}
          >
            {link}
          </a>
        ))}
      </div>
      <p className="text-sm">
        © 2025 Roots. Connecting cultures, preserving heritage.
      </p>
    </motion.div>
  );
}
