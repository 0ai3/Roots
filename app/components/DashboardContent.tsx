"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Compass,
  Utensils,
  Building2,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import { useI18n } from "../../app/hooks/useI18n";

type Role = "client" | "admin";

type DashboardUser = {
  email: string;
  role: Role;
  points: number;
  createdAt: string;
  name?: string | null;
};

type Props = {
  user: DashboardUser;
};

export default function DashboardContent({ user }: Props) {
  const { t, locale } = useI18n();

  const greetingName = useMemo(() => {
    const trimmed = user.name?.trim();
    return trimmed && trimmed.length > 0
      ? trimmed
      : t("dashboard.content.userFallback");
  }, [user.name, t]);

  const memberSince = useMemo(() => {
    const date = new Date(user.createdAt);
    if (Number.isNaN(date.getTime())) {
      return user.createdAt;
    }
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [locale, user.createdAt]);

  const formattedPoints = useMemo(
    () => user.points.toLocaleString(locale),
    [locale, user.points]
  );

  const roleLabel = useMemo(
    () =>
      user.role === "admin"
        ? t("dashboard.roles.admin")
        : t("dashboard.roles.client"),
    [t, user.role]
  );

  return (
    <main className="bg-gradient-to-br from-neutral-950 to-neutral-900 text-white min-h-screen px-6 py-8 transition-all duration-500">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <DashboardSidebar />

        <div className="flex-1 space-y-8">
          {/* Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <p className="text-sm opacity-80">
                {t("dashboard.content.signedInAs", { email: user.email })}
              </p>
            </div>
          </motion.div>

          {/* Main Content Section */}
          <section className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 shadow-xl"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-lime-400/10 border-lime-400/20"
                    >
                      <div className="w-2 h-2 rounded-full bg-lime-400" />
                      <span className="text-sm text-lime-400">
                        {t("dashboard.content.culturalJourney")}
                      </span>
                    </motion.div>

                    <h1 className="text-4xl font-bold leading-tight">
                      {t("dashboard.content.welcome")}{" "}
                      <span className="text-lime-400">
                        {greetingName}
                      </span>
                    </h1>

                    <p className="text-lg opacity-80 leading-relaxed">
                      {t("dashboard.content.welcomeBody")}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="rounded-xl border border-neutral-800 p-5 backdrop-blur-sm bg-neutral-800/30"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                        {t("dashboard.content.memberSince")}
                      </dt>
                      <dd className="text-lg font-semibold">
                        {memberSince}
                      </dd>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="rounded-xl border border-neutral-800 p-5 backdrop-blur-sm bg-neutral-800/30"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                        {t("dashboard.content.roleLabel")}
                      </dt>
                      <dd
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                          user.role === "admin"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-lime-400/20 text-lime-300 border border-lime-400/30"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.role === "admin"
                              ? "bg-amber-600"
                              : "bg-lime-400"
                          }`}
                        />
                        {roleLabel}
                      </dd>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="rounded-xl border border-neutral-800 p-5 backdrop-blur-sm bg-neutral-800/30"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                        {t("dashboard.content.pointsLabel")}
                      </dt>
                      <dd className="text-2xl font-bold mb-1">
                        {formattedPoints}
                      </dd>
                      <p className="text-xs opacity-60">
                        {t("dashboard.content.pointsSubtitle")}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Map Container */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Compass className="w-5 h-5" />
                      {t("dashboard.content.mapHeading")}
                    </h3>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="h-80 w-full overflow-hidden rounded-xl border border-neutral-800 flex-1 relative"
                  >
                    <div
                      className={`absolute inset-0 bg-linear-to-t ${
                        "from-neutral-900/20 to-transparent"
                      } pointer-events-none z-10`}
                    />
                    <iframe
                      title={t("dashboard.content.mapHeading")}
                      src="https://www.openstreetmap.org/export/embed.html?bbox=-73.99%2C40.70%2C-73.90%2C40.80&layer=mapnik"
                      className="h-full w-full relative z-0"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Client Tools Card */}
              <motion.article
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-neutral-800 p-7 backdrop-blur-sm shadow-lg bg-neutral-900/30"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-lime-400/20 border border-lime-400/30"
                  >
                    <Compass
                      className="w-6 h-6 text-lime-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("dashboard.content.explorerTitle")}
                    </h2>
                  </div>
                </div>
                <p className="opacity-80 leading-relaxed mb-6">
                  {t("dashboard.content.explorerBody")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[Utensils, Building2, Palette, MapPin].map((Icon, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-800/50 border border-neutral-700"
                    >
                      <Icon
                        className="w-5 h-5 text-lime-400"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.article>

              {/* Admin Card */}
              <motion.article
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl border p-7 backdrop-blur-sm shadow-lg ${
                  user.role === "admin"
                    ? "border-amber-400/30 bg-amber-400/10"
                    : "bg-neutral-900/30"
                }`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      user.role === "admin"
                        ? "bg-amber-400/20 border border-amber-400/30"
                        : "bg-neutral-800/50 border border-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 ${
                        user.role === "admin"
                          ? "text-amber-400"
                          : "text-neutral-400"
                      }`}
                    >
                      {user.role === "admin" ? "⚡" : ""}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("dashboard.content.adminTitle")}
                    </h2>
                  </div>
                </div>

                {user.role === "admin" ? (
                  <div>
                    <p className="opacity-80 leading-relaxed mb-6">
                      {t("dashboard.content.adminBody")}
                    </p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        "bg-amber-400/20 text-amber-300"
                      }`}>
                        {t("dashboard.content.adminBadgeCommunity")}
                      </span>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        "bg-amber-400/20 text-amber-300"
                      }`}>
                        {t("dashboard.content.adminBadgeContent")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="opacity-80 leading-relaxed mb-6">
                      {t("dashboard.content.adminLimitedBody")}
                    </p>
                    <div className={`text-sm px-4 py-3 rounded-xl backdrop-blur-sm border ${
                      "bg-white/50 border-neutral-300 text-neutral-600"
                    }`}>
                      {t("dashboard.content.adminLimitedNote")}
                    </div>
                  </div>
                )}
              </motion.article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
