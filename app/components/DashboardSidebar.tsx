"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setStoredUserId } from "../lib/userId";
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
  LogOut
} from "lucide-react";

type Props = {
  borderClassName?: string;
};

const navLinks = [
  { label: "Dashboard", href: "/app/dashboard", icon: Home },
  { label: "Profile", href: "/app/profile", icon: User },
  { label: "Map", href: "/app/map", icon: Map },
  { label: "Games", href: "/app/games", icon: Gamepad2 },
  { label: "Recipes", href: "/app/recipes", icon: Utensils },
  { label: "Offers", href: "/app/offerts", icon: Gift },
  { label: "News", href: "/app/news", icon: Newspaper },
  { label: "Attractions", href: "/app/attractions", icon: Landmark },
  { label: "Leaderboard", href: "/app/leaderboard", icon: Trophy },
];

export default function DashboardSidebar({ borderClassName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const borderClass = borderClassName ?? "border-white/10";

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
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex w-full flex-col gap-6 rounded-2xl border ${borderClass} p-6 text-white shadow-xl backdrop-blur-sm lg:w-64`}
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.85) 60%, rgba(6,95,70,0.8) 100%)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-lime-300" />
          <p className="text-xs uppercase tracking-[0.3em] text-white/90 font-medium">
            Roots
          </p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Navigation</h2>
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
                <Icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? "text-lime-300" : "text-white/80 group-hover:text-lime-200"
                }`} />
                <span className="flex-1">{link.label}</span>
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
        className="mt-auto flex items-center gap-3 rounded-xl border border-white/30 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-70 group"
      >
        <LogOut className={`w-5 h-5 transition-transform duration-300 ${
          isLoggingOut ? "animate-pulse" : "group-hover:translate-x-0.5"
        }`} />
        <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
      </motion.button>
    </motion.aside>
  );
}