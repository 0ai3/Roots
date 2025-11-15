"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { useI18n } from "@/app/hooks/useI18n";
import { motion } from "framer-motion";
import {
  Compass,
  MapPin,
  DollarSign,
  Heart,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Attraction = {
  title: string;
  neighborhood?: string;
  cost?: string;
  description?: string;
  mapLink?: string;
  notes?: string[];
  category?: string;
  latitude?: number;
  longitude?: number;
};

type AssistantPayload = {
  intro?: string;
  tips?: string[];
  attractions?: Attraction[];
  closing?: string;
};

const CATEGORY_KEYWORDS: Array<{ key: string; patterns: RegExp[] }> = [
  { key: "museum", patterns: [/museum/i, /gallery/i, /exhibit/i, /history/i] },
  { key: "park", patterns: [/park/i, /garden/i, /trail/i, /hike/i] },
  { key: "food", patterns: [/cafe/i, /restaurant/i, /food/i, /market/i, /bakery/i] },
  { key: "nightlife", patterns: [/bar/i, /club/i, /night/i, /speakeasy/i] },
  { key: "shopping", patterns: [/shop/i, /shopping/i, /boutique/i, /bazaar/i] },
  { key: "landmark", patterns: [/tower/i, /bridge/i, /monument/i, /plaza/i] },
];

function resolveCategory(rawCategory?: string, text?: string) {
  const normalized = rawCategory?.trim().toLowerCase();
  if (normalized && normalized !== "other") {
    return normalized;
  }
  const haystack = text?.toLowerCase() ?? "";
  if (!haystack) {
    return normalized || undefined;
  }
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(haystack))) {
      return entry.key;
    }
  }
  return normalized || undefined;
}

function parseAssistantContent(raw: string): AssistantPayload | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    return JSON.parse(trimmed) as AssistantPayload;
  } catch {
    return null;
  }
}

type VisitedMap = Record<string, boolean>;

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

type Translator = ReturnType<typeof useI18n>["t"];

