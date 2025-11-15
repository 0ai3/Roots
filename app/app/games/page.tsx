"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Gamepad2,
  Trophy,
  Zap,
  Users,
  Star,
  Target,
  ArrowRight,
  Sparkles,
  Brain,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";
import LearnAndEarnGame from "../../components/LearnAndEarnGame";
import { useTheme } from "../../components/ThemeProvider";

export default function GamesPage() {
  const { theme } = useTheme();
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <DashboardPageLayout>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowGame(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              theme === "dark"
                ? "bg-neutral-800 text-white hover:bg-neutral-700"
                : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            ← Back to Games
          </button>
          <PageThemeToggle />
        </div>
        <LearnAndEarnGame initialPoints={0} initialUserId={null} />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="relative min-h-screen">
        {/* Page Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <PageThemeToggle />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80"
              alt="Cultural games and learning"
              fill
              className="object-cover"
              priority
            />
            <div
              className={`absolute inset-0 ${
                theme === "dark"
                  ? "bg-linear-to-br from-black/80 via-black/60 to-transparent"
                  : "bg-linear-to-br from-white/70 via-orange-50/80 to-transparent"
              }`}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                theme === "dark"
                  ? "bg-lime-400/10 border-lime-400/20"
                  : "bg-emerald-100/80 border-emerald-300/50"
              }`}
            >
              <Sparkles
                className={`w-4 h-4 ${
                  theme === "dark" ? "text-lime-400" : "text-emerald-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-lime-400" : "text-emerald-700"
                }`}
              >
                Learn Through Play
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Cultural{" "}
              <span
                className={
                  theme === "dark" ? "text-lime-400" : "text-emerald-600"
                }
              >
                Games
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-xl mb-8 max-w-2xl mx-auto ${
                theme === "dark" ? "text-white/90" : "text-neutral-700"
              }`}
            >
              Master world cultures through interactive challenges, earn points,
              and compete with explorers worldwide
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
                onClick={() => setShowGame(true)}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "bg-lime-400 text-black hover:bg-lime-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                Start Playing
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 backdrop-blur-sm border transition-colors ${
                  theme === "dark"
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    : "bg-white/50 text-neutral-900 border-neutral-300 hover:bg-white"
                }`}
              >
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-20 -mt-20 mb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 shadow-xl border ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-lime-400/20"
                        : "bg-lime-100"
                    }`}
                  >
                    <Gamepad2
                      className={`w-6 h-6 ${
                        theme === "dark" ? "text-lime-400" : "text-lime-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-600"
                      }`}
                    >
                      Active Games
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      50+
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Interactive challenges available
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 shadow-xl border ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-blue-400/20"
                        : "bg-blue-100"
                    }`}
                  >
                    <Users
                      className={`w-6 h-6 ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-600"
                      }`}
                    >
                      Players
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      25K+
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Global community members
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 shadow-xl border ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-purple-400/20"
                        : "bg-purple-100"
                    }`}
                  >
                    <Globe
                      className={`w-6 h-6 ${
                        theme === "dark" ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-600"
                      }`}
                    >
                      Countries
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      195
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Cultures to discover
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 shadow-xl border ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-orange-400/20"
                        : "bg-orange-100"
                    }`}
                  >
                    <Award
                      className={`w-6 h-6 ${
                        theme === "dark" ? "text-orange-400" : "text-orange-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-600"
                      }`}
                    >
                      Total Rewards
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      1M+
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Points earned by players
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section
          className={`py-20 ${
            theme === "dark" ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className={`text-4xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Featured{" "}
                <span
                  className={
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }
                >
                  Challenges
                </span>
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Test your knowledge and earn points with our exciting cultural
                games
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Cultural Quiz",
                  description: "Answer questions about world cultures and traditions",
                  difficulty: "Medium",
                  points: "50-200",
                  color: "lime",
                },
                {
                  icon: Globe,
                  title: "Geography Master",
                  description: "Identify countries, capitals, and landmarks",
                  difficulty: "Easy",
                  points: "30-150",
                  color: "blue",
                },
                {
                  icon: Target,
                  title: "Tradition Matcher",
                  description: "Match cultural practices to their origins",
                  difficulty: "Hard",
                  points: "100-300",
                  color: "purple",
                },
                {
                  icon: Star,
                  title: "Language Challenge",
                  description: "Learn basic phrases from different languages",
                  difficulty: "Medium",
                  points: "75-250",
                  color: "emerald",
                },
                {
                  icon: Trophy,
                  title: "History Timeline",
                  description: "Arrange historical events in correct order",
                  difficulty: "Hard",
                  points: "150-400",
                  color: "orange",
                },
                {
                  icon: Zap,
                  title: "Speed Round",
                  description: "Quick-fire questions with time pressure",
                  difficulty: "Easy",
                  points: "20-100",
                  color: "pink",
                },
              ].map((game, index) => (
                <motion.div
                  key={game.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`rounded-2xl p-6 shadow-lg border cursor-pointer group ${
                    theme === "dark"
                      ? "bg-neutral-900 border-neutral-800 hover:border-lime-400/50"
                      : "bg-white border-neutral-200 hover:border-emerald-400/50"
                  }`}
                  onClick={() => setShowGame(true)}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      theme === "dark"
                        ? `bg-${game.color}-400/20`
                        : `bg-${game.color}-100`
                    }`}
                  >
                    <game.icon
                      className={`w-7 h-7 ${
                        theme === "dark"
                          ? `text-${game.color}-400`
                          : `text-${game.color}-600`
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {game.title}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        game.difficulty === "Easy"
                          ? theme === "dark"
                            ? "bg-green-400/20 text-green-400"
                            : "bg-green-100 text-green-700"
                          : game.difficulty === "Medium"
                          ? theme === "dark"
                            ? "bg-yellow-400/20 text-yellow-400"
                            : "bg-yellow-100 text-yellow-700"
                          : theme === "dark"
                          ? "bg-red-400/20 text-red-400"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {game.difficulty}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-lime-400" : "text-emerald-600"
                      }`}
                    >
                      {game.points} pts
                    </span>
                  </div>
                  <div
                    className={`mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      theme === "dark" ? "text-lime-400" : "text-emerald-600"
                    }`}
                  >
                    <span className="text-sm font-semibold">Play Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className={`text-4xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Why Play{" "}
                <span
                  className={
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }
                >
                  Cultural Games
                </span>
                ?
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Learning about world cultures has never been this fun and
                rewarding
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Learn Faster",
                  description: "Gamified learning improves retention by 80%",
                },
                {
                  icon: Trophy,
                  title: "Earn Rewards",
                  description: "Gain points and unlock achievements",
                },
                {
                  icon: Users,
                  title: "Compete Globally",
                  description: "Challenge players from around the world",
                },
                {
                  icon: TrendingUp,
                  title: "Track Progress",
                  description: "Monitor your cultural knowledge growth",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl p-6 shadow-lg border text-center ${
                    theme === "dark"
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <benefit.icon
                    className={`w-12 h-12 mx-auto mb-4 ${
                      theme === "dark" ? "text-lime-400" : "text-emerald-600"
                    }`}
                  />
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={`py-20 ${
            theme === "dark"
              ? "bg-linear-to-br from-lime-600 to-emerald-600"
              : "bg-linear-to-br from-lime-500 to-emerald-500"
          } text-white`}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start playing today and become a cultural expert while earning
                rewards
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGame(true)}
                className={`px-10 py-5 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition-colors ${
                  theme === "dark"
                    ? "bg-white text-lime-600 hover:bg-neutral-100"
                    : "bg-white text-emerald-600 hover:bg-neutral-100"
                }`}
              >
                <Gamepad2 className="w-6 h-6" />
                Play Now
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </DashboardPageLayout>
  );
}
