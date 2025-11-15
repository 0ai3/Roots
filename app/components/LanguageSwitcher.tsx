"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/hooks/useI18n";
import {
  LOCALE_STORAGE_KEY,
  type LocaleCode,
} from "@/app/lib/i18n/languages";

export default function LanguageSwitcher() {
  const { locale, setLocale, languages, t } = useI18n();
  const sortedLanguages = useMemo(
    () =>
      [...languages].sort((a, b) =>
        a.label.localeCompare(b.label, "en", { sensitivity: "base" })
      ),
    [languages]
  );
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: LocaleCode) => {
    setLocale(next);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_STORAGE_KEY}=${next}; path=/; max-age=31536000`;
    }
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <label className="fixed top-4 right-20 z-[9999] flex items-center gap-2 rounded-full border border-white/20 bg-neutral-900/70 px-4 py-2 text-xs text-white/80 shadow-lg backdrop-blur">
      <span className="sr-only">{t("languageSwitcher.label")}</span>
      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value as LocaleCode)}
        className="bg-transparent text-white/90 focus:outline-none disabled:opacity-60"
        aria-label={t("languageSwitcher.label")}
        disabled={isPending}
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
