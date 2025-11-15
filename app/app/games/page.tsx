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
import LearnAndEarnGame from "../../components/LearnAndEarnGame";

export default function GamesPage() {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <DashboardPageLayout>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowGame(false)}
            className="px-6 py-3 rounded-xl font-semibold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            ← Back to Games
          </button>
        </div>
        <LearnAndEarnGame initialPoints={0} initialUserId={null} />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="relative min-h-screen">
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
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-lime-400/10 border-lime-400/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span className="text-sm font-medium text-lime-400">
                Learn Through Play
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white"
            >
              Cultural{" "}
              <span className="text-lime-400">Games</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
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
                className="px-8 py-4 rounded-xl font-semibold flex items-center gap-2 bg-lime-400 text-black hover:bg-lime-300 transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                Start Playing
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-semibold flex items-center gap-2 backdrop-blur-sm border bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
              >
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 lg:px-12 bg-neutral-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Active Games", value: "50+", icon: Gamepad2, color: "lime" },
                { label: "Players", value: "25K+", icon: Users, color: "blue" },
                { label: "Countries", value: "195", icon: Globe, color: "purple" },
                { label: "Total Rewards", value: "1M+", icon: Award, color: "orange" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-3xl border bg-neutral-900 border-neutral-800 p-6 backdrop-blur"
                >
                  <stat.icon className={`w-8 h-8 mb-3 text-${stat.color}-400`} />
                  <p className="text-3xl font-bold mb-1 text-white">{stat.value}</p>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="py-20 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-white">
                Featured{" "}
                <span className="text-lime-400">Challenges</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-neutral-400">
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
                  className="rounded-2xl p-6 shadow-lg border bg-neutral-900 border-neutral-800 hover:border-lime-400/50 cursor-pointer group"
                  onClick={() => setShowGame(true)}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-${game.color}-400/20`}>
                    <game.icon className={`w-7 h-7 text-${game.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {game.title}
                  </h3>
                  <p className="text-sm mb-4 text-neutral-400">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      game.difficulty === "Easy"
                        ? "bg-green-400/20 text-green-400"
                        : game.difficulty === "Medium"
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-red-400/20 text-red-400"
                    }`}>
                      {game.difficulty}
                    </span>
                    <span className="text-sm font-semibold text-lime-400">
                      {game.points} pts
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-lime-400">
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
              <h2 className="text-4xl font-bold mb-4 text-white">
                Why Play{" "}
                <span className="text-lime-400">Cultural Games</span>?
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-neutral-400">
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
                  className="rounded-2xl p-6 shadow-lg border bg-neutral-900 border-neutral-800 text-center"
                >
                  <benefit.icon className="w-12 h-12 mx-auto mb-4 text-lime-400" />
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-br from-lime-600 to-emerald-600 text-white">
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
                className="px-10 py-5 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto bg-white text-lime-600 hover:bg-neutral-100 transition-colors"
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
