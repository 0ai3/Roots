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

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: Props) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const translate = useMemo(() => createTranslator(locale), [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState((current) => {
      if (current === code) {
        return current;
      }
      const exists = SUPPORTED_LANGUAGES.some(
        (language) => language.code === code
      );
      return exists ? code : DEFAULT_LOCALE;
    });
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
