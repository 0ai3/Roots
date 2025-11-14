"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getStoredUserId,
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

    const handleProfileEvent = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail ?? null;
      syncUserId(detail);
    };

    window.addEventListener(USER_ID_EVENT, handleProfileEvent as EventListener);
    // Ensure we pick up any stored ID even if we mounted before login finalized.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncUserId(getStoredUserId());

    return () => {
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

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPoints(0);
      return;
    }

    let isActive = true;
    (async () => {
      try {
        const response = await fetch("/api/points");
        const data = (await response.json().catch(() => null)) ?? {};
        const fetched = Number(data?.points ?? 0);
        if (isActive) {
          applyPoints(Number.isFinite(fetched) ? fetched : 0, { persist: false });
        }
      } catch (error) {
        if (isActive) {
          setPoints(0);
        }
        console.error("Failed to load points", error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [userId, applyPoints]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === "number") {
        setPoints(detail);
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
