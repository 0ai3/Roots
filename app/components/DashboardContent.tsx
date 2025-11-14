"use client";

import { useMemo, useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { useExperiencePoints } from "../hooks/useExperiencePoints";

type Role = "client" | "admin";

type DashboardUser = {
  email: string;
  role: Role;
  createdAt: string;
  name?: string | null;
};

type Props = {
  user: DashboardUser;
};

export default function DashboardContent({ user }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { points } = useExperiencePoints();
  const greetingName = useMemo(() => {
    const trimmed = user.name?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "User";
  }, [user.name]);

  const themeClasses = isDarkMode
    ? "bg-slate-900 text-white"
    : "bg-white text-slate-900";

  const cardBorder = isDarkMode ? "border-white/10" : "border-slate-200";
  const pillStyles = isDarkMode
    ? "bg-white/10 text-white"
    : "bg-slate-900/5 text-slate-900";

  return (
    <main
      className={`${themeClasses} min-h-screen px-4 py-16 transition-colors duration-300`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <DashboardSidebar borderClassName={cardBorder} />

        <div className="flex-1 space-y-8">
          <div className="flex flex-col gap-4 rounded-3xl border p-6 shadow-lg md:flex-row md:items-center md:justify-between">
            <p className="text-sm opacity-70">
              Signed in as <span className="font-semibold">{user.email}</span>
            </p>
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm transition ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-slate-900/90 text-white hover:bg-slate-900"
              }`}
            >
              {isDarkMode ? "Switch to Light" : "Switch to Dark"}
            </button>
          </div>

          <section
            className={`grid gap-10 rounded-3xl border ${cardBorder} p-10 shadow-lg`}
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <p className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight">
                  Hello, {greetingName}!
                </p>
                <p className="text-base opacity-80">
                  Welcome back to Roots. You are logged in as a{" "}
                  <span className="font-semibold">{user.role}</span>. Every new
                  account starts as a client. Admin privileges can only be
                  granted directly through the database for security reasons.
                </p>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className={`rounded-2xl border ${cardBorder} p-4`}>
                    <dt className="text-xs uppercase tracking-wide opacity-60">
                      Member Since
                    </dt>
                    <dd className="mt-2 text-lg font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className={`rounded-2xl border ${cardBorder} p-4`}>
                    <dt className="text-xs uppercase tracking-wide opacity-60">
                      Role
                    </dt>
                    <dd
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm ${pillStyles}`}
                    >
                      {user.role}
                    </dd>
                  </div>
                  <div className={`rounded-2xl border ${cardBorder} p-4`}>
                    <dt className="text-xs uppercase tracking-wide opacity-60">
                      Experience Points
                    </dt>
                    <dd className="mt-2 text-3xl font-semibold">
                      {points}
                    </dd>
                    <p className="text-xs opacity-60">
                      Earned by logging attractions and recipes.
                    </p>
                  </div>
                </dl>
              </div>

              <div
                className={`h-72 overflow-hidden rounded-3xl border ${cardBorder}`}
              >
                <iframe
                  title="Roots Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-73.99%2C40.70%2C-73.90%2C40.80&layer=mapnik"
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <article
                className={`rounded-2xl border ${cardBorder} p-6 ${
                  isDarkMode ? "bg-white/5" : "bg-slate-50"
                }`}
              >
                <h2 className="text-lg font-semibold">Client Tools</h2>
                <p className="mt-2 text-sm opacity-80">
                  Access the core Roots experience, manage your data, and
                  explore the map. This is the default role for everyone.
                </p>
              </article>

              <article
                className={`rounded-2xl border p-6 ${
                  user.role === "admin"
                    ? isDarkMode
                      ? "border-amber-300/50 bg-amber-300/20"
                      : "border-amber-500/40 bg-amber-50"
                    : `${cardBorder} ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`
                }`}
              >
                <h2 className="text-lg font-semibold">
                  Admin {user.role === "admin" ? "Mode" : "Locked"}
                </h2>
                {user.role === "admin" ? (
                  <p className="mt-2 text-sm opacity-80">
                    You have elevated controls. Use them responsibly to keep the
                    platform healthy.
                  </p>
                ) : (
                  <p className="mt-2 text-sm opacity-80">
                    Admin access is restricted. Update the user document
                    manually in MongoDB if you need this role.
                  </p>
                )}
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
