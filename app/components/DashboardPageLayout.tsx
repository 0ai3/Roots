"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { usePrefetchNews } from "@/app/hooks/usePrefetchNews";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  contentClassName?: string;
  isDarkMode?: boolean;
};

export default function DashboardPageLayout({
  children,
  title,
  description,
  contentClassName,
}: Props) {
  // Prefetch news in the background for better UX
  usePrefetchNews();

  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const sectionTextColor = "text-white";
  const baseClass = `flex-1 rounded-3xl border p-8 shadow-lg border-neutral-800 bg-neutral-900/30 ${sectionTextColor}`;
  const sectionClass = contentClassName
    ? `${baseClass} ${contentClassName}`
    : baseClass;

  const mainClass =
    "min-h-screen bg-black px-4 py-16 transition-colors duration-300";

  return (
    <main className={`${mainClass} text-white`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <DashboardSidebar />
        <section className={sectionClass}>
          {(title || description) && (
            <header className="mb-6 space-y-2">
              {title && (
                <h1 className="text-3xl font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-white/70">{description}</p>
              )}
            </header>
          )}
          {children}
        </section>
      </div>
    </main>
  );
}
