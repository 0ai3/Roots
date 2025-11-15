"use client";

import { createContext, useContext } from "react";
import type { LocaleCode } from "@/app/lib/i18n/languages";

type Translator = (key: string, replacements?: Record<string, string | number>) => string;

export type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
  languages: { code: LocaleCode; label: string }[];
  t: Translator;
};

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
