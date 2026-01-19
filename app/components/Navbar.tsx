"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import { useI18n } from "../hooks/useI18n";

import Link from "next/link";

interface NavbarProps {
  scrollY?: number;
  userId?: string | null;
}

export default function Navbar(e: NavbarProps) {
  const { t } = useI18n();
  const userId = e.userId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800"
      style={{ backgroundColor: "#0a0a0a" }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-neutral-950"
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
            <Link href="/" className="text-xl text-white">
              Roots
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <Link href={userId ? "/app/dashboard" : "/login"}>
              <motion.button
                className="px-6 py-2.5 rounded-full bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("home.cta.getStarted")}
              </motion.button>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {isMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-neutral-800"
          >
            <Link href={userId ? "/app/dashboard" : "/login"}>
              <button className="w-full mt-4 px-6 py-2.5 rounded-full bg-lime-400 text-neutral-950 transition-colors">
                {t("home.cta.getStarted")}
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
