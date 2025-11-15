"use client";

import { useEffect } from "react";

export function usePrefetchNews() {
  useEffect(() => {
    // Prefetch news data in the background
    const prefetch = async () => {
      try {
        await fetch("/api/news", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        // Silently fail - this is just a prefetch optimization
        console.debug("News prefetch failed:", error);
      }
    };

    // Prefetch after a short delay to not block initial page load
    const timeoutId = setTimeout(prefetch, 1000);

    return () => clearTimeout(timeoutId);
  }, []);
}
