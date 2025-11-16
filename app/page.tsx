"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Compass,
  BookOpen,
  Share2,
  Utensils,
  Building2,
  Palette,
  MapPin,
  Play,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "./hooks/useI18n";

interface HeroSectionProps {
  scrollY: number;
}

function HeroSection({ scrollY }: HeroSectionProps) {
  const { t } = useI18n();
  const parallaxY = scrollY * 0.5;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1588437385796-9d13c337040b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3NzJTIwbmF0dXJlJTIwbWFjcm98ZW58MXx8fHwxNzYyODg3MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Nature background"
          className="w-full h-[120vh] object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/60 via-neutral-950/70 to-neutral-950" />
      </motion.div>

      <div className="relative z-10 w-full px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border bg-lime-400/10 border-lime-400/20">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <span className="text-sm text-lime-400">
                  {t("home.hero.badge")}
                </span>
              </motion.div>

              <h1 className="mb-6 text-white">
                {t("home.hero.title")}
                <br />
                <span className="text-lime-400">{t("home.hero.titleHighlight")}</span>
              </h1>

              <p className="text-lg mb-8 max-w-xl text-neutral-300">
                {t("home.hero.description")}
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  className="px-8 py-4 rounded-full flex items-center gap-2 bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("home.hero.cta.explore")}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="px-8 py-4 rounded-full backdrop-blur-sm border bg-neutral-800/50 text-white border-neutral-700 hover:bg-neutral-700/50 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  {t("home.hero.cta.video")}
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { label: "Countries", value: "195+" },
                  { label: "Traditions", value: "10K+" },
                  { label: "Attractions", value: "5K+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-white text-2xl mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 bg-lime-400" />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1761124739933-009df5603fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYyODc1MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Cultural celebration"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-8 -left-8 p-4 rounded-2xl backdrop-blur-lg border shadow-xl bg-neutral-900/90 border-neutral-700"
                >
                  <div className="text-sm mb-1 text-neutral-400">
                    Most Popular
                  </div>
                  <div className="text-white">
                    Japanese Tea Ceremony
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 border-neutral-600">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-lime-400"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Utensils,
      title: "Traditional Cuisine",
      description:
        "Discover authentic recipes and food heritage from around the world",
      image:
        "https://images.unsplash.com/photo-1650678192497-28e426bb627c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBjdWx0dXJlfGVufDF8fHx8MTc2Mjg4Nzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      icon: Building2,
      title: "Museums & Heritage Sites",
      description: "Explore cultural museums and historical landmarks globally",
      image:
        "https://images.unsplash.com/photo-1543633550-8c1c6a5697bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYyODcyNjM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      icon: Palette,
      title: "Art & Exhibitions",
      description:
        "Experience traditional art forms and contemporary cultural exhibitions",
      image:
        "https://images.unsplash.com/photo-1719935115623-4857df23f3c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NjI4MzEwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      icon: MapPin,
      title: "Tourist Attractions",
      description:
        "Find cultural hotspots and must-visit destinations worldwide",
      image:
        "https://images.unsplash.com/photo-1685850749074-9cf8023d7e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMHRyYXZlbCUyMGRlc3RpbmF0aW9uc3xlbnwxfHx8fDE3NjI4ODc4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400">
            What We Offer
          </div>
          <h2 className="mb-4 text-white">
            Your Gateway to Global Culture
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400">
            Immerse yourself in the world&rsquo;s rich cultural tapestry through
            our comprehensive platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl border transition-all bg-neutral-900 border-neutral-800 hover:border-lime-400/30">
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                  <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-lime-400/20 border border-lime-400/30">
                    <feature.icon className="w-6 h-6 text-lime-400" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-sm text-neutral-400">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-lime-400">
                    <span>Explore more</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
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

function ExploreSection() {
  const regions = [
    {
      name: "Asia",
      traditions: "3,200+",
      image:
        "https://images.unsplash.com/photo-1604074867235-6829038ab657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGNyYWZ0cyUyMGhlcml0YWdlfGVufDF8fHx8MTc2Mjg4Nzg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Europe",
      traditions: "2,800+",
      image:
        "https://images.unsplash.com/photo-1561049448-0f5f892260b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMHBhdHRlcm5zfGVufDF8fHx8MTc2Mjg4NzM1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Africa",
      traditions: "2,100+",
      image:
        "https://images.unsplash.com/photo-1664295581055-f0209d9f7f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGRpdmVyc2l0eSUyMHBlb3BsZXxlbnwxfHx8fDE3NjI4ODczNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-12 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400">
            Explore by Region
          </div>
          <h2 className="mb-4 text-white">
            Discover Cultural Treasures
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400">
            Journey through diverse regions and uncover unique traditions,
            flavors, and stories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {regions.map((region, index) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border bg-neutral-800 border-neutral-700 hover:border-lime-400/50 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-800 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-white">
                    {region.name}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {region.traditions} traditions
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl p-8 lg:p-12 bg-neutral-800/50 border border-neutral-700">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Discover",
                icon: Compass,
                copy: "Browse through curated collections of cultural traditions and landmarks",
              },
              {
                title: "Learn",
                icon: BookOpen,
                copy: "Deep dive into stories, recipes, and history behind each tradition",
              },
              {
                title: "Share",
                icon: Share2,
                copy: "Contribute your own cultural knowledge and experiences",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-lime-400">
                  <item.icon className="w-6 h-6 text-neutral-950" />
                </div>
                <div>
                  <h3 className="mb-2 text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {item.copy}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface InteractiveGardenProps {
  mousePosition: { x: number; y: number };
}

interface PlantItem {
  id: number;
  x: number;
  y: number;
  type: "grass" | "flower";
  height: number;
  width: number;
  culture: string;
}

function InteractiveGarden({ mousePosition }: InteractiveGardenProps) {
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const plants = useMemo(() => {
    const items: PlantItem[] = [];
    const numPlants = 80;
    const cultures = [
      "East Asian",
      "Southeast Asian",
      "South Asian",
      "Sub-Saharan African",
      "North African & Middle Eastern",
      "European",
      "Indigenous Peoples",
      "Latin American & Caribbean",
      "Oceanian",
      "Central Asian",
    ];

    const seeded = (n: number): number => {
      const x = Math.sin(n) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < numPlants; i++) {
      const r1 = seeded(i * 12.9898 + 78.233);
      const r2 = seeded(i * 78.233 + 12.9898);
      const r3 = seeded(i * 93.123 + 45.332);
      const r4 = seeded(i * 55.331 + 21.123);

      const isFlower: boolean = r1 < 0.3;

      // Round values to stable precision to avoid hydration mismatches
      const xVal = Number((r2 * 100).toFixed(4));
      const yVal = Number((r3 * 100).toFixed(4));
      const heightVal = Number(
        (isFlower ? 40 + r4 * 30 : 60 + r4 * 50).toFixed(4)
      );
      const widthVal = Number((isFlower ? 8 + r1 * 6 : 2 + r1 * 2).toFixed(4));

      items.push({
        id: i,
        x: xVal,
        y: yVal,
        type: isFlower ? "flower" : "grass",
        height: heightVal,
        width: widthVal,
        culture: cultures[Math.floor(r2 * cultures.length)],
      });
    }

    return items;
  }, []);

  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getInteraction = (plant: PlantItem) => {
    if (!viewportSize) {
      return { rotation: 0, scale: 1, strength: 0, show: false };
    }

    const plantX = (plant.x / 100) * viewportSize.width;
    const plantY = (plant.y / 100) * viewportSize.height;

    const distance = calculateDistance(
      mousePosition.x,
      mousePosition.y,
      plantX,
      plantY
    );
    const maxDistance = 200;

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance;
      const angle = Math.atan2(
        plantY - mousePosition.y,
        plantX - mousePosition.x
      );
      const rotation = Math.cos(angle) * 20 * strength;
      const scale = 1 + strength * 0.2;

      return { rotation, scale, strength, show: distance < 100 };
    }

    return { rotation: 0, scale: 1, strength: 0, show: false };
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1710596220294-3f88dfe02fd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMG5hdHVyZSUyMGdyb3d0aHxlbnwxfHx8fDE3NjI4ODczNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Nature background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-900 via-neutral-950/90 to-neutral-950" />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-3xl"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400">
            Interactive Experience
          </div>
          <h2 className="text-white mb-4">
            A Living Garden of Cultures
          </h2>
          <p className="mb-8 text-neutral-400">
            Move your cursor to interact with the living ecosystem of cultures.
            Each element represents a tradition swaying in the winds of time.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm bg-neutral-800/50 border-neutral-700 text-neutral-400">
            Hover to reveal cultural connections
          </div>
        </motion.div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          {plants.map((plant) => {
            const { rotation, scale, strength, show } = getInteraction(plant);

            return (
              <motion.div
                key={plant.id}
                className="absolute"
                style={{
                  left: `${plant.x.toFixed(4)}%`,
                  top: `${plant.y.toFixed(4)}%`,
                  transformOrigin: "bottom center",
                }}
                animate={{ rotate: rotation, scale }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 12,
                  mass: 0.5,
                }}
              >
                {plant.type === "grass" ? (
                  <div className="relative">
                    <div
                      className="rounded-t-full"
                      style={{
                        width: `${plant.width.toFixed(4)}px`,
                        height: `${plant.height.toFixed(4)}px`,
                        background:
                          `linear-gradient(to top, rgb(132, 204, 22, ${Number(
                            (0.6 + strength * 0.4).toFixed(4)
                          )}), transparent)`,
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 backdrop-blur-sm border rounded-lg text-xs whitespace-nowrap pointer-events-auto ${
                          "bg-neutral-900/90 border-lime-400/30 text-lime-400"
                        }`}
                      >
                        {plant.culture}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      className="w-3 h-3 rounded-full mb-1"
                      style={{
                        background:
                          `radial-gradient(circle, rgb(163, 230, 53, ${Number(
                            (0.8 + strength * 0.2).toFixed(4)
                          )}), rgb(132, 204, 22, ${Number(
                            (0.6 + strength * 0.4).toFixed(4)
                          )}))`,
                        boxShadow:
                          `0 0 ${Number(
                            (10 + strength * 10).toFixed(4)
                          )}px rgba(163, 230, 53, ${Number(
                            (0.5 + strength * 0.5).toFixed(4)
                          )})`,
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <div
                      className="rounded-t-full"
                      style={{
                        width: "2px",
                        height: `${plant.height}px`,
                        background:
                          `linear-gradient(to top, rgb(132, 204, 22, ${
                            0.5 + strength * 0.3
                          }), transparent)`,
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 backdrop-blur-sm border rounded-lg text-xs whitespace-nowrap pointer-events-auto ${
                          "bg-neutral-900/90 border-lime-400/30 text-lime-400"
                        }`}
                      >
                        {plant.culture}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-20 mt-auto"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <motion.button
              className="px-8 py-4 rounded-full bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Community
            </motion.button>
            <motion.button
              className="px-8 py-4 rounded-full backdrop-blur-sm border bg-neutral-800/50 text-white border-neutral-700 hover:bg-neutral-700/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t pointer-events-none z-30 from-neutral-950 to-transparent" />
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 px-6 lg:px-12 overflow-hidden bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-neutral-900 to-neutral-800 border border-neutral-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-lime-400/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl" />

          <div className="relative px-8 lg:px-16 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-4 text-white">
                  Start Your Cultural Journey Today
                </h2>
                <p className="mb-8 text-lg text-neutral-300">
                  Join thousands of curious minds exploring the world&rsquo;s
                  rich tapestry of traditions, cuisine, and heritage. Sign up
                  for free and begin your adventure.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 px-5 py-4 rounded-full backdrop-blur-sm border bg-neutral-800/50 border-neutral-600">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-transparent outline-none placeholder:text-neutral-500 text-white"
                      />
                    </div>
                  </div>
                  <motion.button
                    className="px-8 py-4 rounded-full flex items-center justify-center gap-2 bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { label: "Active Learners", value: "100K+" },
                  { label: "Languages", value: "50+" },
                  { label: "Recipes", value: "1000+" },
                  { label: "To Start", value: "Free" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-6 rounded-2xl backdrop-blur-sm border bg-neutral-800/50 border-neutral-700"
                  >
                    <div className="mb-2 text-lime-400">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t text-center border-neutral-800 text-neutral-400"
        >
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {["About", "Features", "Community", "Cookies", "Terms"].map(
              (link) => (
                <a
                  key={link}
                  href="/Cookies.html"
                  className="text-sm transition-colors hover:text-lime-400"
                >
                  {link}
                </a>
              )
            )}
          </div>
          <p className="text-sm">
            © 2025 Roots. Connecting cultures, preserving heritage.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

type ImageWithFallbackProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

function ImageWithFallback({
  src,
  alt = "",
  className,
  width,
  height,
}: ImageWithFallbackProps) {
  if (!width || !height) {
    return <Image src={src} alt={alt} fill className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

export default function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Ensure InteractiveGarden only renders on the client after hydration
    // This is intentional to avoid SSR/hydration mismatches with dynamic content
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <Navbar scrollY={scrollY} />
      <HeroSection scrollY={scrollY} />
      <FeaturesSection />
      <ExploreSection />
      {mounted && <InteractiveGarden mousePosition={mousePosition} />}
      <CTASection />
    </div>
  );
}
