"use client";

import { useState } from "react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import WorldExplorerMap from "../../components/WorldExplorerMap";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Navigation, Route } from "lucide-react";
import Image from "next/image";

export default function MapPage() {
  const [showBrowse, setShowBrowse] = useState(true);

  const getBgColor = () => {
    return "bg-black";
  };

  const getTextColor = () => {
    return "text-white";
  };

  return (
    <DashboardPageLayout
      contentClassName={
        showBrowse ? "border-none bg-transparent p-0 shadow-none" : undefined
      }
      isDarkMode={true}
    >
      {showBrowse ? (
        <div className="min-h-screen bg-black">
          {/* Hero Section */}
          <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                alt="World map"
                fill
                className="object-cover"
                priority
              />
              <div
                className={`absolute inset-0 bg-linear-to-br from-black/80 via-black/70 to-black/80`}
              />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <MapPin className="w-4 h-4 text-lime-400" />
                <span className="text-sm font-medium">Live Explorer</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              >
                Interactive{" "}
                <span className="text-lime-400">Map</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
              >
                Track your position, navigate to attractions, and explore the
                world in real-time
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBrowse(false)}
                  className="px-8 py-4 rounded-xl font-semibold flex items-center gap-2 bg-lime-400 text-black hover:bg-lime-300"
                >
                  <Navigation className="w-5 h-5" />
                  Open Map
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Navigation,
                    title: "Live Tracking",
                    description:
                      "Continuous geolocation with follow-mode toggle",
                  },
                  {
                    icon: MapPin,
                    title: "Pin Locations",
                    description: "Drop pins anywhere and save them with labels",
                  },
                  {
                    icon: Route,
                    title: "Smart Routing",
                    description: "Walking, cycling, and driving directions",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-6 border backdrop-blur-sm bg-neutral-900/50 border-white/10`}
                  >
                    <div
                      className={`p-3 rounded-xl w-fit mb-4 bg-lime-400/20`}
                    >
                      <feature.icon
                        className={`w-6 h-6 text-lime-400`}
                      />
                    </div>
                    <h3
                      className={`font-bold text-lg mb-2 text-white`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm text-neutral-400`}
                    >
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
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
                true
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              }`}
            >
              ← Back to Overview
            </button>
          </div>
          <div className="space-y-6 px-6">
            <div
              className={`rounded-3xl border p-6 ${
                true
                  ? "border-white/10 bg-white/5"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wide ${
                  true ? "text-white/40" : "text-neutral-500"
                }`}
              >
                Live explorer
              </p>
              <h1 className={`text-2xl font-semibold ${getTextColor()}`}>
                Track, follow, and route in real-time
              </h1>
              <p
                className={`mt-3 text-sm ${
                  true ? "text-white/70" : "text-neutral-600"
                }`}
              >
                Share your current position, follow yourself on the map, and
                request turn-by-turn routes to any saved attraction in your
                Roots profile. Tap anywhere to drop a pin, save it with a label,
                then route back to it whenever you like.
              </p>
              <ul className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <li
                  className={`rounded-2xl border p-3 ${
                    true
                      ? "border-white/10 bg-slate-950/40 text-white/80"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  ✅ Continuous geolocation tracking with follow-mode toggle
                </li>
                <li
                  className={`rounded-2xl border p-3 ${
                    true
                      ? "border-white/10 bg-slate-950/40 text-white/80"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  📍 Attraction Planner picks are saved automatically, and you
                  can drop extra pins anytime
                </li>
                <li
                  className={`rounded-2xl border p-3 ${
                    true
                      ? "border-white/10 bg-slate-950/40 text-white/80"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  🚶‍♀️🚴‍♂️🚗 Walking, cycling, and driving profiles powered by
                  Mapbox Directions
                </li>
              </ul>
            </div>

            <WorldExplorerMap height="70vh" />
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
