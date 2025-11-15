"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Compass,
  MapPin,
  Award,
  TrendingUp,
  Globe,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Heart,
  MessageCircle,
  Calendar,
  Target,
} from "lucide-react";
import DashboardPageLayout from "@/app/components/DashboardPageLayout";
import PageThemeToggle from "@/app/components/PageThemeToggle";
import { useTheme } from "@/app/components/ThemeProvider";

type DashboardUser = {
  email: string;
  role: "client" | "admin";
  points: number;
  createdAt: string;
  name?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const userData = await res.json();
        setUser(userData);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400 dark:border-lime-400"></div>
      </div>
    );
  }

  if (!user) return null;

  const greetingName = user.name?.trim() || "Explorer";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
              alt="Cultural diversity"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/70 via-black/50 to-transparent dark:from-black/80 dark:via-black/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 dark:bg-lime-400/20 border border-lime-400/20 dark:border-lime-400/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span className="text-sm font-medium text-lime-400">
                Your Cultural Journey Hub
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Welcome Back,{" "}
              <span className="text-lime-400 dark:text-lime-400">
                {greetingName}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Continue your exploration of world cultures, traditions, and
              connections. Your next adventure awaits.
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
                onClick={() => router.push("/app/map")}
                className="px-8 py-4 bg-lime-400 dark:bg-lime-400 text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-lime-300 dark:hover:bg-lime-300 transition-colors"
              >
                <Compass className="w-5 h-5" />
                Explore Map
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/app/attractions")}
                className="px-8 py-4 bg-white/10 dark:bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/20 dark:hover:bg-white/20 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                View Attractions
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
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-lime-100 dark:bg-lime-400/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Your Points
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {user.points.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Keep exploring to earn more
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-400/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {memberSince}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {user.role === "admin" ? "Admin Account" : "Explorer Account"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-400/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Countries Explored
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      24
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  171 more to discover
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-400/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      +250
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Points earned recently
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Quick <span className="text-lime-600 dark:text-lime-400">Actions</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Jump into your favorite activities and continue your cultural journey
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MapPin,
                  title: "Discover Attractions",
                  description: "Explore landmarks and cultural sites worldwide",
                  color: "lime",
                  href: "/app/attractions",
                },
                {
                  icon: MessageCircle,
                  title: "Cultural Chat",
                  description: "Connect with AI to learn about traditions",
                  color: "blue",
                  href: "/app/chat",
                },
                {
                  icon: Target,
                  title: "Plan Your Journey",
                  description: "Create personalized cultural itineraries",
                  color: "purple",
                  href: "/app/map",
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Join discussions with fellow explorers",
                  color: "emerald",
                  href: "/app/news",
                },
                {
                  icon: Star,
                  title: "Featured Recipes",
                  description: "Discover authentic dishes from around the world",
                  color: "orange",
                  href: "/app/recipes",
                },
                {
                  icon: Heart,
                  title: "Your Favorites",
                  description: "Access saved destinations and experiences",
                  color: "pink",
                  href: "/app/dashboard",
                },
              ].map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => router.push(action.href)}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:border-lime-400/50 dark:hover:border-lime-400/50 transition-all text-left group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon
                      className={`w-7 h-7 text-${action.color}-600 dark:text-${action.color}-400`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {action.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-lime-600 dark:text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Achievement Highlights */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Recent <span className="text-emerald-600 dark:text-emerald-400">Achievements</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Celebrate your milestones and cultural discoveries
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🏆",
                  title: "First Explorer",
                  description: "Completed your first cultural journey",
                  date: "2 days ago",
                },
                {
                  icon: "🌍",
                  title: "Globe Trotter",
                  description: "Visited 10 different countries",
                  date: "1 week ago",
                },
                {
                  icon: "⭐",
                  title: "Rising Star",
                  description: "Earned 1000 points",
                  date: "2 weeks ago",
                },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="text-5xl mb-4">{achievement.icon}</div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    {achievement.date}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-br from-lime-600 to-emerald-600 dark:from-lime-500 dark:to-emerald-500 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready for Your Next Adventure?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Discover new cultures, connect with traditions, and expand your
                global perspective today.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/app/map")}
                className="px-10 py-5 bg-white text-lime-600 dark:text-lime-600 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto hover:bg-neutral-100 transition-colors"
              >
                Start Exploring
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </DashboardPageLayout>
  );
}
