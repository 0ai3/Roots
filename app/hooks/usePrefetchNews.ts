"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Prefetches news data in the background when user is on dashboard pages
 * This improves UX by loading news before the user navigates to the news page
 */
export function usePrefetchNews() {
  const pathname = usePathname();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once per session
    if (hasPrefetched.current) return;
    
    // Only prefetch on dashboard pages (not on the news page itself)
    const isDashboardPage = pathname?.startsWith("/app/") && pathname !== "/app/news";
    if (!isDashboardPage) return;

    // Wait a bit before prefetching to not interfere with page load
    const timer = setTimeout(() => {
      console.log("Prefetching news data in background...");
      
      fetch("/api/news", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.news) {
            console.log("News prefetched successfully (cached for 24h)");
            hasPrefetched.current = true;
          }
        })
        .catch((err) => {
          console.log("News prefetch failed (will retry on page visit):", err.message);
        });
    }, 3000); // Wait 3 seconds after page load

    return () => clearTimeout(timer);
  }, [pathname]);
}
