"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { useI18n } from "@/app/hooks/useI18n";
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
type RecipeDetail = {
  name: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  ingredients?: string[];
  steps?: string[];
  tips?: string;
};
type RecipeDetailState = {
  status: "idle" | "loading" | "ready" | "error";
  detail?: RecipeDetail;
  error?: string | null;
  isSpeaking?: boolean;
  speechError?: string | null;
  audioUrl?: string | null;
  audioDuration?: number;
  audioCurrentTime?: number;
  isAudioPlaying?: boolean;
};
type RecipeDetailMap = Record<string, RecipeDetailState>;

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

type Translator = ReturnType<typeof useI18n>["t"];

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

function buildSpeechScript(detail: RecipeDetail) {
  const parts: string[] = [];
  if (detail.name) {
    parts.push(detail.name);
  }
  if (detail.servings) {
    parts.push(`Serves ${detail.servings}.`);
  }
  if (detail.prepTime || detail.cookTime) {
    const timeBits = [detail.prepTime, detail.cookTime].filter(Boolean).join(" and ");
    if (timeBits) {
      parts.push(`Timing: ${timeBits}.`);
    }
  }
  if (detail.ingredients?.length) {
    parts.push("Ingredients:");
    detail.ingredients.forEach((ingredient, index) => {
      parts.push(`Ingredient ${index + 1}: ${ingredient}.`);
    });
  }
  if (detail.steps?.length) {
    parts.push("Steps:");
    detail.steps.forEach((step, index) => {
      parts.push(`Step ${index + 1}: ${step}.`);
    });
  }
  if (detail.tips) {
    parts.push(`Chef tip: ${detail.tips}`);
  }
  return parts.join(" ");
}

