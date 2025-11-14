export const PROFILE_ID_STORAGE_KEY = "rootsProfileId";
export const PROFILE_ID_EVENT = "roots:profile-id-changed";

export function getStoredProfileId() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(PROFILE_ID_STORAGE_KEY);
}

export function setStoredProfileId(profileId: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (profileId) {
    window.localStorage.setItem(PROFILE_ID_STORAGE_KEY, profileId);
  } else {
    window.localStorage.removeItem(PROFILE_ID_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(PROFILE_ID_EVENT, { detail: profileId }));
}
