"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

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

  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    isDarkModeProp ?? false
  );

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkMode(saved === "dark");
      }
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    try {
      if (isDarkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {
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
      } catch (e) {
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

  const sectionTextColor = isDarkMode ? "text-white" : "text-neutral-900";
  const baseClass = `flex-1 rounded-3xl border p-8 shadow-lg ${
    isDarkMode
      ? "border-neutral-800 bg-neutral-900/30"
      : "border-neutral-200 bg-white/80"
  } ${sectionTextColor}`;
  const sectionClass = contentClassName
    ? `${baseClass} ${contentClassName}`
    : baseClass;

  const mainClass = isDarkMode
    ? "min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 px-4 py-16 transition-colors duration-300"
    : "min-h-screen bg-gradient-to-br from-amber-50 to-orange-50/30 px-4 py-16 transition-colors duration-300";

  const sidebarBorder = isDarkMode ? "border-neutral-800" : "border-white/50";

  return (
    <main
      className={`${mainClass} ${
        isDarkMode ? "text-white" : "text-neutral-900"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <DashboardSidebar borderClassName={sidebarBorder} />
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
                  className={`text-sm ${
                    isDarkMode ? "text-white/70" : "text-neutral-600"
                  }`}
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
