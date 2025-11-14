"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  borderClassName?: string;
};

const navLinks = [
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Profile", href: "/app/profile" },
  { label: "Map", href: "/app/map" },
  { label: "Games", href: "/app/games" },
  { label: "Recipes", href: "/app/recipes" },
  { label: "Offerts", href: "/app/offerts" },
  { label: "News", href: "/app/news" },
  { label: "Attractions", href: "/app/attractions" },
  { label: "Leaderboard", href: "/app/leaderboard" },
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
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  return (
    <aside
      className={`flex w-full flex-col gap-6 rounded-3xl border ${borderClass} p-6 text-white shadow-lg lg:w-64`}
      style={{
        background:
          "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 60%, rgba(6,95,70,1) 100%)",
      }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/80">
          Roots
        </p>
        <p className="text-2xl font-semibold">Navigation</p>
      </div>
      <nav className="space-y-3">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                isActive
                  ? "bg-white text-emerald-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-auto rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoggingOut ? "Signing out..." : "Logout"}
      </button>
    </aside>
  );
}
