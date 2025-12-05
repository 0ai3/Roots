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
} from "lucide-react";
import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { fetchUserId } from "./lib/userId";
import NewsletterSignup from "./components/NewsletterSignup";

// Mock translation function if i18n is not set up
const useI18n = () => ({
  t: (key: string) => key,
});

interface HeroSectionProps {
  scrollY: number;
  userId: string | null;
}

interface FeaturesSectionProps {
  userId: string | null;
}

function FeaturesSectionWithAuth({ userId }: FeaturesSectionProps) {
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
          <h2 className="mb-4 text-white">Your Gateway to Global Culture</h2>
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
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                  <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-lime-400/20 border border-lime-400/30">
                    <feature.icon className="w-6 h-6 text-lime-400" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 text-white">{feature.title}</h3>
                  <p className="mb-4 text-sm text-neutral-400">
                    {feature.description}
                  </p>
                  <Link href={userId ? "/app/dashboard" : "/login"}>
                    <div className="flex items-center gap-2 text-sm text-lime-400 cursor-pointer">
                      <span>Explore more</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface InteractiveGardenProps {
  mousePosition: { x: number; y: number };
  userId: string | null;
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

interface CTASectionProps {
  userId: string | null;
}

type ImageWithFallbackProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
};

function ImageWithFallback({
  src,
  alt = "",
  className,
  width,
  height,
  sizes,
}: ImageWithFallbackProps) {
  if (!width || !height) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
    />
  );
}

