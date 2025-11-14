"use client";

import { FormEvent, useState } from "react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";

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
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl rounded-3xl border px-5 py-4 text-sm leading-relaxed shadow-md ${
          message.role === "user"
            ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-50"
            : "border-white/10 bg-white/5 text-white/90"
        }`}
      >
        <p className="mb-2 text-xs uppercase tracking-wide opacity-60">
          {message.role === "user" ? "You" : "Roots Guide"}
        </p>
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
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
    <div className="rounded-3xl border border-emerald-300/30 bg-slate-900/70 p-6 shadow-xl">
      {payload.intro && (
        <p className="text-base text-emerald-50">{payload.intro}</p>
      )}

      {tips.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-white/40">
            Quick tips
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
            {tips.map((tip) => (
              <li key={tip} className="rounded-full border border-white/10 px-3 py-1">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {attractions.length > 0 && (
        <div className="mt-8 space-y-4">
          {attractions.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  {item.neighborhood && (
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {item.neighborhood}
                    </p>
                  )}
                </div>
                {item.cost && (
                  <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-xs text-emerald-200">
                    {item.cost}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-3 text-sm text-white/80">{item.description}</p>
              )}

              {item.mapLink && (
                <a
                  href={item.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Open in Maps
                </a>
              )}

              {Array.isArray(item.notes) && item.notes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {item.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-emerald-300">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => onLogAttraction(item.title)}
                disabled={Boolean(visitedAttractions[item.title])}
                className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  visitedAttractions[item.title]
                    ? "border border-emerald-300/40 text-emerald-200"
                    : "border border-white/20 text-white hover:border-emerald-300 hover:text-emerald-200"
                }`}
              >
                {visitedAttractions[item.title] ? "Logged (+2 pts)" : "I visited (+2 pts)"}
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

const samplePrompts = [
  "Plan a Saturday focused on art and design.",
  "Suggest budget-friendly outdoor adventures.",
  "Where should I eat if I love street food?",
  "Give me rainy-day ideas with indoor options.",
];

function createMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AttractionPlanner({ initialPoints, initialUserId }: Props = {}) {
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
  const { points, addPoints } = useExperiencePoints({ initialPoints, initialUserId });
  const hasAssistantReply = messages.some((message) => message.role === "assistant");
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
    setVisitedAttractions((prev) => {
      if (prev[title]) {
        return prev;
      }
      addPoints(2);
      return { ...prev, [title]: true };
    });
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
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to reach the Gemini travel guide.");
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
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wide text-white/50">Experience points</p>
        <p className="text-3xl font-semibold text-white">{points}</p>
        <p className="text-xs text-white/50">
          Log any museum or attraction visit to earn +2 pts.
        </p>
      </div>
      {showSetupForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>City or region</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g., Mexico City historic center"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-white/80">
              <span>Budget</span>
              <input
                type="text"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="e.g., $120 per day"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Interests or vibe</span>
            <input
              type="text"
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
              placeholder="Night markets, architecture, coffee shops…"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Extra notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Travel dates, accessibility needs, people traveling with you…"
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>What would you like to ask?</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a themed itinerary or request specific suggestions…"
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
              {isLoading ? "Planning..." : "Plan Activities"}
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
                className="rounded-full border border-white/20 px-4 py-2 transition hover:border-emerald-300 hover:text-white"
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
            : "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),rgba(2,6,23,0.95))]"
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
              {showSetupForm ? "Conversation" : "Roots Concierge"}
            </p>
            <p className="text-xs text-white/40">
              {showSetupForm
                ? "Share more context to refine your plan."
                : "Continue chatting with your Roots guide."}
            </p>
          </div>
          {hasAssistantReply && (
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {location || "Location set"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {budget || "Flexible budget"}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-rose-300 hover:text-white"
              >
                Reset trip
              </button>
            </div>
          )}
        </div>

       {messages.length === 0 ? (
         <p className="text-sm text-white/60">
           {showSetupForm
             ? "Fill out the form and ask a question to start discovering curated attractions."
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
              placeholder="Tell the Roots guide what you'd like to explore next..."
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
              <span>Powered by Google Gemini</span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
