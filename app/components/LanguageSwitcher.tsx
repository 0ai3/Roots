"use client";

import { useMemo } from "react";
import { useI18n } from "@/app/hooks/useI18n";
import type { LocaleCode } from "@/app/lib/i18n/languages";

export default function LanguageSwitcher() {
  const { locale, setLocale, languages, t } = useI18n();
  const sortedLanguages = useMemo(
    () =>
      [...languages].sort((a, b) =>
        a.label.localeCompare(b.label, "en", { sensitivity: "base" })
      ),
    [languages]
  );

  const handleChange = (next: LocaleCode) => {
    setLocale(next);
    // Force immediate re-render of all components
    window.location.reload();
  };

  return (
    <label className="fixed bottom-4 right-4 z-9999 flex items-center gap-2 rounded-full border border-white/20 bg-neutral-900/70 px-4 py-2 text-xs text-white/80 shadow-lg backdrop-blur">
      <span className="sr-only">{t("languageSwitcher.label")}</span>
      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value as LocaleCode)}
        className="bg-transparent text-white/90 focus:outline-none"
        aria-label={t("languageSwitcher.label")}
      >
        {sortedLanguages.map((language) => (
          <option
            key={language.code}
            value={language.code}
            className="text-neutral-900"
          >
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
