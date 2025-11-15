"use client";

import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

export default function ThemeToggleGuard() {
  const pathname = usePathname();

  if (!pathname) return null;

  // Hide the toggle on dashboard pages
  if (
    pathname.startsWith("/app/dashboard") ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return <ThemeToggle />;
}
