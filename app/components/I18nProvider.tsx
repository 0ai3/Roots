"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { I18nContext } from "@/app/hooks/useI18n";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type LocaleCode,
} from "@/app/lib/i18n/languages";
import { createTranslator } from "@/app/lib/i18n/translations";

type Props = {
  children: ReactNode;
  initialLocale?: LocaleCode;
};

function getStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  // Try localStorage first
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
      return stored as LocaleCode;
    }
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
  }

  // Try cookie as fallback
  try {
    const cookieMatch = document.cookie.match(
      new RegExp(`(^| )${LOCALE_STORAGE_KEY}=([^;]+)`)
    );
    if (cookieMatch) {
      const cookieLocale = cookieMatch[2];
      if (SUPPORTED_LANGUAGES.some((lang) => lang.code === cookieLocale)) {
        return cookieLocale as LocaleCode;
      }
    }
  } catch (e) {
    console.error("Failed to read from cookies:", e);
  }

  return DEFAULT_LOCALE;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: Props) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    // Initialize with stored locale if available on client
    if (typeof window !== "undefined") {
      return getStoredLocale();
    }
    return initialLocale;
  });
  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    const storedLocale = getStoredLocale();
    if (storedLocale !== locale) {
      setLocaleState(storedLocale);
    }
  }, []);

  // Persist locale changes
  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = locale;
    } catch (e) {
      console.error("Failed to persist locale:", e);
    }
  }, [locale, mounted]);

  const translate = useMemo(() => createTranslator(locale), [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    const exists = SUPPORTED_LANGUAGES.some(
      (language) => language.code === code
    );
    if (exists) {
      setLocaleState(code);

      // Immediate update for faster UX
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
          document.cookie = `${LOCALE_STORAGE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
          document.documentElement.lang = code;
        } catch (e) {
          console.error("Failed to set locale:", e);
        }
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      languages: SUPPORTED_LANGUAGES,
      t: translate,
    }),
    [locale, setLocale, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
