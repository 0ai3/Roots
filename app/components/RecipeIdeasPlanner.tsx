"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { useI18n } from "../../app/hooks/useI18n";
import { Loader2, ChefHat, Sparkles, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

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

function buildSpeechScript(detail: RecipeDetail) {
  const parts: string[] = [];
  if (detail.name) {
    parts.push(detail.name);
  }
  if (detail.servings) {
    parts.push(`Serves ${detail.servings}.`);
  }
  if (detail.prepTime || detail.cookTime) {
    const timeBits = [detail.prepTime, detail.cookTime]
      .filter(Boolean)
      .join(" and ");
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
  onPauseRecipeAudio,
  onSeekRecipeAudio,
  isDarkMode,
}: {
  message: ChatMessage;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
  t: Translator;
  onSelectRecipe: (recipe: RecipeSuggestion) => void;
  recipeDetails: RecipeDetailMap;
  onListenToRecipe: (recipeName: string) => void;
  onPauseRecipeAudio: (recipeName: string) => void;
  onSeekRecipeAudio: (recipeName: string, time: number) => void;
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
          onPauseRecipeAudio={onPauseRecipeAudio}
          onSeekRecipeAudio={onSeekRecipeAudio}
          isDarkMode={isDarkMode}
        />
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl rounded-2xl border px-6 py-4 text-sm leading-relaxed shadow-lg ${
          message.role === "user"
            ? "border-amber-400/30 bg-linear-to-br from-amber-400/20 to-amber-500/10 text-white"
            : "border-neutral-700 bg-neutral-800/50 text-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${
            message.role === "user" ? "bg-amber-400" : "bg-lime-400"
          }`} />
          <p className={`text-xs font-semibold uppercase tracking-wider ${
            message.role === "user" ? "text-amber-400" : "text-lime-400"
          }`}>
            {message.role === "user"
              ? t("planner.roles.you")
              : t("planner.roles.kitchen")}
          </p>
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.content.split("\n").map((line, idx) => {
            // Handle bold text (**text** or __text__)
            const boldRegex = /(\*\*|__)(.*?)\1/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(line)) !== null) {
              if (match.index > lastIndex) {
                parts.push(
                  <span key={`text-${idx}-${lastIndex}`}>
                    {line.slice(lastIndex, match.index)}
                  </span>
                );
              }
              parts.push(
                <strong
                  key={`bold-${idx}-${match.index}`}
                  className="font-bold text-amber-300"
                >
                  {match[2]}
                </strong>
              );
              lastIndex = match.index + match[0].length;
            }

            if (lastIndex < line.length) {
              parts.push(
                <span key={`text-${idx}-${lastIndex}`}>
                  {line.slice(lastIndex)}
                </span>
              );
            }

            // Handle different line types
            const trimmedLine = line.trim();
            const cleanedLine = trimmedLine.replace(/^#+\s*/, "");
            const cleanedParts = parts.length > 0 ? parts : cleanedLine;

            if (trimmedLine.startsWith("##")) {
              return (
                <h3
                  key={idx}
                  className="mt-4 mb-2 text-base font-bold text-amber-300"
                >
                  {cleanedParts}
                </h3>
              );
            } else if (trimmedLine.startsWith("#")) {
              return (
                <h2
                  key={idx}
                  className="mt-5 mb-3 text-lg font-bold text-amber-200"
                >
                  {cleanedParts}
                </h2>
              );
            } else if (
              trimmedLine.startsWith("-") ||
              trimmedLine.startsWith("*") ||
              trimmedLine.match(/^\d+\./)
            ) {
              return (
                <li key={idx} className="ml-6 mb-1 list-disc">
                  {parts.length > 0
                    ? parts
                    : trimmedLine.replace(/^[-*]\s*|\d+\.\s*/, "")}
                </li>
              );
            } else if (trimmedLine === "") {
              return <br key={idx} />;
            } else {
              return (
                <p key={idx} className="mb-2">
                  {parts.length > 0 ? parts : line}
                </p>
              );
            }
          })}
        </div>
      </div>
    </motion.div>
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
  onPauseRecipeAudio,
  onSeekRecipeAudio,
  isDarkMode,
}: {
  payload: AssistantPayload;
  onLogRecipe: (name: string) => void;
  cookedRecipes: CookedMap;
  t: Translator;
  onSelectRecipe: (recipe: RecipeSuggestion) => void;
  recipeDetails: RecipeDetailMap;
  onListenToRecipe: (recipeName: string) => void;
  onPauseRecipeAudio: (recipeName: string) => void;
  onSeekRecipeAudio: (recipeName: string, time: number) => void;
  isDarkMode: boolean;
}) {
  const tips = payload.tips?.filter(Boolean) ?? [];
  const recipes = payload.recipes ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-neutral-700 bg-linear-to-br from-neutral-800 to-neutral-900 p-8 shadow-2xl"
    >
      {payload.intro && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-amber-400">Recipe Suggestions</h3>
          </div>
          <p className="text-base leading-relaxed text-neutral-200">
            {payload.intro}
          </p>
        </div>
      )}

      {tips.length > 0 && (
        <div className="mb-8 pb-6 border-b border-neutral-700">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
              {t("planner.recipes.chefTips")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tips.map((tip) => (
              <div
                key={tip}
                className="group rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-2.5 text-sm text-neutral-200 transition-all hover:border-lime-400/40 hover:bg-lime-400/10"
              >
                <span className="font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="space-y-6">
          {recipes.map((recipe) => {
            const detailState = recipeDetails[recipe.name] ?? {
              status: "idle" as const,
            };
            const isLoadingDetail = detailState.status === "loading";
            const hasDetail =
              detailState.status === "ready" && Boolean(detailState.detail);
            const selectLabel = isLoadingDetail
              ? t("planner.recipes.detailLoading")
              : hasDetail
              ? t("planner.recipes.detailSelected")
              : t("planner.recipes.selectButton");

            return (
              <motion.article
                key={recipe.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="group rounded-2xl border border-neutral-700 bg-neutral-800/30 p-6 shadow-lg transition-all hover:border-amber-400/30 hover:shadow-xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                      <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {recipe.name}
                      </h4>
                    </div>
                    {recipe.region && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                        <p className="text-sm font-medium text-lime-400">
                          {recipe.region}
                        </p>
                      </div>
                    )}
                  </div>
                  {recipe.flavorProfile && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-400">
                      {recipe.flavorProfile}
                    </span>
                  )}
                </div>

                {recipe.description && (
                  <div className="mb-5">
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {recipe.description}
                    </p>
                  </div>
                )}

                {Array.isArray(recipe.keyIngredients) &&
                  recipe.keyIngredients.length > 0 && (
                    <div className="mb-5 rounded-xl border border-neutral-700 bg-neutral-900/30 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                          {t("planner.recipes.keyIngredients")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {recipe.keyIngredients.map((ingredient) => (
                          <div
                            key={ingredient}
                            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-xs text-neutral-300"
                          >
                            <span className="text-orange-400">•</span>
                            <span className="font-medium">{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {recipe.culturalNote && (
                  <div className="mb-4 rounded-lg border-l-4 border-purple-400 bg-purple-400/5 pl-4 pr-3 py-3">
                    <p className="text-sm italic leading-relaxed text-purple-200">
                      <span className="font-semibold not-italic text-purple-400">Cultural Note: </span>
                      {recipe.culturalNote}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {recipe.difficulty && (
                    <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">
                        {recipe.difficulty}
                      </span>
                    </div>
                  )}
                  {recipe.mapLink && (
                    <a
                      href={recipe.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:border-amber-400/50 hover:bg-amber-400/20"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t("planner.recipes.mapLink")}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe)}
                    disabled={isLoadingDetail || hasDetail}
                    className={`group/btn px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                      hasDetail
                        ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-400 cursor-default"
                        : "border border-amber-400/40 bg-amber-400/10 text-amber-400 hover:border-amber-400 hover:bg-amber-400/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    }`}
                  >
                    {isLoadingDetail && <Loader2 className="w-4 h-4 animate-spin" />}
                    {hasDetail && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {selectLabel}
                  </button>
                </div>

                {detailState.status === "error" && detailState.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-200"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {detailState.error}
                    </div>
                  </motion.div>
                )}

                {hasDetail && detailState.detail && (
                  <RecipeDetailPanel
                    detail={detailState.detail}
                    onListen={() => onListenToRecipe(recipe.name)}
                    onPause={() => onPauseRecipeAudio(recipe.name)}
                    onSeek={(value) => onSeekRecipeAudio(recipe.name, value)}
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
              </motion.article>
            );
          })}
        </div>
      )}

      {payload.closing && (
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <p className="text-sm italic leading-relaxed text-neutral-400">
            {payload.closing}
          </p>
        </div>
      )}
    </motion.div>
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
  const scrubberId = `audio-scrubber-${detail.name
    .replace(/\s+/g, "-")
    .toLowerCase()}`;
  const metaChips = [
    detail.servings
      ? `${t("planner.recipes.servingsLabel")}: ${detail.servings}`
      : null,
    detail.prepTime
      ? `${t("planner.recipes.prepTimeLabel")}: ${detail.prepTime}`
      : null,
    detail.cookTime
      ? `${t("planner.recipes.cookTimeLabel")}: ${detail.cookTime}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className={`mt-5 space-y-4 rounded-2xl border p-4 text-sm ${
        isDarkMode
          ? "border-amber-200/20 bg-slate-950/40 text-white/80"
          : "border-amber-300/20 bg-amber-50 text-slate-800"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs uppercase tracking-wide ${
              isDarkMode ? "text-white/50" : "text-slate-600"
            }`}
          >
            {t("planner.recipes.instructionsTitle")}
          </p>
          {metaChips.length > 0 && (
            <div
              className={`mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide ${
                isDarkMode ? "text-white/40" : "text-slate-500"
              }`}
            >
              {metaChips.map((chip) => (
                <span
                  key={chip}
                  className={`rounded-full border px-3 py-1 ${
                    isDarkMode ? "border-white/15" : "border-slate-300"
                  }`}
                >
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
              Number.isFinite(audioState.currentTime)
                ? audioState.currentTime
                : 0
            }
            onChange={(event) => onSeek(Number(event.target.value))}
            className="w-full accent-amber-500 dark:accent-amber-300"
          />
          <div
            className={`flex items-center justify-between text-[11px] uppercase tracking-wide ${
              isDarkMode ? "text-white/50" : "text-slate-500"
            }`}
          >
            <span>{formatTime(audioState.currentTime)}</span>
            <span>{formatTime(audioState.duration)}</span>
          </div>
        </div>
      )}

      {ingredients.length > 0 && (
        <div>
          <p
            className={`text-xs uppercase tracking-wide ${
              isDarkMode ? "text-white/50" : "text-slate-600"
            }`}
          >
            {t("planner.recipes.ingredientsTitle")}
          </p>
          <ul
            className={`mt-2 list-disc space-y-1 pl-5 text-sm ${
              isDarkMode ? "text-white/80" : "text-slate-700"
            }`}
          >
            {ingredients.map((ingredient, index) => (
              <li key={`${ingredient}-${index}`}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <p
            className={`text-xs uppercase tracking-wide ${
              isDarkMode ? "text-white/50" : "text-slate-600"
            }`}
          >
            {t("planner.recipes.stepsTitle")}
          </p>
          <ol
            className={`mt-2 list-decimal space-y-2 pl-5 text-sm ${
              isDarkMode ? "text-white/80" : "text-slate-700"
            }`}
          >
            {steps.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {detail.tips && (
        <p
          className={`text-xs ${
            isDarkMode ? "text-white/60" : "text-slate-600"
          }`}
        >
          <span className="font-semibold uppercase tracking-wide">
            {t("planner.recipes.detailTip")}{" "}
          </span>
          {detail.tips}
        </p>
      )}

      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
          isDarkMode ? "border-white/10" : "border-slate-200"
        }`}
      >
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
          {isCooked
            ? t("planner.recipes.logged")
            : t("planner.recipes.cookedButton")}
        </button>
      </div>

      {speechError && (
        <p
          className={`rounded-2xl border px-4 py-3 text-xs ${
            isDarkMode
              ? "border-rose-400/40 bg-rose-400/10 text-rose-100"
              : "border-rose-400/40 bg-rose-400/10 text-rose-700"
          }`}
        >
          {speechError}
        </p>
      )}
    </div>
  );
}

