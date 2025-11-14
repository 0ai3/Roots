"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getStoredProfileId,
  PROFILE_ID_EVENT,
  PROFILE_ID_STORAGE_KEY,
} from "../lib/profileId";

const POINTS_EVENT = "roots:experience-points";

export function useExperiencePoints() {
  const [profileId, setProfileId] = useState<string | null>(() => getStoredProfileId());
  const [points, setPoints] = useState(0);

  const syncProfileId = useCallback((next: string | null) => {
    setProfileId(next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleProfileEvent = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail ?? null;
      syncProfileId(detail);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === PROFILE_ID_STORAGE_KEY) {
        syncProfileId(event.newValue);
      }
    };

    window.addEventListener(PROFILE_ID_EVENT, handleProfileEvent as EventListener);
    window.addEventListener("storage", handleStorage);
    // Ensure we pick up any stored ID even if we mounted before login finalized.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncProfileId(getStoredProfileId());

    return () => {
      window.removeEventListener(PROFILE_ID_EVENT, handleProfileEvent as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncProfileId]);

  const broadcastPoints = useCallback((value: number) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(POINTS_EVENT, { detail: value }));
    }
  }, []);

  const persistPoints = useCallback(
    async (value: number) => {
      if (!profileId) {
        return;
      }
      try {
        await fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, points: value }),
        });
      } catch (error) {
        console.error("Failed to persist experience points", error);
      }
    },
    [profileId]
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
    if (!profileId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPoints(0);
      return;
    }

    let isActive = true;
    (async () => {
      try {
        const response = await fetch(`/api/points?profileId=${profileId}`);
        const data = (await response.json().catch(() => null)) ?? {};
        const fetched = Number(data?.points ?? 0);
        if (isActive) {
          applyPoints(Number.isFinite(fetched) ? fetched : 0, { persist: false });
        }
      } catch (error) {
        if (isActive) {
          setPoints(0);
        }
        console.error("Failed to load experience points", error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [profileId, applyPoints]);

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
      if (!profileId) {
        console.warn("Cannot add points without a profile ID. Please sign in first.");
        return;
      }
      applyPoints((prev) => prev + delta);
    },
    [applyPoints, profileId]
  );

  return { points, addPoints, profileId };
}
