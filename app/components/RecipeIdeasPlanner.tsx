"use client";

import { FormEvent, useState } from "react";

type RecipeIdea = {
  name: string;
  region?: string;
  flavorProfile?: string;
  description?: string;
  keyIngredients?: string[];
  difficulty?: string;
  mapLink?: string;
  culturalNote?: string;
};

type RecipePayload = {
  intro?: string;
  recipes?: RecipeIdea[];
  closing?: string;
};

function parseRecipePayload(raw: string): RecipePayload | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    return JSON.parse(trimmed) as RecipePayload;
  } catch {
    return null;
  }
}

export default function RecipeIdeasPlanner() {
  const [country, setCountry] = useState("");
  const [zone, setZone] = useState("");
  const [dietaryFocus, setDietaryFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [limit, setLimit] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseContent, setResponseContent] = useState<RecipePayload | null>(null);

  const canSubmit =
    country.trim().length > 0 && zone.trim().length > 0 && !isLoading;

  async function fetchRecipes(options: { clearExisting?: boolean } = {}) {
    if (isLoading) {
      return;
    }
    if (!country.trim() || !zone.trim()) {
      setError("Country and zone are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    if (options.clearExisting) {
      setResponseContent(null);
    }

    try {
      const response = await fetch("/api/recipes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          zone,
          dietaryFocus,
          notes,
          limit,
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to reach the recipe guide.");
      }

      if (!data?.reply) {
        throw new Error("Gemini reply was empty. Try again.");
      }

      const parsed = parseRecipePayload(data.reply);
      if (!parsed) {
        throw new Error("Unexpected recipe response format.");
      }

      setResponseContent(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    await fetchRecipes({ clearExisting: true });
  }

  return (
    <section className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Country</span>
            <input
              type="text"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="e.g., Mexico, Japan, Morocco..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Zone / Region</span>
            <input
              type="text"
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              placeholder="e.g., Yucatán Peninsula, Kansai, Atlas Mountains..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Dietary focus (optional)</span>
          <input
            type="text"
            value={dietaryFocus}
            onChange={(event) => setDietaryFocus(event.target.value)}
            placeholder="Vegetarian, pescatarian, street food..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Extra notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Occasion, spice tolerance, ingredients to avoid..."
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-white/80">
          <span>Number of ideas</span>
          <input
            type="number"
            min={1}
            max={5}
            value={limit}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isNaN(next)) {
                setLimit(1);
              } else {
                setLimit(Math.min(Math.max(Math.floor(next), 1), 5));
              }
            }}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Gathering recipes..." : "Show recipes"}
          </button>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Powered by Google Gemini
          </p>
        </div>

        {error && (
          <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        )}
      </form>

      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        {!responseContent ? (
          <p className="text-sm text-white/60">
            Share a country and zone to discover a curated menu of regional dishes.
          </p>
        ) : (
          <RecipeResults
            payload={responseContent}
            onRegenerate={() => {
              void fetchRecipes();
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </section>
  );
}

function RecipeResults({
  payload,
  onRegenerate,
  isLoading,
}: {
  payload: RecipePayload;
  onRegenerate: () => void;
  isLoading: boolean;
}) {
  const recipes = payload.recipes ?? [];

  return (
    <div className="space-y-6">
      {payload.intro && <p className="text-base text-white/80">{payload.intro}</p>}

      {recipes.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {recipes.map((recipe) => (
            <article
              key={recipe.name}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div>
                <p className="text-lg font-semibold text-white">{recipe.name}</p>
                {recipe.region && (
                  <p className="text-xs uppercase tracking-wide text-white/40">
                    {recipe.region}
                  </p>
                )}
              </div>
              {recipe.flavorProfile && (
                <span className="inline-flex w-fit rounded-full border border-emerald-300/40 px-3 py-1 text-xs text-emerald-200">
                  {recipe.flavorProfile}
                </span>
              )}
              {recipe.description && (
                <p className="text-sm text-white/80">{recipe.description}</p>
              )}
              {Array.isArray(recipe.keyIngredients) && recipe.keyIngredients.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">
                    Key ingredients
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                    {recipe.keyIngredients.map((ingredient) => (
                      <li
                        key={ingredient}
                        className="rounded-full border border-white/10 px-3 py-1"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recipe.culturalNote && (
                <p className="text-sm text-white/70">{recipe.culturalNote}</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {recipe.difficulty && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.mapLink && (
                  <a
                    href={recipe.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    Map the region
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {payload.closing && (
        <p className="text-sm text-white/70">{payload.closing}</p>
      )}

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isLoading}
        className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Refreshing..." : "Show different recipes"}
      </button>
    </div>
  );
}
