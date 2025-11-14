export const USER_ID_EVENT = "roots:user-id-changed";

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies["roots_user"] || null;
}

export function setStoredUserId(userId: string | null) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USER_ID_EVENT, { detail: userId }));
  }
}
