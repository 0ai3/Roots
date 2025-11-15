"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Update scrollY on client only
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = scrollPosition > 50;

  const navLinks = [
    { name: "Traditions", href: "#traditions" },
    { name: "Food & Culture", href: "#food" },
    { name: "Museums", href: "#museums" },
    { name: "Attractions", href: "#attractions" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? theme === "dark"
            ? "bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-800"
            : "bg-white/90 backdrop-blur-lg border-b border-neutral-200 shadow-sm"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={theme === "dark" ? "text-neutral-950" : "text-white"}
              >
                <path
                  d="M12 2C12 2 9 6 9 10C9 12.2091 10.7909 14 13 14C15.2091 14 17 12.2091 17 10C17 6 14 2 14 2H12Z"
                  fill="currentColor"
                />
                <path
                  d="M8 22C8 22 6 18 6 15C6 13.3431 7.34315 12 9 12C10.6569 12 12 13.3431 12 15C12 18 10 22 10 22H8Z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M16 22C16 22 14 18 14 15C14 13.3431 15.3431 12 17 12C18.6569 12 20 13.3431 20 15C20 18 18 22 18 22H16Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <Link
              href="/"
              className={`text-xl ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Roots
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors ${
                  theme === "dark"
                    ? "text-neutral-300 hover:text-lime-400"
                    : "text-neutral-700 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </a>
            ))}
            <motion.button
              className={`px-6 py-2.5 rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}
          >
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`md:hidden py-4 border-t ${
              theme === "dark" ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block py-3 text-sm transition-colors ${
                  theme === "dark"
                    ? "text-neutral-300 hover:text-lime-400"
                    : "text-neutral-700 hover:text-emerald-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              className={`w-full mt-4 px-6 py-2.5 rounded-full transition-colors ${
                theme === "dark" ? "bg-lime-400 text-neutral-950" : "bg-emerald-600 text-white"
              }`}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
