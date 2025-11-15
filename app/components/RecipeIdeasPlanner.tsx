"use client";

import { FormEvent, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { Loader2 } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type RecipeSuggestion = {
  name: string;
  region?: string;
  flavorProfile?: string;
  description?: string;
  keyIngredients?: string[];
  difficulty?: string;
  culturalNote?: string;
  mapLink?: string;
};

type AssistantPayload = {
  intro?: string;
  tips?: string[];
  recipes?: RecipeSuggestion[];
  closing?: string;
};

type CookedMap = Record<string, boolean>;

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

const samplePrompts = [
  "Plan a plant-based tasting menu.",
  "Give me two celebratory seafood dishes.",
  "Suggest cozy comfort food from the Alps.",
  "Street food ideas for a summer night market.",
];

function stripCodeFences(raw: string) {
  const match = raw.match(/```(?:[\w-]+)?\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : raw;
}

function parseAssistantContent(raw: string): AssistantPayload | null {
  let trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  trimmed = stripCodeFences(trimmed);

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as AssistantPayload;
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  if (direct) {
    return direct;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return tryParse(trimmed.slice(start, end + 1));
  }

  return null;
}

function createMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function MessageBubble({
  message,
  onLogRecipe,
  cookedRecipes,
}: {
  message: ChatMessage;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
}) {
  if (message.role === "assistant") {
    const parsed = parseAssistantContent(message.content);
    if (parsed) {
      return (
        <AssistantCard
          payload={parsed}
          onLogRecipe={onLogRecipe}
          cookedRecipes={cookedRecipes}
        />
      );
    }
  }

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-2xl rounded-3xl border px-5 py-4 text-sm leading-relaxed shadow-md ${
          message.role === "user"
            ? "border-amber-400/50 bg-amber-400/10 text-amber-50"
            : "border-white/10 bg-white/5 text-white/90"
        }`}
      >
        <p className="mb-2 text-xs uppercase tracking-wide opacity-60">
          {message.role === "user" ? "You" : "Roots Test Kitchen"}
        </p>
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}

function AssistantCard({
  payload,
  onLogRecipe,
  cookedRecipes,
}: {
  payload: AssistantPayload;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
}) {
  const tips = payload.tips?.filter(Boolean) ?? [];
  const recipes = payload.recipes ?? [];

  return (
    <div className="rounded-3xl border border-amber-200/30 bg-slate-900/70 p-6 shadow-xl">
      {payload.intro && <p className="text-base text-amber-50">{payload.intro}</p>}

      {tips.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-white/40">Chef tips</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
            {tips.map((tip) => (
              <li key={tip} className="rounded-full border border-white/10 px-3 py-1">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-8 space-y-4">
          {recipes.map((recipe) => (
            <article
              key={recipe.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-white">{recipe.name}</p>
                  {recipe.region && (
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {recipe.region}
                    </p>
                  )}
                </div>
                {recipe.flavorProfile && (
                  <span className="rounded-full border border-amber-200/40 px-3 py-1 text-xs text-amber-100">
                    {recipe.flavorProfile}
                  </span>
                )}
              </div>

              {recipe.description && (
                <p className="mt-3 text-sm text-white/80">{recipe.description}</p>
              )}

              {Array.isArray(recipe.keyIngredients) && recipe.keyIngredients.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">Key ingredients</p>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                    {recipe.keyIngredients.map((ingredient) => (
                      <li key={ingredient} className="rounded-full border border-white/10 px-3 py-1">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.culturalNote && (
                <p className="mt-3 text-sm text-white/70">{recipe.culturalNote}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                {recipe.difficulty && (
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.mapLink && (
                  <a
                    href={recipe.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-200 hover:text-amber-100"
                  >
                    Map the region
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => onLogRecipe(recipe.name)}
                disabled={Boolean(cookedRecipes[recipe.name])}
                className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  cookedRecipes[recipe.name]
                    ? "border border-amber-200/40 text-amber-100"
                    : "border border-white/20 text-white hover:border-amber-200 hover:text-amber-100"
                }`}
              >
                {cookedRecipes[recipe.name] ? "Recipe logged (+2 pts)" : "I cooked this (+2 pts)"}
              </button>
            </article>
          ))}
        </div>
      )}

      {payload.closing && (
        <p className="mt-6 text-sm text-white/70">{payload.closing}</p>
      )}
    </div>
  );
}

export default function RecipeIdeasPlanner({ initialPoints, initialUserId }: Props = {}) {
  const [country, setCountry] = useState("");
  const [zone, setZone] = useState("");
  const [dietaryFocus, setDietaryFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState("I want to cook dishes that feel rooted in the region.");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookedRecipes, setCookedRecipes] = useState<CookedMap>({});
  const { points, addPoints } = useExperiencePoints({ initialPoints, initialUserId });

  const hasAssistantReply = messages.some((message) => message.role === "assistant");
  const showSetupForm = !hasAssistantReply;

  const canSubmit =
    country.trim().length > 0 &&
    zone.trim().length > 0 &&
    input.trim().length > 0 &&
    !isLoading;

  const handleLogRecipe = (name: string) => {
    if (!name || cookedRecipes[name]) {
      return;
    }
    setCookedRecipes((prev) => ({ ...prev, [name]: true }));
    addPoints(2);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          zone,
          dietaryFocus,
          notes,
          limit: 3,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to reach the culinary guide.");
      }

      if (!data?.reply) {
        throw new Error("Gemini reply was empty. Try asking again.");
      }

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    setMessages([]);
    setInput("I want to cook dishes that feel rooted in the region.");
    setCountry("");
    setZone("");
    setDietaryFocus("");
    setNotes("");
    setError(null);
    setIsLoading(false);
    setCookedRecipes({});
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wide text-white/50">Experience points</p>
        <p className="text-3xl font-semibold text-white">{points}</p>
        <p className="text-xs text-white/50">Cook any recipe to earn +2 pts.</p>
      </div>

      {showSetupForm && (
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
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>Zone / Region</span>
              <input
                type="text"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                placeholder="e.g., Yucatán Peninsula, Kansai, Atlas Mountains..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
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
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Extra notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Occasion, spice tolerance, ingredients to avoid..."
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>What would you like to ask?</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for pairings, cooking styles, or celebratory menus..."
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Gathering recipes..." : "Plan menu"}
            </button>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Powered by Google Gemini
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-white/70">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-white/20 px-4 py-2 transition hover:border-amber-200 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          )}
        </form>
      )}

      <div
        className={`rounded-3xl border border-white/10 p-6 ${
          showSetupForm
            ? "bg-slate-950/50"
            : "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),rgba(2,6,23,0.95))]"
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
              {showSetupForm ? "Conversation" : "Roots Test Kitchen"}
            </p>
            <p className="text-xs text-white/40">
              {showSetupForm
                ? "Share more context to curate your tasting menu."
                : "Keep iterating with your culinary guide."}
            </p>
          </div>
          {hasAssistantReply && (
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {country || "Country set"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {zone || "Region set"}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-rose-300 hover:text-white"
              >
                Reset menu
              </button>
            </div>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                <p className="text-sm text-white/60">Crafting your culinary experience...</p>
              </div>
            ) : (
              <p className="text-sm text-white/60">
                {showSetupForm
                  ? "Fill out the form and ask a question to unlock personalized dishes."
                  : "Waiting for the Roots Test Kitchen to respond..."}
              </p>
            )}
          </div>
        ) : (
          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onLogRecipe={handleLogRecipe}
                cookedRecipes={cookedRecipes}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                <p className="text-sm text-white/70">Roots Test Kitchen is thinking...</p>
              </div>
            )}
          </div>
        )}

        {error && !showSetupForm && (
          <p className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        )}

        {hasAssistantReply && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for substitutions, plating ideas, or follow-up dishes..."
              rows={3}
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
              <span>Powered by Google Gemini</span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
