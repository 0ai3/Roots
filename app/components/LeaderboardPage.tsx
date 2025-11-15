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

  // Theme management - improved version
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
          // Fallback to system preference
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(systemDark);
          if (systemDark) {
            document.documentElement.classList.add("dark");
          }
        }
      } catch (e) {
        // ignore
      }
    };

    updateTheme();

    // Listen for theme changes from other components
    const handleThemeChange = (event: CustomEvent) => {
      setIsDarkMode(event.detail.isDark);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    
    // Listen for system theme changes
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

  // Theme is controlled by the global ThemeToggle provider

  const { userId } = useExperiencePoints();
  const { data, isLoading } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 30_000,
  });
  const { t } = useI18n();

  const entries: LeaderboardEntry[] = data?.entries ?? [];
  const current = userId
    ? entries.find((entry) => entry.userId === userId)
    : undefined;

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

  return (
    <DashboardPageLayout
      title={t("leaderboard.title")}
      description={t("leaderboard.description")}
      isDarkMode={isDarkMode}
    >
      <div className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}>
        <div className="space-y-6 p-6">
          {/* Theme is controlled by the global ThemeToggle component */}

          {/* Current User Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 backdrop-blur-sm border ${getBorderColor()} ${getCardBg()}`}
          >
            {userId ? (
              current ? (
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-lime-400" />
                  <p className={getMutedTextColor()}>
                    {t("leaderboard.status.rank", {
                      rank: String(current.rank),
                      points: current.points.toLocaleString(),
                    })}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <p className={getMutedTextColor()}>
                    {t("leaderboard.status.noRank")}
                  </p>
                </div>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <p className={getMutedTextColor()}>
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
  // Color utility functions for the table component
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
    return isDarkMode ? "bg-white/5" : "bg-white";
  };

  const getHeaderBg = () => {
    return isDarkMode ? "bg-white/10" : "bg-slate-50";
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl p-8 text-center backdrop-blur-sm border ${getBorderColor()} ${getCardBg()}`}
      >
        <div className={`flex items-center justify-center gap-3 ${getMutedTextColor()}`}>
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
        className={`rounded-2xl p-8 text-center backdrop-blur-sm border ${getBorderColor()} ${getCardBg()}`}
      >
        <Trophy
          className={`w-12 h-12 mx-auto mb-4 ${getMutedTextColor()}`}
        />
        <p className={getMutedTextColor()}>
          {t("leaderboard.empty.title")}
        </p>
        <p className={`${getMutedTextColor()} text-sm mt-2`}>
          {t("leaderboard.empty.subtitle")}
        </p>
      </motion.div>
    );
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          background: isDarkMode
            ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/5"
            : "bg-gradient-to-r from-yellow-50 to-amber-50",
          iconColor: isDarkMode ? "text-yellow-400" : "text-yellow-600",
          pointsColor: isDarkMode ? "text-yellow-300" : "text-yellow-600",
          rankColor: isDarkMode ? "text-yellow-400" : "text-yellow-600",
          border: isDarkMode ? "border-yellow-500/20" : "border-yellow-200",
        };
      case 2:
        return {
          background: isDarkMode
            ? "bg-gradient-to-r from-gray-400/10 to-gray-300/5"
            : "bg-gradient-to-r from-gray-50 to-gray-100",
          iconColor: isDarkMode ? "text-gray-300" : "text-gray-600",
          pointsColor: isDarkMode ? "text-gray-200" : "text-gray-600",
          rankColor: isDarkMode ? "text-gray-300" : "text-gray-600",
          border: isDarkMode ? "border-gray-400/20" : "border-gray-200",
        };
      case 3:
        return {
          background: isDarkMode
            ? "bg-gradient-to-r from-amber-700/10 to-amber-600/5"
            : "bg-gradient-to-r from-amber-50 to-amber-100",
          iconColor: isDarkMode ? "text-amber-600" : "text-amber-600",
          pointsColor: isDarkMode ? "text-amber-500" : "text-amber-600",
          rankColor: isDarkMode ? "text-amber-600" : "text-amber-600",
          border: isDarkMode ? "border-amber-600/20" : "border-amber-200",
        };
      default:
        return {
          background: isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50",
          iconColor: isDarkMode ? "text-white/50" : "text-slate-500",
          pointsColor: isDarkMode ? "text-lime-300" : "text-lime-600",
          rankColor: isDarkMode ? "text-white/60" : "text-slate-700",
          border: isDarkMode ? "border-white/5" : "border-slate-100",
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
      className={`overflow-hidden rounded-2xl backdrop-blur-sm border ${getBorderColor()} ${getCardBg()}`}
    >
      {/* Header - Fixed JSX structure */}
      <div className={`border-b ${getBorderColor()} ${getHeaderBg()} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-lime-400" />
          <h3 className={`font-semibold ${getTextColor()}`}>
            {t("leaderboard.table.heading")}
          </h3>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        <ul className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-slate-200"}`}>
          {entries.map((entry, index) => {
            const rankStyle = getRankStyle(entry.rank);

            return (
              <motion.li
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-6 py-4 transition-all border-l-4 ${rankStyle.background} ${rankStyle.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-white/10" : "bg-slate-100"
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
                            ? getTextColor()
                            : isDarkMode
                            ? "text-white/90"
                            : "text-slate-900"
                        }`}
                      >
                        {entry.name}
                      </span>
                      <div className={`${getMutedTextColor()} text-xs`}>
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
                    <div className={`${getMutedTextColor()} text-xs`}>
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
      <div className={`border-t ${getBorderColor()} ${getHeaderBg()} px-6 py-3`}>
        <p className={`${getMutedTextColor()} text-xs text-center`}>
          {t("leaderboard.footer", { count: String(entries.length) })}
        </p>
      </div>
    </motion.div>
  );
}