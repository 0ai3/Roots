"use client";

import useSWR from "swr";
import DashboardPageLayout from "./DashboardPageLayout";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/app/hooks/useI18n";

type LeaderboardEntry = {
  userId: string;
  name: string;
  points: number;
  rank: number;
};

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .catch(() => ({ entries: [] }));

type Translator = ReturnType<typeof useI18n>["t"];

export default function LeaderboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        const dark = saved === "dark";
        setIsDarkMode(dark);
        if (dark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const { userId } = useExperiencePoints();
  const { data, isLoading } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 30_000,
  });
  const { t } = useI18n();

  const entries: LeaderboardEntry[] = data?.entries ?? [];
  const current = userId
    ? entries.find((entry) => entry.userId === userId)
    : undefined;

  return (
    <DashboardPageLayout
      title={t("leaderboard.title")}
      description={t("leaderboard.description")}
      isDarkMode={isDarkMode}
    >
      <div className="space-y-6">
        {/* Theme toggle (dashboard-style) */}
        <div className="flex justify-end">
          <motion.button
            type="button"
            onClick={() => {
              const next = !isDarkMode;
              setIsDarkMode(next);
              try {
                if (next) document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", next ? "dark" : "light");
              } catch (e) {
                // noop
              }
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              isDarkMode
                ? "bg-neutral-800/60 text-white border border-neutral-700"
                : "bg-white/90 text-neutral-900 border border-neutral-200"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </motion.button>
        </div>
        {/* Current User Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            `rounded-2xl p-6 backdrop-blur-sm ` +
            (isDarkMode
              ? "border border-white/10 bg-white/5 text-white"
              : "border border-neutral-200 bg-white text-neutral-900 shadow-sm")
          }
        >
          {userId ? (
            current ? (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <p className="text-white/80">
                  {t("leaderboard.status.rank", {
                    rank: String(current.rank),
                    points: current.points.toLocaleString(),
                  })}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-white/80">
                  {t("leaderboard.status.noRank")}
                </p>
              </div>
            )
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className={isDarkMode ? "text-white/80" : "text-neutral-800"}>
                {t("leaderboard.status.signedOut")}
              </p>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <LeaderboardTable
          entries={entries}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          t={t}
        />
      </div>
    </DashboardPageLayout>
  );
}

function LeaderboardTable({
  entries,
  isLoading,
  isDarkMode,
  t,
}: {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  isDarkMode: boolean;
  t: Translator;
}) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl p-8 text-center backdrop-blur-sm ${
          isDarkMode
            ? "border border-white/10 bg-white/5 text-white"
            : "border border-neutral-200 bg-white text-neutral-900"
        }`}
      >
        <div
          className={`flex items-center justify-center gap-3 ${
            isDarkMode ? "text-white/60" : "text-neutral-800"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <p>{t("leaderboard.loading")}</p>
        </div>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl p-8 text-center backdrop-blur-sm ${
          isDarkMode
            ? "border border-white/10 bg-white/5 text-white"
            : "border border-neutral-200 bg-white text-neutral-900"
        }`}
      >
        <Trophy
          className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? "text-white/30" : "text-neutral-500"
          }`}
        />
        <p className={`${isDarkMode ? "text-white/60" : "text-neutral-700"}`}>
          {t("leaderboard.empty.title")}
        </p>
        <p
          className={`${
            isDarkMode
              ? "text-white/40 text-sm mt-2"
              : "text-neutral-600 text-sm mt-2"
          }`}
        >
          {t("leaderboard.empty.subtitle")}
        </p>
      </motion.div>
    );
  }

  const getRankStyle = (rank: number, dark: boolean) => {
    // Return styles adapted for dark or light mode
    switch (rank) {
      case 1:
        return {
          background: dark
            ? "bg-gradient-to-r from-yellow-500/5 to-amber-500/2"
            : "bg-gradient-to-r from-yellow-50/50 to-amber-50/50",
          iconColor: dark ? "text-yellow-400/70" : "text-yellow-600",
          pointsColor: dark ? "text-yellow-300/80" : "text-yellow-600",
          rankColor: dark ? "text-yellow-400/70" : "text-yellow-600",
        };
      case 2:
        return {
          background: dark
            ? "bg-gradient-to-r from-gray-400/5 to-gray-300/2"
            : "bg-gradient-to-r from-gray-50/40 to-gray-50/20",
          iconColor: dark ? "text-gray-300/70" : "text-gray-600",
          pointsColor: dark ? "text-gray-200/80" : "text-gray-600",
          rankColor: dark ? "text-gray-300/70" : "text-gray-600",
        };
      case 3:
        return {
          background: dark
            ? "bg-gradient-to-r from-amber-700/5 to-amber-600/2"
            : "bg-gradient-to-r from-amber-50/40 to-amber-50/20",
          iconColor: dark ? "text-amber-600/70" : "text-amber-600",
          pointsColor: dark ? "text-amber-500/80" : "text-amber-600",
          rankColor: dark ? "text-amber-600/70" : "text-amber-600",
        };
      default:
        return {
          background: dark ? "hover:bg-white/3" : "hover:bg-neutral-100",
          iconColor: dark ? "text-white/50" : "text-neutral-700",
          pointsColor: dark ? "text-lime-300/80" : "text-lime-600",
          rankColor: dark ? "text-white/60" : "text-neutral-700",
        };
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5" />;
      case 2:
        return <Medal className="w-5 h-5" />;
      case 3:
        return <Medal className="w-5 h-5" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`overflow-hidden rounded-2xl backdrop-blur-sm ${
        isDarkMode
          ? "border border-white/10 bg-white/5 text-white"
          : "border border-neutral-200 bg-white text-neutral-900"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? "border-b border-white/10 bg-white/10"
            : "border-b border-neutral-200 bg-white/50"
        } px-6 py-4`}
      />
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-lime-400/80" />
          <h3
            className={`font-semibold ${
              isDarkMode ? "text-white" : "text-neutral-900"
            }`}
          >
            {t("leaderboard.table.heading")}
          </h3>
        </div>
      </div>    
      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        <ul className="divide-y divide-white/5">
          {entries.map((entry, index) => {
            const rankStyle = getRankStyle(entry.rank, isDarkMode);

            return (
              <motion.li
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-6 py-4 transition-all ${rankStyle.background}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          entry.rank <= 3 ? "bg-white/5" : "bg-white/3"
                        }`}
                      >
                        <span className={rankStyle.iconColor}>
                          {entry.rank <= 3 ? (
                            getRankIcon(entry.rank)
                          ) : (
                            <span
                              className={`text-sm font-semibold ${rankStyle.rankColor}`}
                            >
                              {entry.rank}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <span
                        className={`font-medium ${
                          entry.rank <= 3
                            ? isDarkMode
                              ? "text-white"
                              : "text-neutral-900"
                            : isDarkMode
                            ? "text-white/90"
                            : "text-neutral-900"
                        }`}
                      >
                        {entry.name}
                      </span>
                      <div
                        className={`${
                          isDarkMode
                            ? "text-white/50 text-xs"
                            : "text-neutral-600 text-xs"
                        }`}
                      >
                        {t("leaderboard.idLabel", {
                          id: entry.userId.slice(-6),
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div
                      className={`text-lg font-semibold ${rankStyle.pointsColor}`}
                    >
                      {entry.points.toLocaleString()}
                    </div>
                    <div
                      className={`${
                        isDarkMode
                          ? "text-white/50 text-xs"
                          : "text-neutral-600 text-xs"
                      }`}
                    >
                      {t("leaderboard.points")}
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div
        className={`${
          isDarkMode
            ? "border-t border-white/10 bg-white/5"
            : "border-t border-neutral-200 bg-white/50"
        } px-6 py-3`}
      >
        <p
          className={`${
            isDarkMode ? "text-white/50" : "text-neutral-600"
          } text-xs text-center`}
        >
          {t("leaderboard.footer", { count: String(entries.length) })}
        </p>
      </div>
    </motion.div>
  );
}
