"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { setStoredUserId } from "../lib/userId";
import { useI18n } from "@/app/hooks/useI18n";
import { CheckCircle, AlertCircle, Loader2, MapPin, Heart, ExternalLink } from "lucide-react";
import Image from "next/image";

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

type ProfileFields = {
  name: string;
  email: string;
  location: string;
  homeCountry: string;
  favoriteMuseums: string;
  favoriteRecipes: string;
  bio: string;
  socialHandle: string;
};

type ProfileResponse = Partial<ProfileFields> & {
  userId?: string | null;
  role?: string | null;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileMeta = {
  role: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  email: string;
};

type FavoriteAttraction = {
  attractionId: string;
  attraction: {
    id: string;
    title: string;
    location: string;
    category: string;
    rating: number;
    image: string;
    description: string;
  };
  createdAt: string;
};

const EMPTY_FORM: ProfileFields = {
  name: "",
  email: "",
  location: "",
  homeCountry: "",
  favoriteMuseums: "",
  favoriteRecipes: "",
  bio: "",
  socialHandle: "",
};

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(locale || undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProfileForm({ initialPoints, initialUserId }: Props = {}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme management
  useEffect(() => {
    const updateTheme = () => {
      try {
        const saved = localStorage.getItem("theme");
        if (saved) {
          const dark = saved === "dark";
          setIsDarkMode(dark);
          if (dark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        } else {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(systemDark);
          if (systemDark) {
            document.documentElement.classList.add("dark");
          }
        }
      } catch (e) {
        // ignore
      }
    };

    updateTheme();

    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDark);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Color utility functions
  const getBgColor = () => {
    return isDarkMode ? "bg-black" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-slate-900";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-white/70" : "text-slate-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-slate-200";
  };

  const getCardBg = () => {
    return isDarkMode ? "bg-white/5" : "bg-slate-50";
  };

  const getInputBg = () => {
    return isDarkMode ? "bg-black/40" : "bg-white";
  };

  const { points } = useExperiencePoints({ initialPoints, initialUserId });
  const { t, locale } = useI18n();
  const [formState, setFormState] = useState<ProfileFields>(EMPTY_FORM);
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>({
    role: null,
    createdAt: null,
    updatedAt: null,
    email: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [homeCountryValidation, setHomeCountryValidation] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [favorites, setFavorites] = useState<FavoriteAttraction[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/profile");
        const data = (await response.json().catch(() => null)) ?? {};
        if (!response.ok) {
          throw new Error(data?.error ?? t("profile.errors.load"));
        }
        const profile = (data?.profile ?? null) as ProfileResponse | null;
        if (!isActive) {
          return;
        }
        if (profile) {
          setFormState({
            name: profile.name ?? "",
            email: profile.email ?? "",
            location: profile.location ?? "",
            homeCountry: profile.homeCountry ?? "",
            favoriteMuseums: profile.favoriteMuseums ?? "",
            favoriteRecipes: profile.favoriteRecipes ?? "",
            bio: profile.bio ?? "",
            socialHandle: profile.socialHandle ?? "",
          });
          setProfileMeta({
            role: profile.role ?? "client",
            createdAt: profile.createdAt ?? null,
            updatedAt: profile.updatedAt ?? null,
            email: profile.email ?? "",
          });
          setStoredUserId(profile.userId ?? null);
          setStatusMessage(null);
        } else {
          setFormState(EMPTY_FORM);
          setProfileMeta({
            role: "client",
            createdAt: null,
            updatedAt: null,
            email: "",
          });
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        const message =
          error instanceof Error ? error.message : t("profile.errors.generic");
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [t]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      setLoadingFavorites(true);
      try {
        const response = await fetch("/api/attractions/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    loadFavorites();
  }, []);

  const removeFavorite = async (attractionId: string) => {
    try {
      const response = await fetch("/api/attractions/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attractionId }),
      });
      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.attractionId !== attractionId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Validate home country
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formState.homeCountry && formState.homeCountry.trim().length > 0) {
        validateHomeCountry(formState.homeCountry);
      } else {
        setHomeCountryValidation("idle");
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formState.homeCountry]);

  const validateHomeCountry = async (country: string) => {
    setHomeCountryValidation("validating");

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(
          country
        )}?fullText=false`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setHomeCountryValidation("valid");
        } else {
          setHomeCountryValidation("invalid");
        }
      } else {
        setHomeCountryValidation("invalid");
      }
    } catch (error) {
      console.error("Country validation error", error);
      setHomeCountryValidation("idle");
    }
  };

  const formattedCreatedAt = useMemo(
    () => formatDate(profileMeta?.createdAt ?? null, locale),
    [profileMeta?.createdAt, locale]
  );
  const formattedUpdatedAt = useMemo(
    () => formatDate(profileMeta?.updatedAt ?? null, locale),
    [profileMeta?.updatedAt, locale]
  );
  const formattedPoints = useMemo(
    () => points.toLocaleString(locale),
    [locale, points]
  );

  const normalizedRole = profileMeta?.role === "admin" ? "admin" : "client";
  const profileRoleLabel = useMemo(
    () =>
      normalizedRole === "admin"
        ? t("dashboard.roles.admin")
        : t("dashboard.roles.client"),
    [normalizedRole, t]
  );

  const handleChange =
    (field: keyof ProfileFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    // Check validation
    if (formState.homeCountry && homeCountryValidation === "invalid") {
      setErrorMessage(t("profile.errors.homeCountryInvalid"));
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        throw new Error(data?.error ?? t("profile.errors.save"));
      }
      const profile = (data?.profile ?? null) as ProfileResponse | null;
      if (profile) {
        setFormState({
          name: profile.name ?? "",
          email: profile.email ?? "",
          location: profile.location ?? "",
          homeCountry: profile.homeCountry ?? "",
          favoriteMuseums: profile.favoriteMuseums ?? "",
          favoriteRecipes: profile.favoriteRecipes ?? "",
          bio: profile.bio ?? "",
          socialHandle: profile.socialHandle ?? "",
        });
        setProfileMeta({
          role: profile.role ?? profileMeta?.role ?? "client",
          createdAt: profile.createdAt ?? profileMeta?.createdAt ?? null,
          updatedAt: profile.updatedAt ?? profileMeta?.updatedAt ?? null,
          email: profile.email ?? profileMeta?.email ?? "",
        });
        setStoredUserId(profile.userId ?? null);
      }
      setStatusMessage(t("profile.status.success"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("profile.status.error");
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormDisabled = isLoading || isSaving;

  const getValidationIcon = () => {
    switch (homeCountryValidation) {
      case "validating":
        return <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-white/40" />;
      case "valid":
        return <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <section className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}>
      <div className="space-y-8 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`rounded-3xl border p-5 ${getBorderColor()} ${getCardBg()}`}>
            <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
              {t("dashboard.content.pointsLabel")}
            </p>
            <p className={`text-4xl font-semibold ${getTextColor()}`}>{formattedPoints}</p>
            <p className={`text-xs ${getMutedTextColor()}`}>{t("profile.pointsHint")}</p>
          </div>

          <div className={`rounded-3xl border p-5 ${getBorderColor()} ${getCardBg()}`}>
            <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
              {t("profile.accountLabel")}
            </p>
            <p className={`text-base font-semibold ${getTextColor()}`}>{profileMeta?.email || "—"}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className={`uppercase tracking-wide ${getMutedTextColor()}`}>
                  {t("dashboard.content.roleLabel")}
                </dt>
                <dd className={`rounded-full border px-3 py-1 text-xs ${
                  isDarkMode 
                    ? "border-white/15 text-white" 
                    : "border-slate-300 text-slate-700"
                }`}>
                  {profileRoleLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className={`uppercase tracking-wide ${getMutedTextColor()}`}>
                  {t("dashboard.content.memberSince")}
                </dt>
                <dd className={getMutedTextColor()}>{formattedCreatedAt ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className={`uppercase tracking-wide ${getMutedTextColor()}`}>
                  {t("common.lastUpdated")}
                </dt>
                <dd className={getMutedTextColor()}>{formattedUpdatedAt ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {errorMessage && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            isDarkMode 
              ? "border-red-500/40 bg-red-500/10 text-red-200" 
              : "border-red-400/40 bg-red-400/10 text-red-700"
          }`}>
            {errorMessage}
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            isDarkMode 
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" 
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
          }`}>
            {statusMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`space-y-5 rounded-3xl border p-6 backdrop-blur ${getBorderColor()} ${getCardBg()}`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("profile.fields.name")}</span>
              <input
                type="text"
                value={formState.name}
                onChange={handleChange("name")}
                placeholder={t("profile.fields.namePlaceholder")}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                disabled={isFormDisabled}
                required
              />
            </label>

            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("profile.fields.email")}</span>
              <input
                type="email"
                value={formState.email}
                onChange={handleChange("email")}
                placeholder={t("profile.fields.emailPlaceholder")}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                disabled={isFormDisabled}
                required
              />
          </label>
        </div>

          <div className="grid gap-4 md:grid-cols-1">
            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("profile.fields.homeCountry")}</span>
              <div className="relative">
                <input
                  type="text"
                  value={formState.homeCountry}
                  onChange={handleChange("homeCountry")}
                  placeholder={t("profile.fields.homeCountryPlaceholder")}
                  className={`w-full rounded-2xl border px-4 py-3 pr-12 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${
                    homeCountryValidation === "invalid"
                      ? isDarkMode
                        ? "border-red-400/50 bg-red-950/20"
                        : "border-red-400/50 bg-red-50 text-red-900"
                      : homeCountryValidation === "valid"
                      ? isDarkMode
                        ? "border-emerald-400/50 bg-emerald-950/20"
                        : "border-emerald-400/50 bg-emerald-50 text-emerald-900"
                      : `${getBorderColor()} ${getInputBg()} ${getTextColor()}`
                  }`}
                  disabled={isFormDisabled}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getValidationIcon()}
                </div>
              </div>
              <p className={`text-xs ${getMutedTextColor()}`}>
                {t("profile.fields.homeCountryHelper")}
              </p>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("profile.fields.favoriteMuseums")}</span>
              <textarea
                value={formState.favoriteMuseums}
                onChange={handleChange("favoriteMuseums")}
                placeholder={t("profile.fields.favoriteMuseumsPlaceholder")}
                rows={4}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                disabled={isFormDisabled}
              />
            </label>

            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("profile.fields.favoriteRecipes")}</span>
              <textarea
                value={formState.favoriteRecipes}
                onChange={handleChange("favoriteRecipes")}
                placeholder={t("profile.fields.favoriteRecipesPlaceholder")}
                rows={4}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                disabled={isFormDisabled}
              />
            </label>
          </div>

          <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
            <span>{t("profile.fields.bio")}</span>
            <textarea
              value={formState.bio}
              onChange={handleChange("bio")}
              placeholder={t("profile.fields.bioPlaceholder")}
              rows={4}
              className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              disabled={isFormDisabled}
            />
          </label>

          <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
            <span>{t("profile.fields.socialHandle")}</span>
            <input
              type="text"
              value={formState.socialHandle}
              onChange={handleChange("socialHandle")}
              placeholder={t("profile.fields.socialHandlePlaceholder")}
              className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-emerald-300 focus:outline-none disabled:opacity-50 ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              disabled={isFormDisabled}
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isFormDisabled || (formState.homeCountry !== "" && homeCountryValidation === "invalid")}
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? t("profile.status.saving")
                : isLoading
                  ? t("profile.status.loading")
                  : t("profile.actions.save")}
            </button>
            <p className={`text-xs ${getMutedTextColor()}`}>
              {t("profile.actions.helper")}
            </p>
          </div>
        </form>

        {/* Favorite Attractions Section */}
        <div className={`space-y-4 rounded-3xl border p-6 backdrop-blur ${getBorderColor()} ${getCardBg()}`}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className={`w-5 h-5 ${isDarkMode ? "text-lime-400 fill-lime-400" : "text-emerald-600 fill-emerald-600"}`} />
            <h3 className={`text-xl font-semibold ${getTextColor()}`}>
              Favorite Attractions
            </h3>
          </div>

          {loadingFavorites ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-8 h-8 animate-spin ${getMutedTextColor()}`} />
            </div>
          ) : favorites.length === 0 ? (
            <div className={`text-center py-8 ${getMutedTextColor()}`}>
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No favorite attractions yet</p>
              <p className="text-xs mt-1">Visit the Attractions page to add favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav) => (
                <div
                  key={fav.attractionId}
                  className={`group relative overflow-hidden rounded-2xl border ${getBorderColor()} ${
                    isDarkMode ? "hover:border-lime-400/30" : "hover:border-emerald-400/50"
                  } transition-all`}
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={fav.attraction.image}
                      alt={fav.attraction.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 ${
                      isDarkMode
                        ? "bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent"
                        : "bg-linear-to-t from-white via-white/40 to-transparent"
                    }`} />
                    <button
                      onClick={() => removeFavorite(fav.attractionId)}
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                        isDarkMode
                          ? "bg-red-500/80 hover:bg-red-600/90"
                          : "bg-red-500/90 hover:bg-red-600"
                      }`}
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </button>
                  </div>
                  <div className={`p-4 ${getInputBg()}`}>
                    <h4 className={`font-semibold mb-1 ${getTextColor()} text-sm line-clamp-1`}>
                      {fav.attraction.title}
                    </h4>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className={`w-3 h-3 ${isDarkMode ? "text-lime-400" : "text-emerald-600"}`} />
                      <span className={`text-xs ${getMutedTextColor()} line-clamp-1`}>
                        {fav.attraction.location}
                      </span>
                    </div>
                    <p className={`text-xs ${getMutedTextColor()} line-clamp-2`}>
                      {fav.attraction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}