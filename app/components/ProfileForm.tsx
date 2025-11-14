"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getStoredUserId } from "../lib/userId";

type ProfileFormState = {
  name: string;
  email: string;
  location: string;
  favoriteMuseums: string;
  favoriteRecipes: string;
  bio: string;
  socialHandle: string;
};

type ProfileResponse = {
  name?: string;
  email?: string;
  location?: string;
  favoriteMuseums?: string;
  favoriteRecipes?: string;
  bio?: string;
  socialHandle?: string;
};

const DEFAULT_STATE: ProfileFormState = {
  name: "",
  email: "",
  location: "",
  favoriteMuseums: "",
  favoriteRecipes: "",
  bio: "",
  socialHandle: "",
};

export default function ProfileForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>(DEFAULT_STATE);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUserId();
    if (stored) {
      setUserId(stored);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const controller = new AbortController();
    (async () => {
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => null)) ?? {};
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load profile.");
        }

        if (data?.profile) {
          setFormState((prev) => ({
            ...prev,
            ...sanitizeProfileResponse(data.profile as ProfileResponse),
          }));
        }
        setStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load profile.";
        setError(message);
        setStatus("idle");
      }
    })();

    return () => {
      controller.abort();
    };
  }, [userId]);

  const isSaving = status === "saving";

  const completionRate = useMemo(() => {
    const filled = Object.values(formState).filter((value) => value.trim().length > 0).length;
    return Math.round((filled / Object.keys(formState).length) * 100);
  }, [formState]);

  function handleChange(field: keyof ProfileFormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
        }),
      });
      const data = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save profile.");
      }
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save profile.";
      setError(message);
      setStatus("idle");
    }
  }

  if (!userId) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
        Sign in to manage your Roots profile and experience points.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Profile completion ({completionRate}%)
          </p>
          <div className="mt-2 h-2 w-48 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-white/40">
          Your user ID: <span className="font-semibold">{userId ?? "…"}</span>
        </p>
      </div>

      <ProfileField
        label="Full name"
        value={formState.name}
        onChange={(value) => handleChange("name", value)}
        required
      />
      <ProfileField
        label="Email"
        type="email"
        value={formState.email}
        onChange={(value) => handleChange("email", value)}
        required
      />
      <ProfileField
        label="Home base"
        value={formState.location}
        onChange={(value) => handleChange("location", value)}
        placeholder="City, country"
      />
      <ProfileField
        label="Favorite museums or heritage sites"
        value={formState.favoriteMuseums}
        onChange={(value) => handleChange("favoriteMuseums", value)}
        placeholder="Separate with commas"
      />
      <ProfileField
        label="Recipes you love"
        value={formState.favoriteRecipes}
        onChange={(value) => handleChange("favoriteRecipes", value)}
        placeholder="What dishes define home for you?"
      />
      <ProfileField
        label="Bio"
        value={formState.bio}
        onChange={(value) => handleChange("bio", value)}
        placeholder="Share a few sentences about your culinary story."
        multiline
      />
      <ProfileField
        label="Social handle"
        value={formState.socialHandle}
        onChange={(value) => handleChange("socialHandle", value)}
        placeholder="@roots_traveler"
      />

      {error && (
        <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || !userId}
        className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving profile..." : "Save profile"}
      </button>
      {status === "success" && (
        <p className="text-center text-sm text-emerald-200">Profile updated!</p>
      )}
    </form>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  required?: boolean;
}) {
  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none";

  return (
    <label className="space-y-2 text-sm font-medium text-white/80">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
      )}
    </label>
  );
}

function sanitizeProfileResponse(payload: ProfileResponse): ProfileFormState {
  return {
    name: payload.name ?? "",
    email: payload.email ?? "",
    location: payload.location ?? "",
    favoriteMuseums: payload.favoriteMuseums ?? "",
    favoriteRecipes: payload.favoriteRecipes ?? "",
    bio: payload.bio ?? "",
    socialHandle: payload.socialHandle ?? "",
  };
}
