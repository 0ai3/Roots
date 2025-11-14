"use client";

import useSWR from "swr";
import DashboardPageLayout from "./DashboardPageLayout";
import { useExperiencePoints } from "../hooks/useExperiencePoints";

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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
          {userId ? (
            current ? (
              <p>
                You’re currently <strong>#{current.rank}</strong> with{" "}
                <strong>{current.points}</strong> points. Keep cooking and exploring!
              </p>
            ) : (
              <p>Earn points to join the leaderboard.</p>
            )
          ) : (
            <p>Sign in to see your rank on the leaderboard.</p>
          )}
        </div>

        <LeaderboardTable entries={entries} isLoading={isLoading} />
      </div>
    </DashboardPageLayout>
  );
}

function LeaderboardTable({ entries, isLoading }: { entries: LeaderboardEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
        Loading leaderboard…
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
        No explorers have logged points yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="grid grid-cols-4 border-b border-white/10 bg-white/10 px-6 py-3 text-xs uppercase tracking-wide text-white/60">
        <span>Rank</span>
        <span>Name</span>
        <span className="text-center">Points</span>
        <span className="text-right">User</span>
      </div>
      <ul className="divide-y divide-white/5">
        {entries.map((entry) => (
          <li
            key={entry.userId}
            className="grid grid-cols-4 items-center px-6 py-4 text-sm text-white/80"
          >
            <span className="font-semibold text-white">#{entry.rank}</span>
            <span>{entry.name}</span>
            <span className="text-center text-lg font-semibold text-emerald-300">
              {entry.points}
            </span>
            <span className="text-right text-xs text-white/50">
              {entry.userId.slice(-6)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
