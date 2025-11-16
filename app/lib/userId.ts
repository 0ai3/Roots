export const USER_ID_EVENT = "roots:user-id-changed";

let cachedUserId: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }
  return cachedUserId;
}

export async function fetchUserId(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  // Return cached value if available
  if (cachedUserId !== null) {
    return cachedUserId;
  }

  // Return existing promise if fetch is in progress
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start new fetch
  fetchPromise = (async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        cachedUserId = data.userId || null;
        if (cachedUserId) {
          window.dispatchEvent(new CustomEvent(USER_ID_EVENT, { detail: cachedUserId }));
        }
        return cachedUserId;
      } else {
        cachedUserId = null;
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch user ID:", error);
      cachedUserId = null;
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function setStoredUserId(userId: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  
  cachedUserId = userId;
  
  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent(USER_ID_EVENT, { detail: userId }));
}

export function clearCachedUserId() {
  cachedUserId = null;
  fetchPromise = null;
}
