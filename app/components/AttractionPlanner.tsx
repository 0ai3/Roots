"use client";

import { FormEvent, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
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
};

type AssistantPayload = {
  intro?: string;
  tips?: string[];
  attractions?: Attraction[];
  closing?: string;
};

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

function MessageBubble({
  message,
  onLogAttraction,
  visitedAttractions,
}: {
  message: ChatMessage;
  onLogAttraction: (title: string) => void;
  visitedAttractions: VisitedMap;
}) {
  if (message.role === "assistant") {
    const parsed = parseAssistantContent(message.content);
    if (parsed) {
      return (
        <AssistantCard
          payload={parsed}
          onLogAttraction={onLogAttraction}
          visitedAttractions={visitedAttractions}
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
            ? "border-lime-400/30 bg-lime-400/10 text-lime-50"
            : "border-white/10 bg-white/5 text-white/90"
        }`}
      >
        <p className="mb-2 text-xs uppercase tracking-wide opacity-60">
          {message.role === "user" ? "You" : "Roots Guide"}
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
}: {
  payload: AssistantPayload;
  onLogAttraction: (title: string) => void;
  visitedAttractions: VisitedMap;
}) {
  const tips = payload.tips?.filter(Boolean) ?? [];
  const attractions = payload.attractions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-lime-400/20 bg-neutral-900/50 p-6 backdrop-blur-sm shadow-xl"
    >
      {payload.intro && (
        <p className="text-base text-neutral-900/90 dark:text-white/90 leading-relaxed">
          {payload.intro}
        </p>
      )}

      {tips.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-lime-400" />
            <p className="text-xs uppercase tracking-wide text-neutral-700 dark:text-white/60">
              Quick Tips
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tips.map((tip) => (
              <motion.span
                key={tip}
                whileHover={{ scale: 1.05 }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-900/80 dark:text-white/80"
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
            <p className="text-xs uppercase tracking-wide text-neutral-700 dark:text-white/60">
              Recommended Attractions
            </p>
          </div>
          {attractions.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {item.title}
                  </h3>
                  {item.neighborhood && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-neutral-400 dark:text-white/40" />
                      <p className="text-xs text-neutral-500 dark:text-white/40">
                        {item.neighborhood}
                      </p>
                    </div>
                  )}
                </div>
                {item.cost && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-lime-400/80" />
                    <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-300">
                      {item.cost}
                    </span>
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-neutral-700/80 dark:text-white/80 leading-relaxed mb-3">
                  {item.description}
                </p>
              )}

              {item.mapLink && (
                <motion.a
                  href={item.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  Open in Maps
                </motion.a>
              )}

              {Array.isArray(item.notes) && item.notes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-neutral-700/70 dark:text-white/70">
                  {item.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-lime-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}

              <motion.button
                type="button"
                onClick={() => onLogAttraction(item.title)}
                disabled={Boolean(visitedAttractions[item.title])}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-4 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2 ${
                  visitedAttractions[item.title]
                    ? "border border-lime-400/40 text-lime-300 bg-lime-400/10"
                    : "border border-white/20 text-neutral-900/90 dark:text-white/90 hover:border-lime-400 hover:text-lime-300 hover:bg-lime-400/10"
                }`}
              >
                <Heart className="w-3 h-3" />
                {visitedAttractions[item.title]
                  ? "Logged (+2 pts)"
                  : "I visited (+2 pts)"}
              </motion.button>
            </motion.article>
          ))}
        </div>
      )}

      {payload.closing && (
        <p className="mt-6 text-sm text-neutral-700/70 dark:text-white/70 leading-relaxed">
          {payload.closing}
        </p>
      )}
    </motion.div>
  );
}

const samplePrompts = [
  "Plan a Saturday focused on art and design",
  "Suggest budget-friendly outdoor adventures",
  "Where should I eat if I love street food?",
  "Give me rainy-day ideas with indoor options",
];

function createMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AttractionPlanner({
  initialPoints,
  initialUserId,
}: Props = {}) {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState(
    "I have one free evening and want to experience the city's vibe."
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitedAttractions, setVisitedAttractions] = useState<VisitedMap>({});
  const { points, addPoints } = useExperiencePoints({
    initialPoints,
    initialUserId,
  });
  const hasAssistantReply = messages.some(
    (message) => message.role === "assistant"
  );
  const showSetupForm = !hasAssistantReply;

  const canSubmit =
    location.trim().length > 0 &&
    budget.trim().length > 0 &&
    input.trim().length > 0 &&
    !isLoading;

  const handleLogAttraction = (title: string) => {
    if (!title) {
      return;
    }
    if (visitedAttractions[title]) {
      return;
    }
    setVisitedAttractions((prev) => ({ ...prev, [title]: true }));
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
        throw new Error(
          data?.error ?? "Unable to reach the Roots travel guide."
        );
      }

      if (!data?.reply) {
        throw new Error("Guide reply was empty. Try asking again.");
      }

      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    setMessages([]);
    setInput("I have one free evening and want to experience the city's vibe.");
    setLocation("");
    setBudget("");
    setInterests("");
    setNotes("");
    setError(null);
    setIsLoading(false);
    setVisitedAttractions({});
  };

  return (
    <section className="space-y-6">
      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-lime-400" />
          <p className="text-xs uppercase tracking-wide text-black dark:text-white/60">
            Experience Points
          </p>
        </div>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
          {points}
        </p>
        <p className="text-sm text-neutral-700 dark:text-white/60">
          Log any museum or attraction visit to earn +2 points
        </p>
      </motion.div>

      {/* Setup Form */}
      {showSetupForm && (
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 dark:text-white/60" />
                <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                  City or Region
                </span>
              </div>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g., Mexico City historic center"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
              />
            </label>

            <label className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neutral-500 dark:text-white/60" />
                <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                  Budget
                </span>
              </div>
              <input
                type="text"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="e.g., $120 per day"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
              />
            </label>
          </div>

          <label className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-neutral-500 dark:text-white/60" />
              <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                Interests or Vibe
              </span>
            </div>
            <input
              type="text"
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
              placeholder="Night markets, architecture, coffee shops…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
            />
          </label>

          <label className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-neutral-500 dark:text-white/60" />
              <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                Extra Notes
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Travel dates, accessibility needs, people traveling with you…"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
            />
          </label>

          <label className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-neutral-500 dark:text-white/60" />
              <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                What would you like to ask?
              </span>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a themed itinerary or request specific suggestions…"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-neutral-950 transition-all hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Planning..." : "Plan Activities"}
            </motion.button>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Powered by Google Gemini
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt) => (
              <motion.button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                whileHover={{ scale: 1.05 }}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-neutral-700/70 dark:text-white/70 transition-all hover:border-lime-400 hover:text-white"
              >
                {prompt}
              </motion.button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3"
            >
              <p className="text-sm text-rose-100">{error}</p>
            </motion.div>
          )}
        </motion.form>
      )}

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border border-white/10 p-6 backdrop-blur-sm ${
          showSetupForm
            ? "bg-neutral-900/50"
            : "bg-linear-to-br from-neutral-900/50 to-lime-500/10"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <p className="text-sm font-semibold uppercase tracking-wide text-white">
                {showSetupForm ? "Conversation" : "Roots Concierge"}
              </p>
            </div>
            <p className="text-xs text-white/60">
              {showSetupForm
                ? "Share more context to refine your plan"
                : "Continue chatting with your Roots guide"}
            </p>
          </div>
          {hasAssistantReply && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
                {location || "Location set"}
              </span>
              <span className="rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
                {budget || "Flexible budget"}
              </span>
              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60 transition-all hover:border-rose-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </motion.button>
            </div>
          )}
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-neutral-700 dark:text-white/60 text-center py-8">
            {showSetupForm
              ? "Fill out the form and ask a question to start discovering curated attractions"
              : "Waiting for the Roots guide to respond..."}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onLogAttraction={handleLogAttraction}
                visitedAttractions={visitedAttractions}
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
            <p className="text-sm text-rose-100">{error}</p>
          </motion.div>
        )}

        {hasAssistantReply && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell the Roots guide what you'd like to explore next..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Powered by Google Gemini
              </p>
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-lime-500 px-5 py-2 text-sm font-semibold text-neutral-950 transition-all hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </section>
  );
}
