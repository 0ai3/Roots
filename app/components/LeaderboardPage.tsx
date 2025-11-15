"use client";

import useSWR from "swr";
import DashboardPageLayout from "./DashboardPageLayout";
import PageThemeToggle from "./PageThemeToggle";
import { useTheme } from "./ThemeProvider";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Sun,
  Moon,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/app/hooks/useI18n";
import Image from "next/image";

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
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBrowse, setShowBrowse] = useState(true);

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
          // Fallback to system preference
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(systemDark);
          if (systemDark) {
            document.documentElement.classList.add("dark");
          }
        }
      } catch {
        setError("Failed to load leaderboard");
      }
    };
    setIsDarkMode(theme === "dark");
  }, [theme]);

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
      <PageThemeToggle />
      {showBrowse ? (
        <div className={`min-h-screen ${getBgColor()}`}>
          {/* Hero Section */}
          <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070"
                alt="Competition leaderboard"
                fill
                className="object-cover"
                priority
              />
              <div
                className={`absolute inset-0 ${
                  isDarkMode
                    ? "bg-linear-to-br from-black/80 via-black/70 to-black/80"
                    : "bg-linear-to-br from-black/60 via-black/50 to-black/60"
                }`}
              />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Trophy className="w-4 h-4 text-lime-400" />
                <span className="text-sm font-medium">Global Rankings</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Global{" "}
                <span
                  className={isDarkMode ? "text-lime-400" : "text-lime-300"}
                >
                  Leaderboard
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
              >
                Compete with cultural explorers worldwide and climb the ranks by
                earning experience points
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBrowse(false)}
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
                    isDarkMode
                      ? "bg-lime-400 text-black hover:bg-lime-300"
                      : "bg-lime-500 text-white hover:bg-lime-600"
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  View Rankings
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="relative z-20 -mt-20 mb-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Users,
                    label: "Total Players",
                    value: entries.length,
                    color: "lime",
                    desc: "Active competitors",
                  },
                  {
                    icon: Trophy,
                    label: "Your Rank",
                    value: current?.rank ? `#${current.rank}` : "N/A",
                    color: "yellow",
                    desc: current
                      ? `${current.points.toLocaleString()} points`
                      : "Not ranked yet",
                  },
                  {
                    icon: Award,
                    label: "Top Score",
                    value: entries[0]?.points?.toLocaleString() || "0",
                    color: "orange",
                    desc: "Highest points earned",
                  },
                  {
                    icon: Zap,
                    label: "This Month",
                    value: "+15%",
                    color: "blue",
                    desc: "Average growth",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`rounded-2xl p-6 backdrop-blur-sm border ${
                      isDarkMode
                        ? "bg-neutral-900/90 border-white/10"
                        : "bg-white border-neutral-200 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          stat.color === "lime"
                            ? isDarkMode
                              ? "bg-lime-400/20"
                              : "bg-lime-100"
                            : stat.color === "yellow"
                            ? isDarkMode
                              ? "bg-yellow-400/20"
                              : "bg-yellow-100"
                            : stat.color === "orange"
                            ? isDarkMode
                              ? "bg-orange-400/20"
                              : "bg-orange-100"
                            : isDarkMode
                            ? "bg-blue-400/20"
                            : "bg-blue-100"
                        }`}
                      >
                        <stat.icon
                          className={`w-6 h-6 ${
                            stat.color === "lime"
                              ? isDarkMode
                                ? "text-lime-400"
                                : "text-lime-600"
                              : stat.color === "yellow"
                              ? isDarkMode
                                ? "text-yellow-400"
                                : "text-yellow-600"
                              : stat.color === "orange"
                              ? isDarkMode
                                ? "text-orange-400"
                                : "text-orange-600"
                              : isDarkMode
                              ? "text-blue-400"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${
                            isDarkMode ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      {stat.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Top 3 Podium */}
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2
                  className={`text-4xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Top{" "}
                  <span
                    className={
                      isDarkMode ? "text-lime-400" : "text-emerald-600"
                    }
                  >
                    Champions
                  </span>
                </h2>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Leading the cultural exploration movement
                </p>
              </motion.div>

              {entries.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-2xl p-6 text-center border backdrop-blur-sm ${
                      isDarkMode
                        ? "bg-neutral-900/50 border-gray-400/20"
                        : "bg-white border-gray-300 shadow-lg"
                    } md:mt-8`}
                  >
                    <div className="relative inline-block mb-4">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-400/20" : "bg-gray-100"
                        }`}
                      >
                        <Medal
                          className={`w-10 h-10 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-400 text-white font-bold flex items-center justify-center text-sm">
                        2
                      </div>
                    </div>
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        isDarkMode ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {entries[1].name}
                    </h3>
                    <p
                      className={`text-2xl font-bold mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {entries[1].points.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      points
                    </p>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl p-6 text-center border backdrop-blur-sm ${
                      isDarkMode
                        ? "bg-linear-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30"
                        : "bg-linear-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-xl"
                    }`}
                  >
                    <div className="relative inline-block mb-4">
                      <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-yellow-400/20" : "bg-yellow-100"
                        }`}
                      >
                        <Crown
                          className={`w-12 h-12 ${
                            isDarkMode ? "text-yellow-400" : "text-yellow-600"
                          }`}
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">
                        1
                      </div>
                    </div>
                    <h3
                      className={`font-bold text-xl mb-2 ${
                        isDarkMode ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {entries[0].name}
                    </h3>
                    <p
                      className={`text-3xl font-bold mb-1 ${
                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    >
                      {entries[0].points.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-yellow-300/70" : "text-yellow-700"
                      }`}
                    >
                      points
                    </p>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-2xl p-6 text-center border backdrop-blur-sm ${
                      isDarkMode
                        ? "bg-neutral-900/50 border-amber-600/20"
                        : "bg-white border-amber-300 shadow-lg"
                    } md:mt-8`}
                  >
                    <div className="relative inline-block mb-4">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-amber-600/20" : "bg-amber-100"
                        }`}
                      >
                        <Medal
                          className={`w-10 h-10 ${
                            isDarkMode ? "text-amber-600" : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                        3
                      </div>
                    </div>
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        isDarkMode ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {entries[2].name}
                    </h3>
                    <p
                      className={`text-2xl font-bold mb-1 ${
                        isDarkMode ? "text-amber-500" : "text-amber-600"
                      }`}
                    >
                      {entries[2].points.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      points
                    </p>
                  </motion.div>
                </div>
              )}

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBrowse(false)}
                  className={`px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-neutral-800 text-white hover:bg-neutral-700"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                  }`}
                >
                  View Full Leaderboard
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div
          className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}
        >
          <div className="flex justify-between items-center mb-6 px-6 pt-6">
            <button
              onClick={() => setShowBrowse(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                isDarkMode
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              }`}
            >
              ← Back to Overview
            </button>
          </div>
          <div className="space-y-6 p-6">
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
      )}
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
        <div
          className={`flex items-center justify-center gap-3 ${getMutedTextColor()}`}
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
        className={`rounded-2xl p-8 text-center backdrop-blur-sm border ${getBorderColor()} ${getCardBg()}`}
      >
        <Trophy className={`w-12 h-12 mx-auto mb-4 ${getMutedTextColor()}`} />
        <p className={getMutedTextColor()}>{t("leaderboard.empty.title")}</p>
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
      <div
        className={`border-b ${getBorderColor()} ${getHeaderBg()} px-6 py-4`}
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-lime-400" />
          <h3 className={`font-semibold ${getTextColor()}`}>
            {t("leaderboard.table.heading")}
          </h3>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        <ul
          className={`divide-y ${
            isDarkMode ? "divide-white/5" : "divide-slate-200"
          }`}
        >
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
      <div
        className={`border-t ${getBorderColor()} ${getHeaderBg()} px-6 py-3`}
      >
        <p className={`${getMutedTextColor()} text-xs text-center`}>
          {t("leaderboard.footer", { count: String(entries.length) })}
        </p>
      </div>
    </motion.div>
  );
}
