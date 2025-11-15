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
} from "lucide-react";

type Props = {
  borderClassName?: string;
};

const navLinks = [
  { label: "nav.dashboard", href: "/app/dashboard", icon: Home },
  { label: "nav.profile", href: "/app/profile", icon: User },
  { label: "nav.logs", href: "/app/logs", icon: BookOpen },
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
  const { t } = useI18n();
  const borderClass = borderClassName ?? "border-white/10";

  // Local theme sync so sidebar can adapt to per-page theme toggles without
  // reading browser-only APIs during SSR. Start false to avoid hydration
  // mismatches, then sync after mount.
  const [isDarkLocal, setIsDarkLocal] = useState<boolean>(false);

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

  const darkBg =
    "linear-gradient(135deg, #050505 0%, #0b0b0b 60%, #0f0f0f 100%)";
  const lightBg =
    "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.85) 60%, rgba(6,95,70,0.8) 100%)";

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex w-full flex-col gap-6 rounded-2xl border ${borderClass} p-6 shadow-xl backdrop-blur-sm lg:w-64 text-white`}
      style={{
        background: isDarkLocal ? darkBg : lightBg,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isDarkLocal ? "bg-lime-300" : "bg-lime-300"
            }`}
          />
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-white/90">
            Roots
          </p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {t("dashboard.sidebar.navigation")}
        </h2>
      </motion.div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        {navLinks.map((link, index) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300 group ${
                  isActive
                    ? "bg-white/20 text-white border border-white/30 shadow-lg"
                    : "bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/20 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive
                      ? "text-lime-300"
                      : "text-white/80 group-hover:text-lime-200"
                  }`}
                />
                <span className="flex-1">{t(link.label)}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-lime-300"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 group text-white border border-white/30 hover:bg-white/10 hover:border-white/40`}
      >
        <LogOut
          className={`w-5 h-5 transition-transform duration-300 ${
            isLoggingOut ? "animate-pulse" : "group-hover:translate-x-0.5"
          } text-white`}
        />
        <span>
          {isLoggingOut
            ? t("dashboard.sidebar.signingOut")
            : t("dashboard.sidebar.logout")}
        </span>
      </motion.button>
    </motion.aside>
  );
}
