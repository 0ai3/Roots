"use client";

import useSWR from "swr";
import DashboardPageLayout from "./DashboardPageLayout";
import { useExperiencePoints } from "../hooks/useExperiencePoints";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star } from "lucide-react";

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

export default function LeaderboardPage() {
  const { userId } = useExperiencePoints();
  const { data, isLoading } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 30_000,
  });

  const entries: LeaderboardEntry[] = data?.entries ?? [];
  const current = userId
    ? entries.find((entry) => entry.userId === userId)
    : undefined;

  return (
    <DashboardPageLayout
      title="Leaderboard"
      description="Track the most active Roots explorers and their experience points."
    >
      <div className="space-y-6">
        {/* Current User Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          {userId ? (
            current ? (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <p className="text-white/80">
                  You're currently <strong className="text-lime-300">#{current.rank}</strong> with{" "}
                  <strong className="text-lime-300">{current.points}</strong> points. Keep cooking and exploring!
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-white/80">Earn points to join the leaderboard.</p>
              </div>
            )
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className="text-white/80">Sign in to see your rank on the leaderboard.</p>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <LeaderboardTable entries={entries} isLoading={isLoading} />
      </div>
    </DashboardPageLayout>
  );
}

function LeaderboardTable({ entries, isLoading }: { entries: LeaderboardEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-3 text-white/60">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <p>Loading leaderboard…</p>
        </div>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm"
      >
        <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60">No explorers have logged points yet.</p>
        <p className="text-white/40 text-sm mt-2">Be the first to earn experience points!</p>
      </motion.div>
    );
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          background: "bg-gradient-to-r from-yellow-500/5 to-amber-500/2",
          iconColor: "text-yellow-400/70",
          pointsColor: "text-yellow-300/80",
          rankColor: "text-yellow-400/70"
        };
      case 2:
        return {
          background: "bg-gradient-to-r from-gray-400/5 to-gray-300/2",
          iconColor: "text-gray-300/70",
          pointsColor: "text-gray-200/80",
          rankColor: "text-gray-300/70"
        };
      case 3:
        return {
          background: "bg-gradient-to-r from-amber-700/5 to-amber-600/2",
          iconColor: "text-amber-600/70",
          pointsColor: "text-amber-500/80",
          rankColor: "text-amber-600/70"
        };
      default:
        return {
          background: "hover:bg-white/3",
          iconColor: "text-white/50",
          pointsColor: "text-lime-300/80",
          rankColor: "text-white/60"
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
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-lime-400/80" />
          <h3 className="font-semibold text-white">Top Explorers</h3>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-h-96 overflow-y-auto">
        <ul className="divide-y divide-white/5">
          {entries.map((entry, index) => {
            const rankStyle = getRankStyle(entry.rank);
            
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.rank <= 3 
                          ? "bg-white/5" 
                          : "bg-white/3"
                      }`}>
                        <span className={rankStyle.iconColor}>
                          {entry.rank <= 3 ? (
                            getRankIcon(entry.rank)
                          ) : (
                            <span className={`text-sm font-semibold ${rankStyle.rankColor}`}>
                              {entry.rank}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <span className={`font-medium ${
                        entry.rank <= 3 ? "text-white" : "text-white/90"
                      }`}>
                        {entry.name}
                      </span>
                      <div className="text-xs text-white/50">
                        ID: {entry.userId.slice(-6)}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${rankStyle.pointsColor}`}>
                      {entry.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/50">points</div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-white/5 px-6 py-3">
        <p className="text-xs text-white/50 text-center">
          Updated every 30 seconds • {entries.length} explorers
        </p>
      </div>
    </motion.div>
  );
}