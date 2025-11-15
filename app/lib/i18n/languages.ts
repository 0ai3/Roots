export type LocaleCode =
  | "en"
  | "zh"
  | "es"
  | "hi"
  | "ar"
  | "pt"
  | "bn"
  | "ru"
  | "ja"
  | "de"
  | "fr"
  | "ur"
  | "id"
  | "it"
  | "tr";

export const SUPPORTED_LANGUAGES: { code: LocaleCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文 (简体)" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "bn", label: "বাংলা" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "ur", label: "اردو" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "it", label: "Italiano" },
  { code: "tr", label: "Türkçe" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "roots.locale";

export function isSupportedLocale(code: string | null | undefined): code is LocaleCode {
  if (!code) {
    return false;
  }
  return SUPPORTED_LANGUAGES.some((language) => language.code === code);
}

export function resolveLocale(input?: string | null): LocaleCode {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const normalized = input.toLowerCase();
  const exactMatch = SUPPORTED_LANGUAGES.find(
    (language) => language.code === normalized
  );
  if (exactMatch) {
    return exactMatch.code;
  }

  const startsWithMatch = SUPPORTED_LANGUAGES.find((language) =>
    normalized.startsWith(language.code)
  );
  if (startsWithMatch) {
    return startsWithMatch.code;
  }

  return DEFAULT_LOCALE;
}
