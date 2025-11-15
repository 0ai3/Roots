import { cookies, headers } from "next/headers";
import {
  LOCALE_STORAGE_KEY,
  resolveLocale,
  type LocaleCode,
} from "./languages";

export async function getRequestLocale(): Promise<LocaleCode> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore?.get?.(LOCALE_STORAGE_KEY)?.value;
    if (raw) {
      return resolveLocale(raw);
    }
  } catch {
    // ignore cookie failures
  }

  try {
    const cookieHeader = (await headers()).get("cookie");
    if (cookieHeader) {
      const entries = cookieHeader.split(";").map((entry) => entry.trim());
      for (const entry of entries) {
        if (entry.startsWith(`${LOCALE_STORAGE_KEY}=`)) {
          const value = entry.split("=")[1] ?? "";
          return resolveLocale(decodeURIComponent(value));
        }
      }
    }
  } catch {
    // ignore header failures
  }

  return resolveLocale(null);
}
