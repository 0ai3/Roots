"use client";
import Footer from "@/app/components/Footer";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Compass,
  Star,
  TrendingUp,
  Globe2,
  ArrowRight,
  Search,
  Filter,
  Heart,
  Share2,
} from "lucide-react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import AttractionPlanner from "../../components/AttractionPlanner";
import Image from "next/image";
import { useTheme } from "../../components/ThemeProvider";

// Sample featured attractions data
const featuredAttractions = [
  {
    id: 1,
    title: "Eiffel Tower",
    location: "Paris, France",
    category: "Landmark",
    rating: 4.8,
    visitors: "7M+",
    image:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop",
    description: "Iconic iron lattice tower on the Champ de Mars",
  },
  {
    id: 2,
    title: "Colosseum",
    location: "Rome, Italy",
    category: "Historical",
    rating: 4.9,
    visitors: "6M+",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
    description: "Ancient amphitheatre in the centre of Rome",
  },
  {
    id: 3,
    title: "Machu Picchu",
    location: "Cusco, Peru",
    category: "Archaeological",
    rating: 4.9,
    visitors: "1.5M+",
    image:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&auto=format&fit=crop",
    description: "15th-century Inca citadel in the Andes",
  },
  {
    id: 4,
    title: "Taj Mahal",
    location: "Agra, India",
    category: "Monument",
    rating: 4.7,
    visitors: "8M+",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
    description: "Ivory-white marble mausoleum on the Yamuna river",
  },
  {
    id: 5,
    title: "Great Wall",
    location: "Beijing, China",
    category: "Historical",
    rating: 4.6,
    visitors: "10M+",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop",
    description: "Ancient fortification across northern China",
  },
  {
    id: 6,
    title: "Sagrada Familia",
    location: "Barcelona, Spain",
    category: "Architecture",
    rating: 4.8,
    visitors: "4.5M+",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop",
    description: "Gaudí's unfinished masterpiece basilica",
  },
];

const categories = [
  "All",
  "Landmark",
  "Historical",
  "Monument",
  "Archaeological",
  "Architecture",
];

