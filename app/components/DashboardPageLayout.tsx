"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  isDarkMode: isDarkModeProp,
}: Props) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(isDarkModeProp ?? false);
  const [mounted, setMounted] = useState(false);
  // Prefetch news in the background for better UX
  usePrefetchNews();

  // This is a legitimate hydration pattern - disable the warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true);
  }, []);

  // Read from localStorage only after mounting on client
  useEffect(() => {
    if (!mounted) return;

    if (isDarkModeProp !== undefined) {
      setIsDarkMode(isDarkModeProp);
      return;
    }
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        const dark = saved === "dark";
        setIsDarkMode(dark);
        if (dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {
      // Ignore
    }
  }, [mounted, isDarkModeProp]);

  useEffect(() => {
    try {
      if (isDarkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {
      // Ignore
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail && typeof detail.isDark === "boolean") {
          setIsDarkMode(detail.isDark);
        } else {
          const saved = localStorage.getItem("theme");
          if (saved) setIsDarkMode(saved === "dark");
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener("theme-change", handler as EventListener);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "theme") {
        setIsDarkMode(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("theme-change", handler as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Use light theme for SSR/initial render to prevent hydration mismatch
  const effectiveIsDarkMode = mounted ? isDarkMode : false;

  const sectionTextColor = "text-white";
  const baseClass = `flex-1 rounded-3xl border p-8 shadow-lg border-neutral-800 bg-neutral-900/30 ${sectionTextColor}`;
  const sectionClass = contentClassName
    ? `${baseClass} ${contentClassName}`
    : baseClass;

  const mainClass = "min-h-screen bg-black px-4 py-16 transition-colors duration-300";

  return (
    <main
      className={`${mainClass} text-white`}
    >
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
                <p
                  className="text-sm text-white/70"
                >
                  {description}
                </p>
              )}
            </header>
          )}
          {children}
        </section>
      </div>
    </main>
  );
}
