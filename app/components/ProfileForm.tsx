"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { setStoredUserId } from "../lib/userId";

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

type ProfileFields = {
  name: string;
  email: string;
  location: string;
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

const EMPTY_FORM: ProfileFields = {
  name: "",
  email: "",
  location: "",
  favoriteMuseums: "",
  favoriteRecipes: "",
  bio: "",
  socialHandle: "",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProfileForm({ initialPoints, initialUserId }: Props = {}) {
  const { points } = useExperiencePoints({ initialPoints, initialUserId });
  const [formState, setFormState] = useState<ProfileFields>(EMPTY_FORM);
  const [profileMeta, setProfileMeta] = useState<
    Pick<ProfileResponse, "role" | "createdAt" | "updatedAt" | "email">
  >({
    role: null,
    createdAt: null,
    updatedAt: null,
    email: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/profile");
        const data = (await response.json().catch(() => null)) ?? {};
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load your profile.");
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
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
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
  }, []);

  const formattedCreatedAt = useMemo(
    () => formatDate(profileMeta?.createdAt ?? null),
    [profileMeta?.createdAt]
  );
  const formattedUpdatedAt = useMemo(
    () => formatDate(profileMeta?.updatedAt ?? null),
    [profileMeta?.updatedAt]
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
        throw new Error(data?.error ?? "Unable to save your profile.");
      }
      const profile = (data?.profile ?? null) as ProfileResponse | null;
      if (profile) {
        setFormState({
          name: profile.name ?? "",
          email: profile.email ?? "",
          location: profile.location ?? "",
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
      setStatusMessage("Profile saved successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your profile right now.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormDisabled = isLoading || isSaving;

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wide text-white/50">Experience points</p>
          <p className="text-4xl font-semibold text-white">{points}</p>
          <p className="text-xs text-white/50">
            Earn more points by logging attractions and recipes.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wide text-white/50">Account</p>
          <p className="text-base font-semibold text-white">{profileMeta?.email || "—"}</p>
          <dl className="mt-4 space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <dt className="uppercase tracking-wide text-white/40">Role</dt>
              <dd className="rounded-full border border-white/15 px-3 py-1 text-xs text-white">
                {profileMeta?.role ?? "client"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="uppercase tracking-wide text-white/40">Member since</dt>
              <dd>{formattedCreatedAt ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="uppercase tracking-wide text-white/40">Last updated</dt>
              <dd>{formattedUpdatedAt ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      {statusMessage && !errorMessage && (
        <p className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {statusMessage}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Name</span>
            <input
              type="text"
              value={formState.name}
              onChange={handleChange("name")}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
              disabled={isFormDisabled}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
              disabled={isFormDisabled}
              required
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Location</span>
          <input
            type="text"
            value={formState.location}
            onChange={handleChange("location")}
            placeholder="City, Country"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
            disabled={isFormDisabled}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Favorite museums</span>
            <textarea
              value={formState.favoriteMuseums}
              onChange={handleChange("favoriteMuseums")}
              placeholder="Tell us about galleries or exhibits you love."
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
              disabled={isFormDisabled}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Favorite recipes</span>
            <textarea
              value={formState.favoriteRecipes}
              onChange={handleChange("favoriteRecipes")}
              placeholder="Share signature dishes or family recipes."
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
              disabled={isFormDisabled}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Bio</span>
          <textarea
            value={formState.bio}
            onChange={handleChange("bio")}
            placeholder="Share your travel memories, passions, or anything Roots should know."
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
            disabled={isFormDisabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Social handle</span>
          <input
            type="text"
            value={formState.socialHandle}
            onChange={handleChange("socialHandle")}
            placeholder="@roots_explorer"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none disabled:opacity-50"
            disabled={isFormDisabled}
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isFormDisabled}
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : isLoading ? "Loading..." : "Save profile"}
          </button>
          <p className="text-xs text-white/60">
            Your info powers personalized travel and food ideas.
          </p>
        </div>
      </form>
    </section>
  );
}
