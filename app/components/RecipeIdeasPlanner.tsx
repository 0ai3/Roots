"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";

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

type RecipeDetail = {
  name: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  ingredients?: string[];
  steps?: string[];
  tips?: string;
};

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

function parseRecipePayload(raw: string): RecipePayload | null {
  let trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  // Gemini often wraps JSON replies in ```json fences; strip them if present.
  const codeFenceMatch = trimmed.match(/```(?:[\w-]+)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch) {
    trimmed = codeFenceMatch[1].trim();
  }

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as RecipePayload;
    } catch {
      return null;
    }
  };

  let parsed = tryParse(trimmed);
  if (parsed) {
    return parsed;
  }

  // As a last resort, grab the largest {...} section—which ignores any prose
  // Gemini might prepend/append—and try to parse that slice.
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    parsed = tryParse(trimmed.slice(start, end + 1));
  }

  return parsed;
}

export default function RecipeIdeasPlanner({ initialPoints, initialUserId }: Props = {}) {
  const [country, setCountry] = useState("");
  const [zone, setZone] = useState("");
  const [dietaryFocus, setDietaryFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseContent, setResponseContent] = useState<RecipePayload | null>(null);
  const { points, addPoints } = useExperiencePoints({ initialPoints, initialUserId });

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
          limit: 2,
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
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wide text-white/50">Experience points</p>
        <p className="text-3xl font-semibold text-white">{points}</p>
        <p className="text-xs text-white/50">Cook any recipe to earn +2 pts.</p>
      </div>
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
            country={country}
            zone={zone}
            notes={notes}
            dietaryFocus={dietaryFocus}
            onRecipeLogged={() => addPoints(2)}
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
  country,
  zone,
  notes,
  dietaryFocus,
  onRecipeLogged,
}: {
  payload: RecipePayload;
  onRegenerate: () => void;
  isLoading: boolean;
  country: string;
  zone: string;
  notes: string;
  dietaryFocus: string;
  onRecipeLogged: () => void;
}) {
  const recipes = payload.recipes ?? [];
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeIdea | null>(null);
  const [recipeDetail, setRecipeDetail] = useState<RecipeDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    "idle"
  );
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailCacheRef = useRef<Record<string, RecipeDetail>>({});
  const [completedRecipes, setCompletedRecipes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedRecipe(null);
    setRecipeDetail(null);
    detailCacheRef.current = {};
    setDetailStatus("idle");
    setDetailError(null);
    setCompletedRecipes({});
  }, [payload]);

  async function handleSelect(recipe: RecipeIdea) {
    setSelectedRecipe(recipe);
    setRecipeDetail(null);
    setDetailError(null);

    if (!recipe?.name) {
      setDetailStatus("idle");
      return;
    }

    const cacheKey = recipe.name;
    const cached = detailCacheRef.current[cacheKey];
    if (cached) {
      setRecipeDetail(cached);
      setDetailStatus("loaded");
      return;
    }

    setDetailStatus("loading");
    try {
      const response = await fetch("/api/recipes/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          zone,
          notes,
          dietaryFocus,
          recipeName: recipe.name,
          region: recipe.region,
          description: recipe.description,
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to fetch detailed instructions.");
      }

      if (!data?.detail) {
        throw new Error("Gemini details were empty. Try again.");
      }

      detailCacheRef.current[cacheKey] = data.detail;
      setRecipeDetail(data.detail);
      setDetailStatus("loaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error fetching the recipe steps.";
      setDetailStatus("error");
      setDetailError(message);
    }
  }

  const handleRecipeCompletion = (recipe: RecipeIdea | null) => {
    if (!recipe?.name) {
      return;
    }
    if (completedRecipes[recipe.name]) {
      return;
    }
    setCompletedRecipes((prev) => ({ ...prev, [recipe.name]: true }));
    onRecipeLogged();
  };

  const selectedRecipeLogged = selectedRecipe?.name
    ? Boolean(completedRecipes[selectedRecipe.name])
    : false;
  const hasSelection = Boolean(selectedRecipe);

  return (
    <div className="space-y-6">
      {recipes.length > 0 && !hasSelection && (
        <div className="grid gap-5 md:grid-cols-2">
          {recipes.map((recipe) => (
            <article
              key={recipe.name}
              className={`flex flex-col gap-4 rounded-3xl border bg-white/5 p-5 transition ${
                selectedRecipe?.name === recipe.name
                  ? "border-emerald-300/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                  : "border-white/10 hover:border-white/30"
              }`}
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
              <button
                type="button"
                onClick={() => {
                  void handleSelect(recipe);
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedRecipe?.name === recipe.name
                    ? "bg-emerald-400 text-slate-950"
                    : "border border-white/20 text-white hover:border-emerald-300 hover:text-emerald-200"
                }`}
              >
                {selectedRecipe?.name === recipe.name ? "Selected recipe" : "Choose this recipe"}
              </button>
            </article>
          ))}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
          {selectedRecipe ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Chosen recipe
              </p>
              <p className="text-xl font-semibold text-white">{selectedRecipe.name}</p>
              {selectedRecipe.description && (
                <p className="text-white/70">{selectedRecipe.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-white/40">
                {selectedRecipe.region && <span>{selectedRecipe.region}</span>}
                {selectedRecipe.mapLink && (
                  <a
                    href={selectedRecipe.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    Map the region
                  </a>
                )}
              </div>

              {detailStatus === "idle" && (
                <p className="text-sm text-white/70">
                  Tap “Choose this recipe” to see full step-by-step instructions.
                </p>
              )}

              {detailStatus === "loading" && (
                <p className="text-sm text-white/70">Gathering the cooking guide...</p>
              )}

              {detailStatus === "error" && detailError && (
                <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {detailError}
                </p>
              )}

              {recipeDetail && detailStatus === "loaded" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-xs text-white/60">
                    {recipeDetail.servings && <span>Servings: {recipeDetail.servings}</span>}
                    {recipeDetail.prepTime && <span>Prep: {recipeDetail.prepTime}</span>}
                    {recipeDetail.cookTime && <span>Cook: {recipeDetail.cookTime}</span>}
                  </div>

                  {Array.isArray(recipeDetail.ingredients) && recipeDetail.ingredients.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40">Ingredients</p>
                      <ul className="mt-2 grid gap-2 text-sm text-white/75 md:grid-cols-2">
                        {recipeDetail.ingredients.map((ingredient) => (
                          <li
                            key={ingredient}
                            className="rounded-2xl border border-white/10 px-3 py-2"
                          >
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(recipeDetail.steps) && recipeDetail.steps.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40">Step-by-step</p>
                      <ol className="mt-3 space-y-2 text-sm text-white/80">
                        {recipeDetail.steps.map((step, index) => (
                          <li key={step + index} className="rounded-2xl bg-white/5 p-3">
                            <span className="font-semibold text-emerald-200">
                              Step {index + 1}
                            </span>
                            <p className="mt-1">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipeDetail.tips && (
                    <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 px-4 py-3 text-sm text-emerald-100">
                      {recipeDetail.tips}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRecipeCompletion(selectedRecipe)}
                    disabled={selectedRecipeLogged}
                    className={`w-full rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      selectedRecipeLogged
                        ? "border border-emerald-300/40 text-emerald-200"
                        : "border border-white/20 text-white hover:border-emerald-300 hover:text-emerald-200"
                    }`}
                  >
                    {selectedRecipeLogged ? "Recipe logged (+2 pts)" : "I cooked this (+2 pts)"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>Select any card above to lock in the dish that speaks to you.</p>
          )}
        </div>
      )}

      {!hasSelection && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Show different recipes"}
        </button>
      )}
    </div>
  );
}