function MessageBubble({
  message,
  onLogRecipe,
  cookedRecipes,
  t,
  onSelectRecipe,
  recipeDetails,
  onListenToRecipe,
  isDarkMode,
}: {
  message: ChatMessage;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
  t: Translator;
  onSelectRecipe: (recipe: RecipeSuggestion) => void;
  recipeDetails: RecipeDetailMap;
  onListenToRecipe: (recipeName: string) => void;
  isDarkMode: boolean;
}) {
  if (message.role === "assistant") {
    const parsed = parseAssistantContent(message.content);
    if (parsed) {
      return (
        <AssistantCard
          payload={parsed}
          onLogRecipe={onLogRecipe}
          cookedRecipes={cookedRecipes}
          t={t}
          onSelectRecipe={onSelectRecipe}
          recipeDetails={recipeDetails}
          onListenToRecipe={onListenToRecipe}
          isDarkMode={isDarkMode}
        />
      );
    }
  }

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-2xl rounded-3xl border px-5 py-4 text-sm leading-relaxed shadow-md ${
          message.role === "user"
            ? "border-amber-400/50 bg-amber-400/10 text-amber-800 dark:text-amber-50"
            : isDarkMode 
              ? "border-white/10 bg-white/5 text-white/90"
              : "border-slate-200 bg-slate-50 text-slate-900"
        }`}
      >
        <p className={`mb-2 text-xs uppercase tracking-wide ${
          message.role === "user" 
            ? "text-amber-700 dark:text-amber-300" 
            : isDarkMode 
              ? "text-white/60" 
              : "text-slate-600"
        }`}>
          {message.role === "user" ? t("planner.roles.you") : t("planner.roles.kitchen")}
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
  t,
  onSelectRecipe,
  recipeDetails,
  onListenToRecipe,
  isDarkMode,
}: {
  payload: AssistantPayload;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
  t: Translator;
  onSelectRecipe: (recipe: RecipeSuggestion) => void;
  recipeDetails: RecipeDetailMap;
  onListenToRecipe: (recipeName: string) => void;
  isDarkMode: boolean;
}) {
  const tips = payload.tips?.filter(Boolean) ?? [];
  const recipes = payload.recipes ?? [];

  return (
    <div className={`rounded-3xl border p-6 shadow-xl ${
      isDarkMode 
        ? "border-amber-200/30 bg-slate-900/70" 
        : "border-amber-300/30 bg-amber-50/50"
    }`}>
      {payload.intro && (
        <p className={`text-base ${
          isDarkMode ? "text-amber-50" : "text-slate-900"
        }`}>
          {payload.intro}
        </p>
      )}

      {tips.length > 0 && (
        <div className="mt-6">
          <p className={`text-xs uppercase tracking-wide ${
            isDarkMode ? "text-white/40" : "text-slate-600"
          }`}>
            {t("planner.recipes.chefTips")}
          </p>
          <ul className={`mt-3 flex flex-wrap gap-2 text-sm ${
            isDarkMode ? "text-white/70" : "text-slate-700"
          }`}>
            {tips.map((tip) => (
              <li key={tip} className={`rounded-full border px-3 py-1 ${
                isDarkMode ? "border-white/10" : "border-slate-300"
              }`}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-8 space-y-4">
          {recipes.map((recipe) => {
            const detailState = recipeDetails[recipe.name] ?? { status: "idle" as const };
            const isLoadingDetail = detailState.status === "loading";
            const hasDetail = detailState.status === "ready" && Boolean(detailState.detail);
            const selectLabel = isLoadingDetail
              ? t("planner.recipes.detailLoading")
              : hasDetail
                ? t("planner.recipes.detailSelected")
                : t("planner.recipes.selectButton");

            return (
              <article
                key={recipe.name}
                className={`rounded-2xl border p-5 ${
                  isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}>
                      {recipe.name}
                    </p>
                    {recipe.region && (
                      <p className={`text-xs uppercase tracking-wide ${
                        isDarkMode ? "text-white/40" : "text-slate-600"
                      }`}>
                        {recipe.region}
                      </p>
                    )}
                  </div>
                  {recipe.flavorProfile && (
                    <span className={`rounded-full border px-3 py-1 text-xs ${
                      isDarkMode 
                        ? "border-amber-200/40 text-amber-100" 
                        : "border-amber-400/40 text-amber-700"
                    }`}>
                      {recipe.flavorProfile}
                    </span>
                  )}
                </div>

                {recipe.description && (
                  <p className={`mt-3 text-sm ${
                    isDarkMode ? "text-white/80" : "text-slate-700"
                  }`}>
                    {recipe.description}
                  </p>
                )}

                {Array.isArray(recipe.keyIngredients) && recipe.keyIngredients.length > 0 && (
                  <div className="mt-4">
                    <p className={`text-xs uppercase tracking-wide ${
                      isDarkMode ? "text-white/40" : "text-slate-600"
                    }`}>
                      {t("planner.recipes.keyIngredients")}
                    </p>
                    <ul className={`mt-2 flex flex-wrap gap-2 text-xs ${
                      isDarkMode ? "text-white/70" : "text-slate-700"
                    }`}>
                      {recipe.keyIngredients.map((ingredient) => (
                        <li key={ingredient} className={`rounded-full border px-3 py-1 ${
                          isDarkMode ? "border-white/10" : "border-slate-300"
                        }`}>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.culturalNote && (
                  <p className={`mt-3 text-sm ${
                    isDarkMode ? "text-white/70" : "text-slate-600"
                  }`}>
                    {recipe.culturalNote}
                  </p>
                )}

                <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${
                  isDarkMode ? "text-white/60" : "text-slate-600"
                }`}>
                  {recipe.difficulty && (
                    <span className={`rounded-full border px-3 py-1 ${
                      isDarkMode ? "border-white/15" : "border-slate-300"
                    }`}>
                      {recipe.difficulty}
                    </span>
                  )}
                  {recipe.mapLink && (
                    <a
                      href={recipe.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-600 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                    >
                      {t("planner.recipes.mapLink")}
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe)}
                    disabled={isLoadingDetail || hasDetail}
                    className={`rounded-full px-4 py-2 transition ${
                      hasDetail
                        ? isDarkMode
                          ? "border border-emerald-400/60 text-emerald-100"
                          : "border border-emerald-500/60 text-emerald-700"
                        : isDarkMode
                          ? "border border-white/30 text-white hover:border-amber-200 hover:text-amber-100 disabled:opacity-60"
                          : "border border-slate-400 text-slate-700 hover:border-amber-400 hover:text-amber-600 disabled:opacity-60"
                    }`}
                  >
                    {selectLabel}
                  </button>
                </div>

                {detailState.status === "error" && detailState.error && (
                  <p className={`mt-3 rounded-2xl border px-4 py-3 text-xs ${
                    isDarkMode 
                      ? "border-rose-400/40 bg-rose-400/10 text-rose-100" 
                      : "border-rose-400/40 bg-rose-400/10 text-rose-700"
                  }`}>
                    {detailState.error}
                  </p>
                )}

                {hasDetail && detailState.detail && (
                  <RecipeDetailPanel
                    detail={detailState.detail}
                    onListen={() => onListenToRecipe(recipe.name)}
                    onPause={() => handlePauseRecipeAudio(recipe.name)}
                    onSeek={(value) => (recipe.name, value)}
                    audioState={{
                      isGenerating: Boolean(detailState.isSpeaking),
                      isPlaying: Boolean(detailState.isAudioPlaying),
                      duration: detailState.audioDuration ?? 0,
                      currentTime: detailState.audioCurrentTime ?? 0,
                      hasAudio: Boolean(detailState.audioUrl),
                    }}
                    onLogRecipe={() => onLogRecipe(recipe.name)}
                    isCooked={Boolean(cookedRecipes[recipe.name])}
                    speechError={detailState.speechError}
                    t={t}
                    isDarkMode={isDarkMode}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}

      {payload.closing && (
        <p className={`mt-6 text-sm ${
          isDarkMode ? "text-white/70" : "text-slate-600"
        }`}>
          {payload.closing}
        </p>
      )}
    </div>
  );
}

type RecipeAudioState = {
  isGenerating: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  hasAudio: boolean;
};

function RecipeDetailPanel({
  detail,
  onListen,
  onPause,
  onSeek,
  audioState,
  speechError,
  t,
  onLogRecipe,
  isCooked,
  isDarkMode,
}: {
  detail: RecipeDetail;
  onListen: () => void;
  onPause: () => void;
  onSeek: (value: number) => void;
  audioState: RecipeAudioState;
  speechError?: string | null;
  t: Translator;
  onLogRecipe: () => void;
  isCooked: boolean;
  isDarkMode: boolean;
}) {
  const ingredients = detail.ingredients?.filter(Boolean) ?? [];
  const steps = detail.steps?.filter(Boolean) ?? [];
  const scrubberId = `audio-scrubber-${detail.name.replace(/\s+/g, "-").toLowerCase()}`;
  const metaChips = [
    detail.servings ? `${t("planner.recipes.servingsLabel")}: ${detail.servings}` : null,
    detail.prepTime ? `${t("planner.recipes.prepTimeLabel")}: ${detail.prepTime}` : null,
    detail.cookTime ? `${t("planner.recipes.cookTimeLabel")}: ${detail.cookTime}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className={`mt-5 space-y-4 rounded-2xl border p-4 text-sm ${
      isDarkMode 
        ? "border-amber-200/20 bg-slate-950/40 text-white/80" 
        : "border-amber-300/20 bg-amber-50 text-slate-800"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-xs uppercase tracking-wide ${
            isDarkMode ? "text-white/50" : "text-slate-600"
          }`}>
            {t("planner.recipes.instructionsTitle")}
          </p>
          {metaChips.length > 0 && (
            <div className={`mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide ${
              isDarkMode ? "text-white/40" : "text-slate-500"
            }`}>
              {metaChips.map((chip) => (
                <span key={chip} className={`rounded-full border px-3 py-1 ${
                  isDarkMode ? "border-white/15" : "border-slate-300"
                }`}>
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onListen}
            disabled={audioState.isGenerating}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:border-amber-200 hover:text-white disabled:opacity-60 ${
              isDarkMode 
                ? "border-amber-300/60 text-amber-100 hover:border-amber-200" 
                : "border-amber-400/60 text-amber-700 hover:border-amber-500 hover:text-amber-800"
            }`}
          >
            {audioState.isGenerating
              ? t("planner.recipes.listening")
              : t("planner.recipes.listenButton")}
          </button>
          <button
            type="button"
            onClick={onPause}
            disabled={!audioState.hasAudio || !audioState.isPlaying}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:border-amber-200 disabled:opacity-50 ${
              isDarkMode 
                ? "border-white/20 text-white/80 hover:text-amber-100" 
                : "border-slate-400 text-slate-600 hover:border-amber-400 hover:text-amber-600"
            }`}
          >
            {t("planner.recipes.pauseButton")}
          </button>
        </div>
      </div>

      {audioState.hasAudio && (
        <div className="space-y-2">
          <label className="sr-only" htmlFor={scrubberId}>
            {t("planner.recipes.audioScrubLabel")}
          </label>
          <input
            id={scrubberId}
            type="range"
            min={0}
            max={audioState.duration || 0}
            step={0.1}
            value={
              Number.isFinite(audioState.currentTime) ? audioState.currentTime : 0
            }
            onChange={(event) => onSeek(Number(event.target.value))}
            className="w-full accent-amber-500 dark:accent-amber-300"
          />
          <div className={`flex items-center justify-between text-[11px] uppercase tracking-wide ${
            isDarkMode ? "text-white/50" : "text-slate-500"
          }`}>
            <span>{formatTime(audioState.currentTime)}</span>
            <span>{formatTime(audioState.duration)}</span>
          </div>
        </div>
      )}

      {ingredients.length > 0 && (
        <div>
          <p className={`text-xs uppercase tracking-wide ${
            isDarkMode ? "text-white/50" : "text-slate-600"
          }`}>
            {t("planner.recipes.ingredientsTitle")}
          </p>
          <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${
            isDarkMode ? "text-white/80" : "text-slate-700"
          }`}>
            {ingredients.map((ingredient, index) => (
              <li key={`${ingredient}-${index}`}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <p className={`text-xs uppercase tracking-wide ${
            isDarkMode ? "text-white/50" : "text-slate-600"
          }`}>
            {t("planner.recipes.stepsTitle")}
          </p>
          <ol className={`mt-2 list-decimal space-y-2 pl-5 text-sm ${
            isDarkMode ? "text-white/80" : "text-slate-700"
          }`}>
            {steps.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {detail.tips && (
        <p className={`text-xs ${
          isDarkMode ? "text-white/60" : "text-slate-600"
        }`}>
          <span className="font-semibold uppercase tracking-wide">
            {t("planner.recipes.detailTip")}{" "}
          </span>
          {detail.tips}
        </p>
      )}

      <div className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
        isDarkMode ? "border-white/10" : "border-slate-200"
      }`}>
        <button
          type="button"
          onClick={onLogRecipe}
          disabled={isCooked}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            isCooked
              ? isDarkMode
                ? "border border-emerald-300/40 text-emerald-100"
                : "border border-emerald-500/40 text-emerald-700"
              : isDarkMode
                ? "border border-white/20 text-white hover:border-amber-200 hover:text-amber-100 disabled:opacity-60"
                : "border border-slate-400 text-slate-700 hover:border-amber-400 hover:text-amber-600 disabled:opacity-60"
          }`}
        >
          {isCooked ? t("planner.recipes.logged") : t("planner.recipes.cookedButton")}
        </button>
      </div>

      {speechError && (
        <p className={`rounded-2xl border px-4 py-3 text-xs ${
          isDarkMode 
            ? "border-rose-400/40 bg-rose-400/10 text-rose-100" 
            : "border-rose-400/40 bg-rose-400/10 text-rose-700"
        }`}>
          {speechError}
        </p>
      )}
    </div>
  );
}

export default function RecipeIdeasPlanner({ initialPoints, initialUserId }: Props = {}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme management
  useEffect(() => {
    const updateTheme = () => {
      try {
        const saved = localStorage.getItem("theme");
        if (saved) {
          const dark = saved === "dark";
          setIsDarkMode(dark);
        } else {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(systemDark);
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

  const { t } = useI18n();
  const samplePrompts = useMemo(
    () =>
      t("planner.recipes.samples")
        .split("|")
        .map((prompt) => prompt.trim())
        .filter(Boolean),
    [t]
  );
  const defaultPrompt = samplePrompts[0] ?? "";
  const [country, setCountry] = useState("");
  const [zone, setZone] = useState("");
  const [dietaryFocus, setDietaryFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState(defaultPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookedRecipes, setCookedRecipes] = useState<CookedMap>({});
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetailMap>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const audioCleanupRefs = useRef<Record<string, (() => void) | undefined>>({});
  const audioUrlRefs = useRef<Record<string, string | null>>({});
  const isUnmountedRef = useRef(false);
  const { points, addPoints } = useExperiencePoints({ initialPoints, initialUserId });
  const updateRecipeDetailState = (
    name: string,
    updater: (prev: RecipeDetailState | undefined) => RecipeDetailState
  ) => {
    setRecipeDetails((prev) => ({
      ...prev,
      [name]: updater(prev[name]),
    }));
  };

  const hasAssistantReply = messages.some((message) => message.role === "assistant");
  const showSetupForm = !hasAssistantReply;

  useEffect(() => {
    if (!hasAssistantReply) {
      setInput(defaultPrompt);
    }
  }, [defaultPrompt, hasAssistantReply]);

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

  const destroyAudio = (name: string) => {
    const cleanup = audioCleanupRefs.current[name];
    if (cleanup) {
      cleanup();
      delete audioCleanupRefs.current[name];
    }
    const storedUrl = audioUrlRefs.current[name];
    if (storedUrl) {
      URL.revokeObjectURL(storedUrl);
      delete audioUrlRefs.current[name];
    }
    audioRefs.current[name] = null;
    if (!isUnmountedRef.current) {
      updateRecipeDetailState(name, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        audioUrl: null,
        audioDuration: undefined,
        audioCurrentTime: undefined,
        isAudioPlaying: false,
      }));
    }
  };

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      Object.keys(audioRefs.current).forEach((name) => {
        destroyAudio(name);
      });
    };
  }, []);

  const attachAudioListeners = (name: string, audio: HTMLAudioElement) => {
    const handleSync = () => {
      updateRecipeDetailState(name, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        audioCurrentTime: audio.currentTime,
        audioDuration: Number.isFinite(audio.duration)
          ? audio.duration
          : prev?.audioDuration ?? 0,
        isAudioPlaying: !audio.paused,
      }));
    };
    const handleEnded = () => {
      updateRecipeDetailState(name, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        isAudioPlaying: false,
        audioCurrentTime: audio.duration || prev?.audioDuration || 0,
      }));
    };
    audio.addEventListener("timeupdate", handleSync);
    audio.addEventListener("play", handleSync);
    audio.addEventListener("pause", handleSync);
    audio.addEventListener("loadedmetadata", handleSync);
    audio.addEventListener("ended", handleEnded);
    audioCleanupRefs.current[name] = () => {
      audio.removeEventListener("timeupdate", handleSync);
      audio.removeEventListener("play", handleSync);
      audio.removeEventListener("pause", handleSync);
      audio.removeEventListener("loadedmetadata", handleSync);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  };

  const handleSelectRecipeDetail = async (recipe: RecipeSuggestion) => {
    if (!recipe?.name) {
      return;
    }

    updateRecipeDetailState(recipe.name, (prev) => ({
      ...(prev ?? { status: "idle" as const }),
      status: "loading",
      error: null,
      isSpeaking: false,
      speechError: null,
    }));

    const payload = {
      country: country.trim(),
      zone: zone.trim(),
      dietaryFocus: dietaryFocus.trim() || undefined,
      notes: notes.trim() || undefined,
      recipeName: recipe.name,
      region: recipe.region,
      description: recipe.description,
    };

    try {
      const response = await fetch("/api/recipes/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) ?? {};
      if (!response.ok || !data?.detail) {
        throw new Error(data?.error ?? t("planner.recipes.detailError"));
      }

      updateRecipeDetailState(recipe.name, () => ({
        status: "ready",
        detail: data.detail,
        error: null,
        isSpeaking: false,
        speechError: null,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("planner.recipes.detailError");
      updateRecipeDetailState(recipe.name, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        status: "error",
        detail: undefined,
        error: message,
        isSpeaking: false,
        speechError: null,
      }));
    }
  };

  const handleListenToRecipe = async (recipeName: string) => {
    if (!recipeName) {
      return;
    }
    const detailState = recipeDetails[recipeName];
    const detail = detailState?.detail;
    if (!detail) {
      return;
    }
    if (detailState?.isSpeaking) {
      return;
    }
    const script = buildSpeechScript(detail).trim();
    if (!script) {
      return;
    }

    updateRecipeDetailState(recipeName, (prev) => ({
      ...(prev ?? { status: "idle" as const }),
      isSpeaking: true,
      speechError: null,
    }));

    const existingAudio = audioRefs.current[recipeName];
    if (existingAudio && detailState?.audioUrl) {
      try {
        await existingAudio.play();
        updateRecipeDetailState(recipeName, (prev) => ({
          ...(prev ?? { status: "idle" as const }),
          isSpeaking: false,
          speechError: null,
          isAudioPlaying: true,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("planner.recipes.audioError");
        updateRecipeDetailState(recipeName, (prev) => ({
          ...(prev ?? { status: "idle" as const }),
          speechError: message,
          isAudioPlaying: false,
        }));
      }
      return;
    }

    try {
      const response = await fetch("/api/recipes/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      });
      if (!response.ok) {
        let errorMessage = t("planner.recipes.audioError");
        try {
          const data = await response.json();
          if (data?.error) {
            errorMessage = data.error;
          }
        } catch {
          // ignore json parse errors
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRefs.current[recipeName] = audio;
      audioUrlRefs.current[recipeName] = audioUrl;
      attachAudioListeners(recipeName, audio);

      await audio.play();

      updateRecipeDetailState(recipeName, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        isSpeaking: false,
        speechError: null,
        audioUrl: audioUrl,
        isAudioPlaying: true,
        audioCurrentTime: 0,
        audioDuration: 0,
      }));
    } catch (err) {
      destroyAudio(recipeName);
      const message =
        err instanceof Error ? err.message : t("planner.recipes.audioError");
      updateRecipeDetailState(recipeName, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        isSpeaking: false,
        speechError: message,
        isAudioPlaying: false,
      }));
    }
  };

  const handlePauseRecipeAudio = (recipeName: string) => {
    const audio = audioRefs.current[recipeName];
    if (!audio) {
      return;
    }
    audio.pause();
  };

  const handleSeekRecipeAudio = (recipeName: string, value: number) => {
    const audio = audioRefs.current[recipeName];
    if (!audio) {
      updateRecipeDetailState(recipeName, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        audioCurrentTime: value,
      }));
      return;
    }
    audio.currentTime = value;
    updateRecipeDetailState(recipeName, (prev) => ({
      ...(prev ?? { status: "idle" as const }),
      audioCurrentTime: value,
    }));
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
        throw new Error(data?.error ?? t("planner.errors.unreachable"));
      }

      if (!data?.reply) {
        throw new Error(t("planner.errors.empty"));
      }

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("planner.errors.generic");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    setMessages([]);
    setInput(defaultPrompt);
    setCountry("");
    setZone("");
    setDietaryFocus("");
    setNotes("");
    setError(null);
    setIsLoading(false);
    setCookedRecipes({});
    setRecipeDetails({});
  };

  return (
    <section className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}>
      <div className="space-y-6 p-6">
        <div className={`rounded-3xl border p-5 ${getBorderColor()} ${getCardBg()}`}>
          <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
            {t("dashboard.content.pointsLabel")}
          </p>
          <p className="text-3xl font-semibold">{points}</p>
          <p className={`text-xs ${getMutedTextColor()}`}>{t("planner.common.pointsHint")}</p>
        </div>

        {showSetupForm && (
          <form
            onSubmit={handleSubmit}
            className={`space-y-5 rounded-3xl border p-6 backdrop-blur ${getBorderColor()} ${getCardBg()}`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
                <span>{t("planner.recipes.countryLabel")}</span>
                <input
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder={t("planner.recipes.countryPlaceholder")}
                  className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                />
              </label>

              <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
                <span>{t("planner.recipes.zoneLabel")}</span>
                <input
                  type="text"
                  value={zone}
                  onChange={(event) => setZone(event.target.value)}
                  placeholder={t("planner.recipes.zonePlaceholder")}
                  className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                />
              </label>
            </div>

            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("planner.recipes.focusLabel")}</span>
              <input
                type="text"
                value={dietaryFocus}
                onChange={(event) => setDietaryFocus(event.target.value)}
                placeholder={t("planner.recipes.focusPlaceholder")}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("planner.recipes.notesLabel")}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("planner.recipes.notesPlaceholder")}
                rows={3}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <label className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}>
              <span>{t("planner.recipes.requestLabel")}</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("planner.recipes.requestPlaceholder")}
                rows={3}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-full bg-amber-500 dark:bg-amber-400 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-amber-600 dark:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? t("planner.recipes.loading") : t("planner.recipes.submit")}
              </button>
              <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                {t("common.poweredByGemini")}
              </p>
            </div>

            <div className={`flex flex-wrap gap-2 text-sm ${getMutedTextColor()}`}>
              <div className={`w-full text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                {t("planner.common.sampleLabel")}
              </div>
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className={`rounded-full border px-4 py-2 transition hover:border-amber-500 dark:hover:border-amber-200 hover:text-amber-600 dark:hover:text-white ${
                    isDarkMode ? "border-white/20" : "border-slate-400"
                  }`}
                >
                  {prompt}
                </button>
              ))}
              <p className={`text-xs ${getMutedTextColor()}`}>
                {t("planner.common.sampleHelp")}
              </p>
            </div>

            {error && (
              <p className={`rounded-2xl border px-4 py-3 text-sm ${
                isDarkMode 
                  ? "border-rose-400/40 bg-rose-400/10 text-rose-100" 
                  : "border-rose-400/40 bg-rose-400/10 text-rose-700"
              }`}>
                {error}
              </p>
            )}
          </form>
        )}

        <div
          className={`rounded-3xl border p-6 ${
            showSetupForm
              ? isDarkMode ? "bg-slate-950/50" : "bg-slate-100"
              : isDarkMode
                ? "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),rgba(2,6,23,0.95))]"
                : "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),rgba(255,255,255,0.95))]"
          } ${getBorderColor()}`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide ${getMutedTextColor()}`}>
                {showSetupForm
                  ? t("planner.recipes.conversationTitle")
                  : t("planner.recipes.kitchenTitle")}
              </p>
              <p className={`text-xs ${getMutedTextColor()}`}>
                {showSetupForm
                  ? t("planner.recipes.conversationHint")
                  : t("planner.recipes.chatHint")}
              </p>
            </div>
            {hasAssistantReply && (
              <div className={`flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                <span className={`rounded-full border px-3 py-1 ${
                  isDarkMode ? "border-white/20" : "border-slate-300"
                }`}>
                  {country || t("planner.recipes.countrySet")}
                </span>
                <span className={`rounded-full border px-3 py-1 ${
                  isDarkMode ? "border-white/20" : "border-slate-300"
                }`}>
                  {zone || t("planner.recipes.zoneSet")}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`rounded-full border px-3 py-1 transition hover:border-rose-500 dark:hover:border-rose-300 hover:text-rose-600 dark:hover:text-white ${
                    isDarkMode ? "border-white/20 text-white/80" : "border-slate-400 text-slate-600"
                  }`}
                >
                  {t("planner.recipes.reset")}
                </button>
              </div>
            )}
          </div>

          {messages.length === 0 ? (
            <p className={`text-sm ${getMutedTextColor()}`}>
              {showSetupForm
                ? t("planner.recipes.emptyForm")
                : t("planner.recipes.waiting")}
            </p>
          ) : (
            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onLogRecipe={handleLogRecipe}
                  cookedRecipes={cookedRecipes}
                  t={t}
                  onSelectRecipe={handleSelectRecipeDetail}
                  recipeDetails={recipeDetails}
                  onListenToRecipe={handleListenToRecipe}
                  isDarkMode={isDarkMode}
                />
              ))}
              {isLoading && (
                <div className={`flex items-center gap-3 rounded-3xl border px-5 py-4 ${
                  isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"
                }`}>
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500 dark:text-amber-400" />
                  <p className={`text-sm ${getMutedTextColor()}`}>Roots Test Kitchen is thinking...</p>
                </div>
              )}
            </div>
          )}

          {error && !showSetupForm && (
            <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              isDarkMode 
                ? "border-rose-400/40 bg-rose-400/10 text-rose-100" 
                : "border-rose-400/40 bg-rose-400/10 text-rose-700"
            }`}>
              {error}
            </p>
          )}

          {hasAssistantReply && (
            <form
              onSubmit={handleSubmit}
              className={`mt-6 flex flex-col gap-3 rounded-3xl border p-4 ${getBorderColor()} ${getCardBg()}`}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("planner.recipes.replyPlaceholder")}
                rows={3}
                disabled={isLoading}
                className={`w-full rounded-2xl border px-4 py-3 text-base placeholder:${getMutedTextColor()} focus:border-amber-500 dark:focus:border-amber-300 focus:outline-none ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
              <div className={`flex items-center justify-between text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                <span>{t("common.poweredByGemini")}</span>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex items-center gap-2 rounded-full bg-amber-500 dark:bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-600 dark:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? t("planner.recipes.replyLoading") : t("planner.recipes.replySubmit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function formatTime(seconds: number | undefined) {
  if (!Number.isFinite(seconds) || seconds === undefined) {
    return "0:00";
  }
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}