"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useExperiencePoints } from "../hooks/useExperiencePoints";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type LearnEarnModule = {
  country: string;
  summary: string;
  reading: string[];
  quiz: QuizQuestion[];
};

type Props = {
  initialPoints?: number;
  initialUserId?: string | null;
};

const COUNTRY_SUGGESTIONS = [
  "Japan",
  "Morocco",
  "Mexico",
  "South Korea",
  "Ghana",
  "Italy",
];

export default function LearnAndEarnGame({
  initialPoints,
  initialUserId,
}: Props) {
  const { addPoints } = useExperiencePoints({ initialPoints, initialUserId });
  const [countryInput, setCountryInput] = useState("");
  const [moduleData, setModuleData] = useState<LearnEarnModule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );
  const [lastAward, setLastAward] = useState<number | null>(null);

  const quizLength = moduleData?.quiz.length ?? 0;
  const currentQuestionData = useMemo(() => {
    if (!moduleData || moduleData.quiz.length === 0) {
      return null;
    }
    return moduleData.quiz[currentQuestion] ?? null;
  }, [moduleData, currentQuestion]);

  useEffect(() => {
    if (!moduleData) {
      setAnswers([]);
      setIsQuizActive(false);
      setIsComplete(false);
      setCurrentQuestion(0);
      setScore(0);
      setShowFeedback(false);
      setLastAnswerCorrect(null);
      return;
    }
    setAnswers(new Array(moduleData.quiz.length).fill(-1));
    setScore(0);
    setIsQuizActive(false);
    setIsComplete(false);
    setCurrentQuestion(0);
    setShowFeedback(false);
    setLastAnswerCorrect(null);
  }, [moduleData]);

  const handleGenerateModule = async (event?: FormEvent) => {
    event?.preventDefault?.();
    const trimmedCountry = countryInput.trim();
    if (!trimmedCountry) {
      setGenerateError("Please enter a country to explore.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setLastAward(null);

    try {
      const response = await fetch("/api/games/learn-earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: trimmedCountry }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to generate module.");
      }

      if (!data?.module?.quiz || data.module.quiz.length === 0) {
        throw new Error("Gemini returned an empty module. Try a different country.");
      }

      setModuleData(data.module);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    if (!moduleData) {
      return;
    }
    setIsQuizActive(true);
    setIsComplete(false);
    setCurrentQuestion(0);
    setAnswers(new Array(moduleData.quiz.length).fill(-1));
    setScore(0);
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    setLastAward(null);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!moduleData || showFeedback || !isQuizActive || !currentQuestionData) {
      return;
    }
    const isCorrect = optionIndex === currentQuestionData.answer;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);
  };

  const finishQuiz = () => {
    if (!moduleData) {
      return;
    }
    const totalCorrect = moduleData.quiz.reduce((acc, question, index) => {
      return acc + (answers[index] === question.answer ? 1 : 0);
    }, 0);
    setScore(totalCorrect);
    setIsComplete(true);
    setIsQuizActive(false);
    setShowFeedback(false);
    setLastAnswerCorrect(null);
    setLastAward(totalCorrect);
    if (totalCorrect > 0) {
      addPoints(totalCorrect);
    }
  };

  const handleNextQuestion = () => {
    if (!moduleData || !showFeedback) {
      return;
    }
    const nextIndex = currentQuestion + 1;
    if (nextIndex < moduleData.quiz.length) {
      setCurrentQuestion(nextIndex);
      setShowFeedback(false);
      setLastAnswerCorrect(null);
    } else {
      finishQuiz();
    }
  };

  const optionStateFor = (index: number) => {
    if (!moduleData || !currentQuestionData || !showFeedback) {
      return "neutral" as const;
    }
    if (index === currentQuestionData.answer) {
      return "correct" as const;
    }
    if (answers[currentQuestion] === index) {
      return "incorrect" as const;
    }
    return "disabled" as const;
  };

  const currentCountry = moduleData?.country ?? "";

  return (
    <section className="mt-4 space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">
              Generate a Learn & Earn module
            </p>
            <h2 className="text-2xl font-semibold">
              Ask for any country’s traditions and earn points
            </h2>
          </div>
          {lastAward !== null && (
            <div className="rounded-full border border-emerald-300/50 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
              +{lastAward} experience points awarded
            </div>
          )}
        </div>

        <form
          onSubmit={handleGenerateModule}
          className="mt-6 flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            value={countryInput}
            onChange={(event) => setCountryInput(event.target.value)}
            placeholder="e.g., Peru, Thailand, Brazil"
            className="flex-1 rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-amber-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              "Generate module"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {COUNTRY_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setCountryInput(suggestion);
                setGenerateError(null);
              }}
              className="rounded-full border border-white/15 px-3 py-1 text-white/70 transition hover:border-amber-300 hover:text-amber-200"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {generateError && (
          <p className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {generateError}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        {!moduleData && !isGenerating && (
          <div className="text-white/70">
            <p>
              Enter a country above to receive a cultural summary and a 10-question quiz
              generated on the spot.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
            Crafting your learn & earn module...
          </div>
        )}

        {moduleData && !isGenerating && (
          <div className="space-y-6">
            <header>
              <p className="text-xs uppercase tracking-wide text-white/50">
                {moduleData.country}
              </p>
              <h3 className="text-2xl font-semibold">{moduleData.summary}</h3>
            </header>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              {moduleData.reading.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-white/80">
                  {paragraph}
                </p>
              ))}
            </div>

            {!isQuizActive && !isComplete && (
              <button
                type="button"
                onClick={handleStartQuiz}
                className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Start 10-question quiz for {currentCountry}
              </button>
            )}

            {isQuizActive && currentQuestionData && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                  <span>
                    Question {currentQuestion + 1} of {quizLength}
                  </span>
                  <span>Score: {score}</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {currentQuestionData.question}
                </p>
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => {
                    const state = optionStateFor(index);
                    return (
                      <button
                        key={`${currentQuestionData.id}-${option}`}
                        type="button"
                        onClick={() => handleSelectOption(index)}
                        disabled={showFeedback}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          state === "correct"
                            ? "border-emerald-300/70 bg-emerald-400/10 text-emerald-100"
                            : state === "incorrect"
                            ? "border-rose-300/70 bg-rose-400/10 text-rose-100"
                            : state === "disabled"
                            ? "border-white/5 bg-transparent text-white/40"
                            : "border-white/15 bg-transparent hover:border-amber-200 hover:text-amber-100"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
                    <p className="font-semibold">
                      {lastAnswerCorrect ? "Great memory!" : "Take another look"}
                    </p>
                    <p className="mt-2">{currentQuestionData.explanation}</p>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-amber-300"
                    >
                      {currentQuestion + 1 === quizLength
                        ? "View results"
                        : "Next question"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {isComplete && moduleData && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <header>
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    Quiz complete
                  </p>
                  <h3 className="text-2xl font-semibold">
                    You scored {score} / {quizLength}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    Each correct answer awards +1 experience point.
                  </p>
                </header>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:border-amber-200 hover:text-amber-100"
                  >
                    Retake this quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComplete(false)}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:border-amber-200 hover:text-amber-100"
                  >
                    Review the story
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