function HeroSection({ scrollY, userId }: HeroSectionProps) {
  const parallaxY = scrollY * 0.5;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-neutral-950">
      <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1588437385796-9d13c337040b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3NzJTIwbmF0dXJlJTIwbWFjcm98ZW58MXx8fHwxNzYyODg3MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Nature background"
          sizes="100vw"
          className="w-full h-[120vh] object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-neutral-950/80 to-neutral-950" />
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
                <span className="text-sm text-lime-400 uppercase tracking-widest">
                  Discover Your Heritage
                </span>
              </motion.div>

              <h1 className="mb-8 font-bold text-5xl lg:text-7xl leading-tight text-white font-serif">
                Connect with <br />
                <span className="bg-linear-to-r from-lime-400 via-yellow-300 to-lime-400 bg-clip-text text-transparent">
                  Your Roots
                </span>
              </h1>

              <p className="text-lg mb-10 max-w-xl text-neutral-300 leading-relaxed">
                Dive into the world&apos; s diverse heritage — from age-old
                traditions and authentic cuisines to living stories that define
                who we are.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={userId ? "/app/dashboard" : "/login"}>
                  <motion.button
                    className="px-8 py-4 rounded-full flex items-center gap-2 bg-linear-to-r from-lime-400 to-yellow-300 text-neutral-950 font-semibold hover:shadow-lime-400/30 transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Exploring
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 text-center">
                {[
                  { label: "Countries", value: "195+" },
                  { label: "Traditions", value: "10K+" },
                  { label: "Attractions", value: "5K+" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm uppercase tracking-wide text-neutral-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[500px]">
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 bg-lime-400" />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1761124739933-009df5603fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Cultural celebration"
                  sizes="(max-width: 1024px) 100vw, 45vw"
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
                  <div className="text-white font-semibold">
                    Japanese Tea Ceremony
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
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
        "Discover authentic recipes and food heritage from around the world.",
      image:
        "https://images.unsplash.com/photo-1650678192497-28e426bb627c?q=80&w=1080",
    },
    {
      icon: Building2,
      title: "Museums & Heritage Sites",
      description:
        "Explore cultural museums and historical landmarks globally.",
      image:
        "https://images.unsplash.com/photo-1543633550-8c1c6a5697bd?q=80&w=1080",
    },
    {
      icon: Palette,
      title: "Art & Exhibitions",
      description:
        "Experience traditional art forms and contemporary cultural exhibitions.",
      image:
        "https://images.unsplash.com/photo-1719935115623-4857df23f3c6?q=80&w=1080",
    },
    {
      icon: MapPin,
      title: "Tourist Attractions",
      description:
        "Find cultural hotspots and must-visit destinations worldwide.",
      image:
        "https://images.unsplash.com/photo-1685850749074-9cf8023d7e8d?q=80&w=1080",
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
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400 uppercase tracking-widest text-sm">
            What We Offer
          </div>
          <h2 className="mb-4 text-white font-serif text-4xl lg:text-5xl font-semibold">
            Your Gateway to{" "}
            <span className="bg-linear-to-r from-lime-400 to-yellow-300 bg-clip-text text-transparent">
              Global Culture
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400 text-lg leading-relaxed">
            Immerse yourself in the world&apos;s rich cultural tapestry through
            our comprehensive platform.
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
              <div className="relative overflow-hidden rounded-3xl border transition-all bg-neutral-900 border-neutral-800 hover:border-lime-400/40 hover:shadow-lime-400/10">
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
                  <h3 className="mb-3 text-white text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-neutral-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                  <Link href="/login">
                    <div className="flex items-center gap-2 text-sm text-lime-400 cursor-pointer">
                      <span>Explore more</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </div>
                  </Link>
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
        "https://images.unsplash.com/photo-1604074867235-6829038ab657?q=80&w=1080",
    },
    {
      name: "Europe",
      traditions: "2,800+",
      image:
        "https://images.unsplash.com/photo-1561049448-0f5f892260b9?q=80&w=1080",
    },
    {
      name: "Africa",
      traditions: "2,100+",
      image:
        "https://images.unsplash.com/photo-1664295581055-f0209d9f7f1c?q=80&w=1080",
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-12 bg-neutral-950 overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-lime-400/10 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-yellow-400/10 via-transparent to-transparent blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400 uppercase tracking-widest text-sm">
            Explore by Region
          </div>
          <h2 className="mb-4 text-4xl lg:text-5xl font-serif font-semibold text-white">
            Discover{" "}
            <span className="bg-linear-to-r from-lime-400 via-yellow-300 to-lime-400 bg-clip-text text-transparent">
              Cultural Treasures
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-neutral-400 leading-relaxed">
            Journey through diverse regions and uncover unique traditions,
            flavors, and timeless stories that shape humanity.
          </p>
        </motion.div>

        {/* Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {regions.map((region, index) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer relative"
            >
              <Link href="/login" aria-label={`Explore ${region.name}`}>
                <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 hover:border-lime-400/40 hover:shadow-lime-400/10 transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={region.image}
                      alt={region.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-transparent to-transparent" />
                  </div>

                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-white mb-1 font-serif">
                      {region.name}
                    </h3>
                    <p className="text-sm text-neutral-400 tracking-wide">
                      {region.traditions} traditions
                    </p>
                  </div>
                </div>

                {/* Subtle glow hover effect */}
                <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-40 bg-linear-to-r from-lime-400 via-yellow-300 to-lime-400 blur-2xl transition-opacity duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom 3 Columns: Discover / Learn / Share */}
        <div className="rounded-3xl p-10 lg:p-16 bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm">
          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                title: "Discover",
                icon: Compass,
                copy: "Browse curated collections of global traditions, landmarks, and living cultures.",
              },
              {
                title: "Learn",
                icon: BookOpen,
                copy: "Dive into stories, recipes, and heritage that bring every culture to life.",
              },
              {
                title: "Share",
                icon: Share2,
                copy: "Contribute your experiences and celebrate your own cultural background.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-5"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-linear-to-br from-lime-400 to-yellow-300 shadow-lg shadow-lime-400/30">
                  <item.icon className="w-7 h-7 text-neutral-950" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2 font-serif">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
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
  userId: string | null;
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
    if (typeof window === "undefined") return;

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

      const isFlower = r1 < 0.3;
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

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  const getInteraction = (plant: PlantItem) => {
    if (!viewportSize)
      return { rotation: 0, scale: 1, strength: 0, show: false };

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
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1710596220294-3f88dfe02fd8?q=80&w=1080"
          alt="Nature background"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-900 via-neutral-950/90 to-neutral-950" />
      </div>

      {/* Title Section */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-3xl"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400 uppercase tracking-widest text-sm">
            Interactive Experience
          </div>
          <h2 className="text-white mb-5 text-4xl lg:text-5xl font-serif font-semibold">
            A Living{" "}
            <span className="bg-linear-to-r from-lime-400 via-yellow-300 to-lime-400 bg-clip-text text-transparent">
              Garden of Cultures
            </span>
          </h2>
          <p className="mb-8 text-lg text-neutral-400 leading-relaxed">
            Move your cursor to interact with the living ecosystem of cultures.
            Each plant represents a tradition, gently swaying in the winds of
            time.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-sm border text-sm bg-neutral-800/50 border-neutral-700 text-neutral-300">
            🌿 Hover to reveal cultural connections
          </div>
        </motion.div>

        {/* Interactive Plants Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {plants.map((plant) => {
            const { rotation, scale, strength, show } = getInteraction(plant);

            return (
              <motion.div
                key={plant.id}
                className="absolute"
                style={{
                  left: `${plant.x}%`,
                  top: `${plant.y}%`,
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
                        width: `${plant.width}px`,
                        height: `${plant.height}px`,
                        background: `linear-gradient(to top, rgba(132, 204, 22, ${
                          0.5 + strength * 0.4
                        }), transparent)`,
                        filter: "drop-shadow(0 0 6px rgba(163, 230, 53, 0.3))",
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-4 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-lime-400/30 text-lime-300 bg-neutral-900/90 shadow-lg shadow-lime-400/20 whitespace-nowrap"
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
                        background: `radial-gradient(circle, rgba(163,230,53,${
                          0.8 + strength * 0.2
                        }), rgba(132,204,22,${0.6 + strength * 0.4}))`,
                        boxShadow: `0 0 ${
                          10 + strength * 15
                        }px rgba(163,230,53,${0.4 + strength * 0.5})`,
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
                        background: `linear-gradient(to top, rgba(132, 204, 22, ${
                          0.5 + strength * 0.3
                        }), transparent)`,
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-4 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-lime-400/30 text-lime-300 bg-neutral-900/90 shadow-lg shadow-lime-400/20 whitespace-nowrap"
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
      </div>

      {/* Gradient Fade at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-30" />
    </section>
  );
}

interface CTASectionProps {
  userId: string | null;
}

function CTASection({ userId }: CTASectionProps) {
  return (
    <section className="relative py-28 px-6 lg:px-12 overflow-hidden bg-neutral-950">
      {/* Subtle background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[90%] bg-[radial-gradient(ellipse_at_center,rgba(132,204,22,0.1),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-yellow-400/10 to-transparent blur-3xl" />
      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-20 pt-10 border-t border-neutral-800 text-center"
      >
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          {["About", "Features", "Community", "Cookies", "Terms"].map(
            (link) => (
              <a
                key={link}
                href="/Cookies.html"
                className="text-sm text-neutral-400 hover:text-lime-400 transition-colors font-medium"
              >
                {link}
              </a>
            )
          )}
        </div>

        <p className="text-sm text-neutral-500">
          © 2025 <span className="text-lime-400 font-semibold">Roots</span>.
          Connecting cultures, preserving heritage.
        </p>
      </motion.div>
    </section>
  );
}

export default function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Set mounted after initial render to avoid SSR/hydration issues
    const timer = setTimeout(() => setMounted(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // Fetch user ID
    fetchUserId().then(setUserId);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative font-sans text-neutral-200 bg-neutral-950">
      <Navbar scrollY={scrollY} />
      <HeroSection scrollY={scrollY} userId={userId} />
      <FeaturesSection />
      <ExploreSection />
      {mounted && (
        <InteractiveGarden mousePosition={mousePosition} userId={userId} />
      )}

      {/* Newsletter Section */}
      <section className="py-24 px-6 lg:px-12 bg-neutral-950">
        <NewsletterSignup />
      </section>

      <CTASection userId={userId} />
    </div>
  );
}