function MessageBubble({
  message,
  onLogAttraction,
  visitedAttractions,
  t,
  isDarkMode,
  savingAttractionId,
}: {
  message: ChatMessage;
  onLogAttraction: (attraction: Attraction) => void | Promise<void>;
  visitedAttractions: VisitedMap;
  t: Translator;
  isDarkMode: boolean;
  savingAttractionId?: string | null;
}) {
  if (message.role === "assistant") {
    const parsed = parseAssistantContent(message.content);
    if (parsed) {
        return (
          <AssistantCard
            payload={parsed}
            onLogAttraction={onLogAttraction}
            visitedAttractions={visitedAttractions}
            t={t}
            isDarkMode={isDarkMode}
            savingAttractionId={savingAttractionId}
          />
        );
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl rounded-2xl border px-5 py-4 backdrop-blur-sm shadow-lg ${
          message.role === "user"
            ? "border-lime-400/30 bg-lime-400/10 text-lime-800 dark:text-lime-50"
            : isDarkMode 
              ? "border-white/10 bg-white/5 text-white/90"
              : "border-slate-200 bg-slate-50 text-slate-900"
        }`}
      >
        <p className={`mb-2 text-xs uppercase tracking-wide ${
          message.role === "user" 
            ? "text-lime-700 dark:text-lime-300" 
            : isDarkMode 
              ? "text-white/60" 
              : "text-slate-600"
        }`}>
          {message.role === "user" ? t("planner.roles.you") : t("planner.roles.guide")}
        </p>
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </motion.div>
  );
}

function AssistantCard({
  payload,
  onLogAttraction,
  visitedAttractions,
  t,
  isDarkMode,
  savingAttractionId,
}: {
  payload: AssistantPayload;
  onLogAttraction: (attraction: Attraction) => void | Promise<void>;
  visitedAttractions: VisitedMap;
  t: Translator;
  isDarkMode: boolean;
  savingAttractionId?: string | null;
}) {
  const tips = payload.tips?.filter(Boolean) ?? [];
  const attractions = payload.attractions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 backdrop-blur-sm shadow-xl ${
        isDarkMode 
          ? "border-lime-400/20 bg-black/50" 
          : "border-lime-400/30 bg-slate-50"
      }`}
    >
      {payload.intro && (
        <p className={`text-base leading-relaxed ${
          isDarkMode ? "text-white/90" : "text-slate-900"
        }`}>
          {payload.intro}
        </p>
      )}

      {tips.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-lime-400" />
            <p className={`text-xs uppercase tracking-wide ${
              isDarkMode ? "text-white/60" : "text-slate-600"
            }`}>
              {t("planner.common.quickTips")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tips.map((tip) => (
              <motion.span
                key={tip}
                whileHover={{ scale: 1.05 }}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  isDarkMode 
                    ? "border-white/10 bg-white/5 text-white/80" 
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {tip}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {attractions.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-400" />
            <p className={`text-xs uppercase tracking-wide ${
              isDarkMode ? "text-white/60" : "text-slate-600"
            }`}>
              {t("planner.attractions.recommendedTitle")}
            </p>
          </div>
          {attractions.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border p-5 backdrop-blur-sm ${
                isDarkMode 
                  ? "border-white/10 bg-white/5" 
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {item.title}
                  </h3>
                  {item.neighborhood && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className={`w-3 h-3 ${
                        isDarkMode ? "text-white/40" : "text-slate-400"
                      }`} />
                      <p className={`text-xs ${
                        isDarkMode ? "text-white/40" : "text-slate-500"
                      }`}>
                        {item.neighborhood}
                      </p>
                    </div>
                  )}
                </div>
                {item.cost && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-lime-500" />
                    <span className={`rounded-full border px-3 py-1 text-xs ${
                      isDarkMode 
                        ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
                        : "border-lime-500/30 bg-lime-500/10 text-lime-700"
                    }`}>
                      {item.cost}
                    </span>
                  </div>
                )}
              </div>

              {item.description && (
                <p className={`text-sm leading-relaxed mb-3 ${
                  isDarkMode ? "text-white/80" : "text-slate-700"
                }`}>
                  {item.description}
                </p>
              )}

              {item.mapLink && (
                <motion.a
                  href={item.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-lime-500 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-300 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  {t("worldExplorer.attractions.openInMaps")}
                </motion.a>
              )}

              {Array.isArray(item.notes) && item.notes.length > 0 && (
                <ul className={`mt-4 space-y-2 text-sm ${
                  isDarkMode ? "text-white/70" : "text-slate-600"
                }`}>
                  {item.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-lime-500 dark:text-lime-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}

              <motion.button
                type="button"
                onClick={() => onLogAttraction(item)}
                disabled={
                  Boolean(visitedAttractions[item.title]) ||
                  savingAttractionId === item.title
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-4 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2 ${
                  visitedAttractions[item.title]
                    ? isDarkMode
                      ? "border border-lime-400/40 text-lime-300 bg-lime-400/10"
                      : "border border-lime-500/40 text-lime-700 bg-lime-500/10"
                    : isDarkMode
                    ? "border border-white/20 text-white/90 hover:border-lime-400 hover:text-lime-300 hover:bg-lime-400/10"
                    : "border border-slate-300 text-slate-700 hover:border-lime-500 hover:text-lime-700 hover:bg-lime-500/10"
                }`}
              >
                <Heart className="w-3 h-3" />
                {visitedAttractions[item.title]
                  ? t("planner.attractions.logged")
                  : savingAttractionId === item.title
                  ? "Saving..."
                  : t("planner.attractions.visitButton")}
              </motion.button>
            </motion.article>
          ))}
        </div>
      )}

      {payload.closing && (
        <p className={`mt-6 text-sm leading-relaxed ${
          isDarkMode ? "text-white/70" : "text-slate-600"
        }`}>
          {payload.closing}
        </p>
      )}
    </motion.div>
  );
}

function createMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AttractionPlanner({ initialPoints, initialUserId }: Props = {}) {
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
      } catch {
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
    return isDarkMode ? "bg-white/5" : "bg-white";
  };

  const { t } = useI18n();
  const samplePrompts = useMemo(
    () =>
      t("planner.attractions.samples")
        .split("|")
        .map((prompt) => prompt.trim())
        .filter(Boolean),
    [t]
  );
  const defaultPrompt = samplePrompts[0] ?? "";
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState(defaultPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitedAttractions, setVisitedAttractions] = useState<VisitedMap>({});
  const [savingAttractionId, setSavingAttractionId] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const { points, addPoints } = useExperiencePoints({
    initialPoints,
    initialUserId,
  });
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
    Boolean(location.trim()) &&
    Boolean(budget.trim()) &&
    Boolean(input.trim()) &&
    Boolean(interests.trim()) &&
    !isLoading;

  const handleLogAttraction = async (attraction: Attraction) => {
    const title = attraction.title?.trim();
    if (!title || visitedAttractions[title]) {
      return;
    }

    setSavingAttractionId(title);
    setSaveBanner(null);

    const hasCoordinates =
      typeof attraction.latitude === "number" &&
      typeof attraction.longitude === "number";

    try {
      if (hasCoordinates) {
        const category = resolveCategory(
          attraction.category,
          `${attraction.title} ${attraction.description ?? ""}`
        );
        const response = await fetch("/api/profile/attractions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: attraction.latitude,
            longitude: attraction.longitude,
            title,
            label: title,
            category,
            description: attraction.description,
            source: "attraction-planner",
          }),
        });
        const data = (await response.json().catch(() => null)) ?? {};
        if (!response.ok) {
          throw new Error((data as { error?: string })?.error ?? t("planner.errors.generic"));
        }
        setSaveBanner({
          tone: "success",
          message: `${title} saved to your live map.`,
        });
      } else {
        setSaveBanner({
          tone: "error",
          message: `${title} logged, but no coordinates were provided in the AI response.`,
        });
      }

      setVisitedAttractions((prev) => ({ ...prev, [title]: true }));
      addPoints(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("planner.errors.generic");
      setSaveBanner({ tone: "error", message });
    } finally {
      setSavingAttractionId(null);
    }
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
      const response = await fetch("/api/attractions/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          budget,
          interests,
          notes,
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
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
    setLocation("");
    setBudget("");
    setInterests("");
    setNotes("");
    setError(null);
    setIsLoading(false);
    setVisitedAttractions({});
    setSavingAttractionId(null);
    setSaveBanner(null);
  };

  return (
    <section className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}>
      <div className="space-y-6 p-6">
        {/* REMOVED THEME TOGGLE BUTTON - Using existing one from DashboardPageLayout */}

        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 backdrop-blur-sm ${getBorderColor()} ${getCardBg()}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-lime-400" />
            <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
              {t("dashboard.content.pointsLabel")}
            </p>
          </div>
          <p className={`text-3xl font-bold mb-1 ${getTextColor()}`}>
            {points}
          </p>
          <p className={`text-sm ${getMutedTextColor()}`}>
            {t("planner.common.pointsHint")}
          </p>
        </motion.div>

        {saveBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border px-4 py-3 text-sm ${
              saveBanner.tone === "success"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-400/10 text-rose-100"
            }`}
          >
            {saveBanner.message}
          </motion.div>
        )}

        {/* Setup Form */}
        {showSetupForm && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSubmit}
            className={`space-y-6 rounded-2xl border p-6 backdrop-blur-sm ${getBorderColor()} ${getCardBg()}`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${getMutedTextColor()}`} />
                  <span className={`text-sm font-medium ${getTextColor()}`}>
                    {t("planner.attractions.locationLabel")}
                  </span>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={t("planner.attractions.locationPlaceholder")}
                  className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                />
              </label>

              <label className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-4 h-4 ${getMutedTextColor()}`} />
                  <span className={`text-sm font-medium ${getTextColor()}`}>
                    {t("planner.attractions.budgetLabel")}
                  </span>
                </div>
                <input
                  type="text"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder={t("planner.attractions.budgetPlaceholder")}
                  className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
                />
              </label>
            </div>

            <label className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${getMutedTextColor()}`} />
                <span className={`text-sm font-medium ${getTextColor()}`}>
                  {t("planner.attractions.interestsLabel")}
                </span>
              </div>
              <input
                type="text"
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder={t("planner.attractions.interestsPlaceholder")}
                className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <label className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className={`w-4 h-4 ${getMutedTextColor()}`} />
                <span className={`text-sm font-medium ${getTextColor()}`}>
                  {t("planner.attractions.notesLabel")}
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("planner.attractions.notesPlaceholder")}
                rows={3}
                className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <label className="space-y-3">
              <div className="flex items-center gap-2">
                <Compass className={`w-4 h-4 ${getMutedTextColor()}`} />
                <span className={`text-sm font-medium ${getTextColor()}`}>
                  {t("planner.attractions.questionLabel")}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("planner.attractions.questionPlaceholder")}
                rows={3}
                className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? t("planner.attractions.loading") : t("planner.attractions.submit")}
              </motion.button>
              <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                {t("common.poweredByGemini")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className={`w-full text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                {t("planner.common.sampleLabel")}
              </div>
              {samplePrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all hover:border-lime-400 ${
                    isDarkMode
                      ? "border-white/20 bg-white/5 text-white/70 hover:text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {prompt}
                </motion.button>
              ))}
              <p className={`text-xs ${getMutedTextColor()}`}>
                {t("planner.common.sampleHelp")}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3"
              >
                <p className="text-sm text-rose-700 dark:text-rose-100">{error}</p>
              </motion.div>
            )}
          </motion.form>
        )}

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 backdrop-blur-sm ${getBorderColor()} ${
            showSetupForm
              ? isDarkMode ? "bg-black/50" : "bg-slate-100"
              : isDarkMode 
                ? "bg-linear-to-br from-black/50 to-lime-500/10" 
                : "bg-linear-to-br from-slate-50 to-lime-100/30"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <p className={`text-sm font-semibold uppercase tracking-wide ${getTextColor()}`}>
                  {showSetupForm
                    ? t("planner.attractions.conversationTitle")
                    : t("planner.attractions.conciergeTitle")}
                </p>
              </div>
              <p className={`text-xs ${getMutedTextColor()}`}>
                {showSetupForm
                  ? t("planner.attractions.conversationHint")
                  : t("planner.attractions.chatHint")}
              </p>
            </div>
            {hasAssistantReply && (
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-xl border px-3 py-1 text-xs ${
                  isDarkMode 
                    ? "border-white/20 bg-white/5 text-white/60" 
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}>
                  {location || t("planner.attractions.locationChip")}
                </span>
                <span className={`rounded-xl border px-3 py-1 text-xs ${
                  isDarkMode 
                    ? "border-white/20 bg-white/5 text-white/60" 
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}>
                  {budget || t("planner.attractions.budgetChip")}
                </span>
                <motion.button
                  type="button"
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1 text-xs transition-all hover:border-rose-400 ${
                    isDarkMode
                      ? "border-white/20 bg-white/5 text-white/60 hover:text-white"
                      : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  {t("planner.attractions.reset")}
                </motion.button>
              </div>
            )}
          </div>

          {messages.length === 0 ? (
            <p className={`text-sm text-center py-8 ${getMutedTextColor()}`}>
              {showSetupForm
                ? t("planner.attractions.emptyForm")
                : t("planner.attractions.waiting")}
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onLogAttraction={handleLogAttraction}
                  visitedAttractions={visitedAttractions}
                  t={t}
                  isDarkMode={isDarkMode}
                  savingAttractionId={savingAttractionId}
                />
              ))}
            </div>
          )}

          {error && !showSetupForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3"
            >
              <p className="text-sm text-rose-700 dark:text-rose-100">{error}</p>
            </motion.div>
          )}

          {hasAssistantReply && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className={`mt-6 rounded-2xl border p-4 backdrop-blur-sm ${getBorderColor()} ${getCardBg()}`}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("planner.attractions.replyPlaceholder")}
                rows={3}
                className={`w-full rounded-xl border px-4 py-3 placeholder:${getMutedTextColor()} focus:border-lime-400 focus:outline-none transition-colors ${getBorderColor()} ${getInputBg()} ${getTextColor()}`}
              />
              <div className="flex items-center justify-between mt-3">
                <p className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}>
                  {t("common.poweredByGemini")}
                </p>
                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-lime-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? t("planner.attractions.replyLoading")
                    : t("planner.attractions.replySubmit")}
                </motion.button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </section>
  );
}