export default function RecipeIdeasPlanner({
  initialPoints,
  initialUserId,
}: Props = {}) {
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
          const systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          setIsDarkMode(systemDark);
        }
      } catch {
        // ignore
      }
    };

    updateTheme();

    const handleThemeChange = (event: CustomEvent<{ isDark: boolean }>) => {
      setIsDarkMode(event.detail.isDark);
    };

    window.addEventListener("theme-change", handleThemeChange as EventListener);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener(
        "theme-change",
        handleThemeChange as EventListener
      );
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
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
  const { points, addPoints } = useExperiencePoints({
    initialPoints,
    initialUserId,
  });
  const updateRecipeDetailState = (
    name: string,
    updater: (prev: RecipeDetailState | undefined) => RecipeDetailState
  ) => {
    setRecipeDetails((prev) => ({
      ...prev,
      [name]: updater(prev[name]),
    }));
  };

  const hasAssistantReply = messages.some(
    (message) => message.role === "assistant"
  );
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

  const destroyAudio = useCallback((recipeName?: string) => {
    if (recipeName) {
      const audio = audioRefs.current[recipeName];
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
      delete audioRefs.current[recipeName];
    } else {
      if (audioRefs.current) {
        Object.values(audioRefs.current).forEach((audio) => {
          if (audio) {
            audio.pause();
            audio.src = "";
            audio.load();
          }
        });
        audioRefs.current = {};
      }
    }
  }, []);

  useEffect(() => {
    const currentAudioRefs = audioRefs.current;
    return () => {
      if (currentAudioRefs) {
        Object.values(currentAudioRefs).forEach((audio) => {
          if (audio) {
            audio.pause();
            audio.src = "";
            audio.load();
          }
        });
      }
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
          error instanceof Error
            ? error.message
            : t("planner.recipes.audioError");
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
      destroyAudio();
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
    destroyAudio(); // Call without parameter to destroy all audio
  };

  // Define these functions before they're used in AssistantCard
  const handlePauseRecipeAudio = useCallback((recipeName: string) => {
    const audio = audioRefs.current[recipeName];
    if (audio) {
      audio.pause();
      updateRecipeDetailState(recipeName, (prev) => ({
        ...(prev ?? { status: "idle" as const }),
        isAudioPlaying: false,
      }));
    }
  }, []);

  const handleSeekRecipeAudio = useCallback(
    (recipeName: string, time: number) => {
      const audio = audioRefs.current[recipeName];
      if (audio) {
        audio.currentTime = time;
      }
    },
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    const payload = {
      country: country.trim(),
      zone: zone.trim(),
      dietaryFocus: dietaryFocus.trim() || undefined,
      notes: notes.trim() || undefined,
      userMessage: userMessage.content,
      conversationHistory: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    try {
      const response = await fetch("/api/recipes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) ?? {};
      if (!response.ok || !data?.content) {
        throw new Error(data?.error ?? t("planner.recipes.chatError"));
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("planner.recipes.chatError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80"
            alt="Cultural recipes background"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6"
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              Roots Test Kitchen
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Discover{" "}
            <span className="text-amber-400">Authentic Recipes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Explore traditional dishes from around the world with AI-powered recipe suggestions
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
            whileHover={{ y: -5 }}
            className="bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">
                  {t("dashboard.content.pointsLabel")}
                </p>
                <p className="text-3xl font-bold text-white">{points}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              {t("planner.common.pointsHint")}
            </p>
          </motion.div>

          {showSetupForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-400/20 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Recipe Preferences</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-400">{t("planner.recipes.countryLabel")}</span>
                  <input
                    type="text"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder={t("planner.recipes.countryPlaceholder")}
                    className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all border-neutral-700 bg-neutral-800/50 text-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-400">{t("planner.recipes.zoneLabel")}</span>
                  <input
                    type="text"
                    value={zone}
                    onChange={(event) => setZone(event.target.value)}
                    placeholder={t("planner.recipes.zonePlaceholder")}
                    className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all border-neutral-700 bg-neutral-800/50 text-white"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("planner.recipes.focusLabel")}</span>
                <input
                  type="text"
                  value={dietaryFocus}
                  onChange={(event) => setDietaryFocus(event.target.value)}
                  placeholder={t("planner.recipes.focusPlaceholder")}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all border-neutral-700 bg-neutral-800/50 text-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("planner.recipes.notesLabel")}</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("planner.recipes.notesPlaceholder")}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all border-neutral-700 bg-neutral-800/50 text-white resize-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-400">{t("planner.recipes.requestLabel")}</span>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("planner.recipes.requestPlaceholder")}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 text-base placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all border-neutral-700 bg-neutral-800/50 text-white resize-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-800">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-8 py-3 bg-amber-400 text-black rounded-xl font-semibold transition-all hover:bg-amber-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("planner.recipes.loading")}
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-4 h-4" />
                      {t("planner.recipes.submit")}
                    </>
                  )}
                </button>
                <p className="text-xs text-neutral-500">
                  {t("common.poweredByGemini")}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {t("planner.common.sampleLabel")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500">
                  {t("planner.common.sampleHelp")}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-200 flex items-center gap-3"
                >
                  {error}
                </motion.div>
              )}
            </motion.form>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800 ${
              !showSetupForm ? "bg-linear-to-br from-amber-900/10 to-neutral-900" : ""
            }`}
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">
                    {showSetupForm
                      ? t("planner.recipes.conversationTitle")
                      : t("planner.recipes.kitchenTitle")}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {showSetupForm
                      ? t("planner.recipes.conversationHint")
                      : t("planner.recipes.chatHint")}
                  </p>
                </div>
              </div>
              {hasAssistantReply && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-400">
                    {country || t("planner.recipes.countrySet")}
                  </span>
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-400">
                    {zone || t("planner.recipes.zoneSet")}
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-neutral-700 px-4 py-1.5 text-neutral-300 transition hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-400"
                  >
                    {t("planner.recipes.reset")}
                  </button>
                </div>
              )}
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-10 h-10 text-neutral-600" />
                </div>
                <p className="text-base font-medium text-white mb-1">
                  {showSetupForm
                    ? t("planner.recipes.emptyForm")
                    : t("planner.recipes.waiting")}
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-700 hover:scrollbar-thumb-neutral-600">
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
                  onPauseRecipeAudio={handlePauseRecipeAudio}
                  onSeekRecipeAudio={handleSeekRecipeAudio}
                  isDarkMode={isDarkMode}
                />
              ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-5 py-4"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                    <p className="text-sm text-amber-200">
                      Roots Test Kitchen is thinking...
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {error && !showSetupForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}

            {hasAssistantReply && (
              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-800/30 p-5"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("planner.recipes.replyPlaceholder")}
                  rows={3}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-base text-white placeholder:text-neutral-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{t("common.poweredByGemini")}</span>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="px-6 py-2.5 bg-amber-400 text-black rounded-xl font-semibold text-sm transition-all hover:bg-amber-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("planner.recipes.replyLoading")}
                      </>
                    ) : (
                      t("planner.recipes.replySubmit")
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
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
