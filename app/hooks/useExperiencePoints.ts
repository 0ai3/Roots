"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getStoredUserId,
  fetchUserId,
  USER_ID_EVENT,
  setStoredUserId,
} from "../lib/userId";

const POINTS_EVENT = "roots:experience-points";

type ExperiencePointsOptions = {
  initialPoints?: number;
  initialUserId?: string | null;
};

export function useExperiencePoints(options?: ExperiencePointsOptions) {
  const fallbackUserId = options?.initialUserId ?? null;
  const normalizedInitialPoints = options && Number.isFinite(options.initialPoints)
    ? Math.max(0, Math.round(Number(options.initialPoints)))
    : null;
  const [userId, setUserId] = useState<string | null>(() => {
    const stored = getStoredUserId();
    if (stored) {
      return stored;
    }
    return fallbackUserId;
  });
  const [points, setPoints] = useState(() => normalizedInitialPoints ?? 0);

  const syncUserId = useCallback((next: string | null) => {
    setUserId(next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!fallbackUserId) {
      return;
    }
    const stored = getStoredUserId();
    if (stored) {
      return;
    }
    setStoredUserId(fallbackUserId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncUserId(fallbackUserId);
  }, [fallbackUserId, syncUserId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Fetch userId from API on mount
    let isMounted = true;
    fetchUserId().then((id) => {
      if (isMounted && id) {
        syncUserId(id);
      }
    });

    const handleProfileEvent = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail ?? null;
      syncUserId(detail);
    };

    window.addEventListener(USER_ID_EVENT, handleProfileEvent as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener(USER_ID_EVENT, handleProfileEvent as EventListener);
    };
  }, [syncUserId]);

  const broadcastPoints = useCallback((value: number) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(POINTS_EVENT, { detail: value }));
    }
  }, []);

  const persistPoints = useCallback(
    async (value: number) => {
      if (!userId) {
        return;
      }
      try {
        await fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: value }),
        });
      } catch (error) {
        console.error("Failed to persist points", error);
      }
    },
    [userId]
  );

  const applyPoints = useCallback(
    (updater: number | ((prev: number) => number), options?: { persist?: boolean }) => {
      setPoints((prev) => {
        const computed =
          typeof updater === "function"
            ? (updater as (value: number) => number)(prev)
            : updater;
        const next = Math.max(0, Number(computed) || 0);
        broadcastPoints(next);
        if (options?.persist !== false) {
          void persistPoints(next);
        }
        return next;
      });
    },
    [broadcastPoints, persistPoints]
  );

  const previousUserIdRef = useRef<string | null>(userId);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = userId;
    
    if (previousUserId && !userId) {
      setTimeout(() => setPoints(0), 0);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const schedulePointSync = (value: number) => {
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          setPoints(value);
        });
        return;
      }
      setTimeout(() => setPoints(value), 0);
    };

    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === "number") {
        schedulePointSync(detail);
      }
    };

    window.addEventListener(POINTS_EVENT, handleSync as EventListener);
    return () => {
      window.removeEventListener(POINTS_EVENT, handleSync as EventListener);
    };
  }, []);

  const addPoints = useCallback(
    (delta: number) => {
      if (!userId) {
        console.warn("Cannot add points without a user ID. Please sign in first.");
        return;
      }
      applyPoints((prev) => prev + delta);
    },
    [applyPoints, userId]
  );

  return { points, addPoints, userId };
}