function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&auto=format&fit=crop"
          alt="World attractions"
          fill
          className="object-cover"
          priority
        />
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-linear-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950"
              : "bg-linear-to-b from-white/60 via-orange-50/80 to-white"
          }`}
        />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            

            <h1
              className={`text-5xl lg:text-6xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Discover{" "}
              <span
                className={
                  theme === "dark" ? "text-lime-400" : "text-emerald-600"
                }
              >
                Global Attractions
              </span>
            </h1>

            <p
              className={`text-lg mb-8 ${
                theme === "dark" ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Experience the world&apos;s most iconic landmarks, historical
              sites, and cultural treasures. From ancient wonders to modern
              marvels, plan your perfect cultural journey.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                className={`px-8 py-4 rounded-full flex items-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Compass className="w-5 h-5" />
                Plan Your Visit
              </motion.button>

              <motion.button
                className={`px-8 py-4 rounded-full backdrop-blur-sm border transition-colors flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-neutral-800/50 text-white border-neutral-700 hover:bg-neutral-700/50"
                    : "bg-white/70 text-neutral-900 border-neutral-300 hover:bg-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe2 className="w-5 h-5" />
                Explore Map
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { theme } = useTheme();

  const stats = [
    { label: "Attractions", value: "5K+", icon: MapPin, color: "blue" },
    { label: "Countries", value: "195", icon: Globe2, color: "purple" },
    { label: "Categories", value: "50+", icon: Building2, color: "orange" },
    { label: "Reviews", value: "1M+", icon: Star, color: "yellow" },
  ];

  return (
    <section
      className={`py-16 px-6 lg:px-12 ${
        theme === "dark" ? "bg-neutral-950" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur ${
                theme === "dark"
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <stat.icon
                className={`w-8 h-8 mb-3 ${
                  stat.color === "blue"
                    ? "text-blue-400"
                    : stat.color === "purple"
                    ? "text-purple-400"
                    : stat.color === "orange"
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}
              />
              <p
                className={`text-3xl font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                {stat.value}
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedAttractionsSection() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttractions = featuredAttractions.filter((attraction) => {
    const matchesCategory =
      selectedCategory === "All" || attraction.category === selectedCategory;
    const matchesSearch =
      attraction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      className={`py-24 px-6 lg:px-12 ${
        theme === "dark"
          ? "bg-neutral-900"
          : "bg-linear-to-b from-white to-orange-50/30"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className={`inline-block px-4 py-2 rounded-full mb-4 ${
              theme === "dark"
                ? "bg-lime-400/10 text-lime-400"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Featured Destinations
          </div>
          <h2
            className={`text-4xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            Popular Attractions Worldwide
          </h2>
          <p
            className={`max-w-2xl mx-auto ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Explore the most visited and beloved cultural landmarks across the
            globe
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-neutral-400" : "text-neutral-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search attractions, cities, or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all ${
                theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400"
              } focus:border-${
                theme === "dark" ? "lime-400" : "emerald-400"
              } focus:outline-none`}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? theme === "dark"
                      ? "bg-lime-400 text-neutral-950"
                      : "bg-emerald-600 text-white"
                    : theme === "dark"
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAttractions.map((attraction, index) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div
                className={`relative overflow-hidden rounded-3xl border transition-all ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800 hover:border-lime-400/30"
                    : "bg-white border-neutral-200 hover:border-emerald-400/50 shadow-lg hover:shadow-xl"
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={attraction.image}
                    alt={attraction.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className={`absolute inset-0 ${
                      theme === "dark"
                        ? "bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent"
                        : "bg-linear-to-t from-white via-white/40 to-transparent"
                    }`}
                  />

                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                        theme === "dark"
                          ? "bg-neutral-900/80 hover:bg-lime-400/20"
                          : "bg-white/90 hover:bg-emerald-100"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          theme === "dark" ? "text-white" : "text-neutral-700"
                        }`}
                      />
                    </button>
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                        theme === "dark"
                          ? "bg-neutral-900/80 hover:bg-lime-400/20"
                          : "bg-white/90 hover:bg-emerald-100"
                      }`}
                    >
                      <Share2
                        className={`w-5 h-5 ${
                          theme === "dark" ? "text-white" : "text-neutral-700"
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-lime-400/20 border border-lime-400/30 text-lime-300"
                        : "bg-emerald-100/90 border border-emerald-300/50 text-emerald-700"
                    }`}
                  >
                    {attraction.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-1 ${
                          theme === "dark" ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {attraction.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin
                          className={`w-4 h-4 ${
                            theme === "dark"
                              ? "text-lime-400"
                              : "text-emerald-600"
                          }`}
                        />
                        <span
                          className={
                            theme === "dark"
                              ? "text-neutral-400"
                              : "text-neutral-600"
                          }
                        >
                          {attraction.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p
                    className={`text-sm mb-4 ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {attraction.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span
                          className={`text-sm font-semibold ${
                            theme === "dark" ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          {attraction.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-neutral-400"
                              : "text-neutral-600"
                          }`}
                        >
                          {attraction.visitors}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 text-sm font-semibold ${
                        theme === "dark"
                          ? "text-lime-400 hover:text-lime-300"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      Explore
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AttractionsPage() {
  const { theme } = useTheme();
  const [showPlanner, setShowPlanner] = useState(false);

  return (
    <DashboardPageLayout>
      {/* Theme controlled by global ThemeToggle */}

      {!showPlanner ? (
        <>
          <HeroSection />
          <StatsSection />
          <FeaturedAttractionsSection />

          {/* CTA to Planner */}
          <section
            className={`py-24 px-6 lg:px-12 ${
              theme === "dark" ? "bg-neutral-950" : "bg-white"
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-3xl border p-12 ${
                  theme === "dark"
                    ? "bg-linear-to-br from-neutral-900 to-neutral-800 border-neutral-700"
                    : "bg-linear-to-br from-emerald-50 to-orange-50 border-emerald-200"
                }`}
              >
                <Compass
                  className={`w-16 h-16 mx-auto mb-6 ${
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }`}
                />
                <h2
                  className={`text-3xl font-bold mb-4 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Ready to Plan Your Adventure?
                </h2>
                <p
                  className={`text-lg mb-8 ${
                    theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Use our AI-powered planner to create a personalized itinerary
                  based on your preferences, budget, and interests
                </p>
                <motion.button
                  onClick={() => setShowPlanner(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-full flex items-center gap-2 mx-auto transition-colors ${
                    theme === "dark"
                      ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Start Planning
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setShowPlanner(false)}
            className={`flex items-center gap-2 text-sm font-medium ${
              theme === "dark"
                ? "text-lime-400 hover:text-lime-300"
                : "text-emerald-600 hover:text-emerald-700"
            }`}
          >
            ← Back to Attractions
          </button>
          <AttractionPlanner initialPoints={0} initialUserId={null} />
        </div>
      )} 
       
    </DashboardPageLayout>

  );
}
