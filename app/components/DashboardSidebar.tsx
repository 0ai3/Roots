"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  borderClassName?: string;
};

const navLinks = [
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Map", href: "/app/map" },
  { label: "Games", href: "/app/games" },
  { label: "Recipes", href: "/app/recipes" },
  { label: "Offerts", href: "/app/offerts" },
  { label: "News", href: "/app/news" },
  { label: "Attractions", href: "/app/attractions" },
];

export default function DashboardSidebar({ borderClassName }: Props) {
  const pathname = usePathname();
  const borderClass = borderClassName ?? "border-white/10";

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
    </aside>
  );
}
