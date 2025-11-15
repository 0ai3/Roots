"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setStoredUserId } from "../lib/userId";
import { useI18n } from "@/app/hooks/useI18n";
import {
  Home,
  User,
  Map,
  Gamepad2,
  Utensils,
  Gift,
  Newspaper,
  Landmark,
  Trophy,
  LogOut,
  BookOpen,
  MessageCircle,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";

type Props = {
  borderClassName?: string;
};

const navLinks = [
  { label: "nav.dashboard", href: "/app/dashboard", icon: Home },
  { label: "nav.profile", href: "/app/profile", icon: User },
  { label: "nav.logs", href: "/app/logs", icon: BookOpen },
  { label: "nav.chat", href: "/app/chat", icon: MessageCircle },
  { label: "nav.map", href: "/app/map", icon: Map },
  { label: "nav.games", href: "/app/games", icon: Gamepad2 },
  { label: "nav.recipes", href: "/app/recipes", icon: Utensils },
  { label: "nav.offers", href: "/app/offerts", icon: Gift },
  { label: "nav.news", href: "/app/news", icon: Newspaper },
  { label: "nav.attractions", href: "/app/attractions", icon: Landmark },
  { label: "nav.leaderboard", href: "/app/leaderboard", icon: Trophy },
];

export default function DashboardSidebar({ borderClassName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t } = useI18n();

  const [isDarkLocal, setIsDarkLocal] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = scrollPosition > 50;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkLocal(saved === "dark");
      } else {
        setIsDarkLocal(document.documentElement.classList.contains("dark"));
      }
    } catch (e) {
      // ignore
    }

    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail && typeof detail.isDark === "boolean") {
          setIsDarkLocal(detail.isDark);
          return;
        }
      } catch (e) {
        // ignore
      }
      try {
        const saved = localStorage.getItem("theme");
        setIsDarkLocal(saved === "dark");
      } catch (e) {
        // ignore
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "theme") setIsDarkLocal(e.newValue === "dark");
    };

    window.addEventListener("theme-change", handler as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("theme-change", handler as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setStoredUserId(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDarkLocal
            ? "bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-800"
            : "bg-white/90 backdrop-blur-lg border-b border-neutral-200 shadow-sm"
          : isDarkLocal
          ? "bg-neutral-950/50 backdrop-blur-sm border-b border-neutral-800/50"
          : "bg-white/50 backdrop-blur-sm border-b border-neutral-200/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkLocal ? "bg-lime-400" : "bg-emerald-600"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isDarkLocal ? "text-neutral-950" : "text-white"}
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
              href="/app/dashboard"
              className={`text-xl font-semibold ${
                isDarkLocal ? "text-white" : "text-neutral-900"
              }`}
            >
              Roots
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.slice(0, 6).map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? isDarkLocal
                        ? "text-lime-400"
                        : "text-emerald-600"
                      : isDarkLocal
                      ? "text-neutral-300 hover:text-lime-400"
                      : "text-neutral-700 hover:text-emerald-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.label)}
                </Link>
              );
            })}

            {/* Dropdown for More Items */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  isDarkLocal
                    ? "text-neutral-300 hover:text-lime-400"
                    : "text-neutral-700 hover:text-emerald-600"
                }`}
              >
                More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  isDarkLocal
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="py-2">
                  {navLinks.slice(6).map((link) => {
                    const isActive =
                      pathname === link.href ||
                      pathname?.startsWith(`${link.href}/`);
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? isDarkLocal
                              ? "text-lime-400 bg-lime-400/10"
                              : "text-emerald-600 bg-emerald-50"
                            : isDarkLocal
                            ? "text-neutral-300 hover:bg-neutral-800"
                            : "text-neutral-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t(link.label)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              disabled={isLoggingOut}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isDarkLocal
                  ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut
                ? t("dashboard.sidebar.signingOut")
                : t("dashboard.sidebar.logout")}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 ${
              isDarkLocal ? "text-white" : "text-neutral-900"
            }`}
          >
            {isMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:hidden py-4 border-t ${
              isDarkLocal ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname?.startsWith(`${link.href}/`);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? isDarkLocal
                          ? "text-lime-400 bg-lime-400/10"
                          : "text-emerald-600 bg-emerald-50"
                        : isDarkLocal
                        ? "text-neutral-300 hover:bg-neutral-800"
                        : "text-neutral-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {t(link.label)}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors ${
                isDarkLocal
                  ? "bg-lime-400 text-neutral-950"
                  : "bg-emerald-600 text-white"
              } disabled:opacity-50`}
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut
                ? t("dashboard.sidebar.signingOut")
                : t("dashboard.sidebar.logout")}
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
