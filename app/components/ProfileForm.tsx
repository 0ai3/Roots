"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { setStoredUserId } from "../lib/userId";
import { useI18n } from "../../app/hooks/useI18n";
import { Loader2, MapPin, Heart, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
        error instanceof Error ? error.message : t("profile.errors.save");
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
    <div className="relative min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80"
            alt="Profile background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-6"
          >
            <Heart className="w-4 h-4 text-lime-400" />
            <span className="text-sm font-medium text-lime-400">
              Your Cultural Profile
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Manage Your{" "}
            <span className="text-lime-400">Profile</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Update your information and track your cultural journey
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-20 -mt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-lime-400/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">
                    {t("dashboard.content.pointsLabel")}
                  </p>
                  <p className="text-3xl font-bold text-white">{formattedPoints}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">{t("profile.pointsHint")}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">
                    {t("profile.accountLabel")}
                  </p>
                  <p className="text-base font-semibold text-white truncate">{profileMeta?.email || "—"}</p>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">
                    {t("dashboard.content.roleLabel")}
                  </dt>
                  <dd className="rounded-full border px-3 py-1 text-xs border-lime-400/30 bg-lime-400/10 text-lime-400">
                    {profileRoleLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">
                    {t("dashboard.content.memberSince")}
                  </dt>
                  <dd className="text-white/80">{formattedCreatedAt ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">
                    {t("common.lastUpdated")}
                  </dt>
                  <dd className="text-white/80">{formattedUpdatedAt ?? "—"}</dd>
                </div>
              </dl>
            </motion.div>
          </motion.div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-200 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              {errorMessage}
            </motion.div>
          )}

          {statusMessage && !errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl px-5 py-4 text-sm text-emerald-200 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              {statusMessage}
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-400/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Personal Information</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("profile.fields.name")}</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={handleChange("name")}
                  placeholder={t("profile.fields.namePlaceholder")}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white"
                  disabled={isFormDisabled}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("profile.fields.email")}</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  placeholder={t("profile.fields.emailPlaceholder")}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white"
                  disabled={isFormDisabled}
                  required
                />
            </label>
          </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-400">{t("profile.fields.homeCountry")}</span>
              <div className="relative">
                <input
                  type="text"
                  value={formState.homeCountry}
                  onChange={handleChange("homeCountry")}
                  placeholder={t("profile.fields.homeCountryPlaceholder")}
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-base placeholder:text-neutral-600 focus:outline-none disabled:opacity-50 transition-all ${
                    homeCountryValidation === "invalid"
                      ? "border-red-400/50 bg-red-950/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      : homeCountryValidation === "valid"
                      ? "border-emerald-400/50 bg-emerald-950/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      : "border-neutral-700 bg-neutral-800/50 text-white focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                  }`}
                  disabled={isFormDisabled}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getValidationIcon()}
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                {t("profile.fields.homeCountryHelper")}
              </p>
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("profile.fields.favoriteMuseums")}</span>
                <textarea
                  value={formState.favoriteMuseums}
                  onChange={handleChange("favoriteMuseums")}
                  placeholder={t("profile.fields.favoriteMuseumsPlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white resize-none"
                  disabled={isFormDisabled}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("profile.fields.favoriteRecipes")}</span>
                <textarea
                  value={formState.favoriteRecipes}
                  onChange={handleChange("favoriteRecipes")}
                  placeholder={t("profile.fields.favoriteRecipesPlaceholder")}
                  rows={4}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white resize-none"
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-400">{t("profile.fields.bio")}</span>
              <textarea
                value={formState.bio}
                onChange={handleChange("bio")}
                placeholder={t("profile.fields.bioPlaceholder")}
                rows={4}
                className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white resize-none"
                disabled={isFormDisabled}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-400">{t("profile.fields.socialHandle")}</span>
              <input
                type="text"
                value={formState.socialHandle}
                onChange={handleChange("socialHandle")}
                placeholder={t("profile.fields.socialHandlePlaceholder")}
                className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 focus:outline-none disabled:opacity-50 transition-all border-neutral-700 bg-neutral-800/50 text-white"
                disabled={isFormDisabled}
              />
            </label>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-800">
              <button
                type="submit"
                disabled={isFormDisabled || (formState.homeCountry !== "" && homeCountryValidation === "invalid")}
                className="px-8 py-3 bg-lime-400 text-black rounded-xl font-semibold transition-all hover:bg-lime-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("profile.status.saving")}
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("profile.status.loading")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t("profile.actions.save")}
                  </>
                )}
              </button>
              <p className="text-xs text-neutral-500">
                {t("profile.actions.helper")}
              </p>
            </div>
          </motion.form>

          {/* Favorite Attractions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-pink-400/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Favorite Attractions
              </h3>
            </div>

            {loadingFavorites ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-neutral-600" />
                </div>
                <p className="text-base font-medium text-white mb-1">No favorite attractions yet</p>
                <p className="text-sm text-neutral-500">Visit the Attractions page to add favorites</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav, index) => (
                  <motion.div
                    key={fav.attractionId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden rounded-xl border border-neutral-800 hover:border-lime-400/50 transition-all bg-neutral-800/30"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={fav.attraction.image}
                        alt={fav.attraction.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                      <button
                        onClick={() => removeFavorite(fav.attractionId)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all bg-red-500/90 hover:bg-red-600 hover:scale-110"
                        title="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold mb-2 text-white text-base line-clamp-1">
                        {fav.attraction.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-neutral-400 line-clamp-1">
                          {fav.attraction.location}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 line-clamp-2">
                        {fav.attraction.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
