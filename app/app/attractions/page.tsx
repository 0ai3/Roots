"use client";
import { useState, useEffect, useCallback } from "react";
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
  Heart,
  Loader2,
  MapPinned,
} from "lucide-react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import AttractionPlanner from "../../components/AttractionPlanner";
import Image from "next/image";
import { useExperiencePoints } from "../../hooks/useExperiencePoints";

type Attraction = {
  id: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  visitors: string;
  image: string;
  description: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  distance?: number;
};

type Favorite = {
  attractionId: string;
};

function HeroSection({ onPlanClick }: { onPlanClick: () => void }) {
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
        <div className="absolute inset-0 bg-liniar-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
              Discover{" "}
              <span className="text-lime-400">Global Attractions</span>
            </h1>

            <p className="text-lg mb-8 text-neutral-300">
              Experience the world&apos;s most iconic landmarks, historical
              sites, and cultural treasures. From ancient wonders to modern
              marvels, plan your perfect cultural journey.
            </p>

            <motion.button
              onClick={onPlanClick}
              className="px-8 py-4 rounded-full flex items-center gap-2 bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Compass className="w-5 h-5" />
              Plan Your Visit
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Attractions", value: "5K+", icon: MapPin, color: "blue" },
    { label: "Countries", value: "195", icon: Globe2, color: "purple" },
    { label: "Categories", value: "50+", icon: Building2, color: "orange" },
    { label: "Reviews", value: "1M+", icon: Star, color: "yellow" },
  ];

  return (
    <section className="py-16 px-6 lg:px-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-3xl border p-6 backdrop-blur bg-neutral-900 border-neutral-800"
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
              <p className="text-3xl font-bold mb-1 text-white">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedAttractionsSection({
  onLoadAttractions,
}: {
  onLoadAttractions?: (count: number) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(5000);
  const { userId } = useExperiencePoints();

  const fetchAttractions = useCallback(async (lat: number, lon: number, rad: number) => {
    setLoading(true);
    setLocationError(null);
    try {
      const response = await fetch(
        `/api/attractions/nearby?lat=${lat}&lon=${lon}&radius=${rad}`
      );
      const _data = await response.json();
      if (response.ok) {
        setAttractions(_data.attractions || []);
        onLoadAttractions?.(_data.attractions?.length || 0);
      } else {
        const errorMsg = _data.details
          ? `${_data.error} (${_data.details})`
          : _data.error || "Failed to fetch attractions";
        setLocationError(errorMsg);
        console.error("API error:", _data);
      }
    } catch (error) {
      console.error("Fetch attractions error:", error);
      setLocationError("Failed to load nearby attractions. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, [onLoadAttractions]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(coords);
          fetchAttractions(coords.lat, coords.lon, radius);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            "Unable to get your location. Please enable location services."
          );
          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, [radius, fetchAttractions]);

  useEffect(() => {
    if (userLocation) {
      fetchAttractions(userLocation.lat, userLocation.lon, radius);
    }
  }, [radius, userLocation, fetchAttractions]);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/attractions/favorites");
      if (response.ok) {
        const data = await response.json();
        const ids = new Set<string>(
          data.favorites.map((fav: Favorite) => fav.attractionId)
        );
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Fetch favorites error:", error);
    }
  };

  const toggleFavorite = async (attraction: Attraction) => {
    if (!userId) {
      window.location.href = '/login';
      return;
    }

    const isFavorited = favoriteIds.has(attraction.id);

    try {
      if (isFavorited) {
        const response = await fetch("/api/attractions/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attractionId: attraction.id }),
        });

        if (response.ok) {
          setFavoriteIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(attraction.id);
            return newSet;
          });
        } else {
          if (response.status === 401) {
            window.location.href = '/login';
          }
        }
      } else {
        const response = await fetch("/api/attractions/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attraction }),
        });

        if (response.ok) {
          setFavoriteIds((prev) => new Set(prev).add(attraction.id));
        } else {
          if (response.status === 401) {
            window.location.href = '/login';
          }
        }
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(attractions.map((a) => a.category))),
  ];

  const filteredAttractions = attractions.filter((attraction) => {
    const matchesCategory =
      selectedCategory === "All" || attraction.category === selectedCategory;
    const matchesSearch =
      attraction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-24 px-6 lg:px-12 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/20 text-lime-400 border border-lime-400/30">
            Featured Destinations
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Popular Attractions Worldwide
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400">
            Explore the most visited and beloved cultural landmarks across the
            globe
          </p>
        </motion.div>

        <div className="mb-12 space-y-6">
          {userLocation && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
              <MapPinned className="w-4 h-4" />
              <span>
                Showing attractions near your location ({radius / 1000}km radius)
                {userId && <span className="ml-2 text-xs">• Logged in ✓</span>}
              </span>
            </div>
          )}

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search nearby attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-lime-400/50 focus:outline-none transition-all"
            />
          </div>

          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Search Radius: {radius / 1000}km
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #84cc16 0%, #84cc16 ${((radius - 1000) / 49000) * 100}%, #404040 ${((radius - 1000) / 49000) * 100}%, #404040 100%)`
              }}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-neutral-500">1km</span>
              <span className="text-neutral-500">50km</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-lime-400 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-lime-400" />
            <p className="text-neutral-400">Loading nearby attractions...</p>
          </div>
        )}

        {locationError && !loading && (
          <div className="text-center py-20 px-6 rounded-3xl border bg-red-950/20 border-red-900/30 text-red-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">Unable to Load Attractions</p>
            <p className="text-sm mb-4">{locationError}</p>
            {userLocation && (
              <button
                onClick={() => fetchAttractions(userLocation.lat, userLocation.lon, radius)}
                className="px-6 py-2 rounded-full text-sm font-semibold transition bg-lime-400 text-neutral-950 hover:bg-lime-300"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {!loading && !locationError && filteredAttractions.length === 0 && (
          <div className="text-center py-20 px-6 text-neutral-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No attractions found</p>
            <p className="text-sm">
              Try adjusting your search radius or search terms
            </p>
          </div>
        )}

        {!loading && !locationError && filteredAttractions.length > 0 && (
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
                <div className="relative overflow-hidden rounded-3xl border transition-all bg-neutral-900 border-neutral-800 hover:border-lime-400/30">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={attraction.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-liniar-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => toggleFavorite(attraction)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                          favoriteIds.has(attraction.id)
                            ? "bg-red-500/80 hover:bg-red-600/80"
                            : "bg-neutral-900/80 hover:bg-lime-400/20"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favoriteIds.has(attraction.id)
                              ? "text-white fill-white"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-lime-400/20 border border-lime-400/30 text-lime-300">
                      {attraction.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 text-white">
                          {attraction.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-lime-400" />
                          <span className="text-neutral-400">
                            {attraction.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm mb-4 text-neutral-400">
                      {attraction.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-white">
                            {typeof attraction.rating === 'number' 
                              ? attraction.rating.toFixed(1) 
                              : attraction.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-neutral-400">
                            {attraction.visitors}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-sm font-semibold text-lime-400 hover:text-lime-300"
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
        )}
      </div>
    </section>
  );
}

export default function AttractionsPage() {
  const [showPlanner, setShowPlanner] = useState(false);

  const scrollToPlanningSection = () => {
    const planningSection = document.getElementById('planning-cta-section');
    if (planningSection) {
      planningSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <DashboardPageLayout>
      {!showPlanner ? (
        <>
          <HeroSection onPlanClick={scrollToPlanningSection} />
          <StatsSection />
          <FeaturedAttractionsSection />

          <section
            id="planning-cta-section"
            className="py-24 px-6 lg:px-12 bg-neutral-950"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border p-12 bg-liniar-to-br from-neutral-900 to-neutral-800 border-neutral-700"
              >
                <Compass className="w-16 h-16 mx-auto mb-6 text-lime-400" />
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Ready to Plan Your Adventure?
                </h2>
                <p className="text-lg mb-8 text-neutral-300">
                  Use our AI-powered planner to create a personalized itinerary
                  based on your preferences, budget, and interests
                </p>
                <motion.button
                  onClick={() => setShowPlanner(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full flex items-center gap-2 mx-auto transition-colors bg-lime-400 text-neutral-950 hover:bg-lime-300"
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
            className="flex items-center gap-2 text-sm font-medium text-lime-400 hover:text-lime-300"
          >
            ← Back to Attractions
          </button>
          <AttractionPlanner initialPoints={0} initialUserId={null} />
        </div>
      )}
    </DashboardPageLayout>
  );
}
