"use client"

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
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
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return (localStorage.getItem("theme") as Theme | null) ?? "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all shadow-lg ${
        theme === "dark"
          ? "bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700/80"
          : "bg-white/90 border-neutral-200 hover:bg-neutral-50/90"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon
          className={`w-5 h-5 ${
            theme === "dark" ? "text-lime-400" : "text-neutral-900"
          }`}
        />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? -180 : 0,
          scale: theme === "dark" ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun
          className={`w-5 h-5 ${
            theme === "dark" ? "text-lime-400" : "text-amber-600"
          }`}
        />
      </motion.div>
    </motion.button>
  );
}

interface NavbarProps {
  scrollY: number;
}

function Navbar({ scrollY }: NavbarProps) {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = scrollY > 50;

  const navLinks = [
    { name: "Traditions", href: "#traditions" },
    { name: "Food & Culture", href: "#food" },
    { name: "Museums", href: "#museums" },
    { name: "Attractions", href: "#attractions" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? theme === "dark"
            ? "bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-800"
            : "bg-white/90 backdrop-blur-lg border-b border-neutral-200 shadow-sm"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={theme === "dark" ? "text-neutral-950" : "text-white"}
              >
                <path
                  d="M12 2C12 2 9 6 9 10C9 12.2091 10.7909 14 13 14C15.2091 14 17 12.2091 17 10C17 6 14 2 14 2H12Z"
                  fill="currentColor"
                />
                <path
                  d="M8 22C8 22 6 18 6 15C6 13.3431 7.34315 12 9 12C10.6569 12 12 13.3431 12 15C12 18 10 22 10 22H8Z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M16 22C16 22 14 18 14 15C14 13.3431 15.3431 12 17 12C18.6569 12 20 13.3431 20 15C20 18 18 22 18 22H16Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <span
              className={`text-xl ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Roots
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors ${
                  theme === "dark"
                    ? "text-neutral-300 hover:text-lime-400"
                    : "text-neutral-700 hover:text-emerald-600"
                }`}
              >
                {link.name}
              </a>
            ))}
            <motion.button
              className={`px-6 py-2.5 rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`md:hidden py-4 border-t ${
              theme === "dark" ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block py-3 text-sm transition-colors ${
                  theme === "dark"
                    ? "text-neutral-300 hover:text-lime-400"
                    : "text-neutral-700 hover:text-emerald-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              className={`w-full mt-4 px-6 py-2.5 rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-lime-400 text-neutral-950"
                  : "bg-emerald-600 text-white"
              }`}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

interface HeroSectionProps {
  scrollY: number;
}

function HeroSection({ scrollY }: HeroSectionProps) {
  const { theme } = useTheme();
  const parallaxY = scrollY * 0.5;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1588437385796-9d13c337040b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3NzJTIwbmF0dXJlJTIwbWFjcm98ZW58MXx8fHwxNzYyODg3MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Nature background"
          className="w-full h-[120vh] object-cover"
        />
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-linear-to-b from-neutral-950/60 via-neutral-950/70 to-neutral-950"
              : "bg-linear-to-b from-amber-50/60 via-orange-50/70 to-white"
          }`}
        />
      </motion.div>

      <div className="relative z-10 w-full px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border ${
                  theme === "dark"
                    ? "bg-lime-400/10 border-lime-400/20"
                    : "bg-emerald-100/80 border-emerald-300/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
                  }`}
                />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-lime-400" : "text-emerald-700"
                  }`}
                >
                  Discover Your Heritage
                </span>
              </motion.div>

              <h1
                className={`mb-6 ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Connect with
                <br />
                <span
                  className={
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }
                >
                  Your Roots
                </span>
              </h1>

              <p
                className={`text-lg mb-8 max-w-xl ${
                  theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Explore traditions, discover authentic cuisines, visit cultural
                museums, and experience the world&rsquo;s rich heritage through
                an interactive journey.
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
                  Start Exploring
                  <ArrowRight className="w-5 h-5" />
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
                  <Play className="w-5 h-5" />
                  Watch Video
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { label: "Countries", value: "195+" },
                  { label: "Traditions", value: "10K+" },
                  { label: "Attractions", value: "5K+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      className={
                        theme === "dark"
                          ? "text-white text-2xl mb-1"
                          : "text-neutral-900 text-2xl mb-1"
                      }
                    >
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-600"
                      }`}
                    >
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
                <div
                  className={`absolute -inset-4 rounded-3xl blur-2xl opacity-30 ${
                    theme === "dark" ? "bg-lime-400" : "bg-emerald-500"
                  }`}
                />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1761124739933-009df5603fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYyODc1MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
                  className={`absolute bottom-8 -left-8 p-4 rounded-2xl backdrop-blur-lg border shadow-xl ${
                    theme === "dark"
                      ? "bg-neutral-900/90 border-neutral-700"
                      : "bg-white/90 border-white/50"
                  }`}
                >
                  <div
                    className={`text-sm mb-1 ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Most Popular
                  </div>
                  <div
                    className={
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }
                  >
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
        <div
          className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 ${
            theme === "dark" ? "border-neutral-600" : "border-neutral-400"
          }`}
        >
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${
              theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
            }`}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const { theme } = useTheme();

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
    <section
      className={`relative py-24 px-6 lg:px-12 ${
        theme === "dark"
          ? "bg-neutral-950"
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
            What We Offer
          </div>
          <h2
            className={`mb-4 ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            Your Gateway to Global Culture
          </h2>
          <p
            className={`max-w-2xl mx-auto ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
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
              <div
                className={`relative overflow-hidden rounded-3xl border transition-all ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800 hover:border-lime-400/30"
                    : "bg-white border-neutral-200 hover:border-emerald-400/50 shadow-lg hover:shadow-xl"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className={`absolute inset-0 ${
                      theme === "dark"
                        ? "bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent"
                        : "bg-linear-to-t from-white via-white/40 to-transparent"
                    }`}
                  />

                  <div
                    className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-lime-400/20 border border-lime-400/30"
                        : "bg-white/90 border border-emerald-400/30"
                    }`}
                  >
                    <feature.icon
                      className={`w-6 h-6 ${
                        theme === "dark" ? "text-lime-400" : "text-emerald-600"
                      }`}
                    />
                  </div>
                </div>

                <div className="p-6">
                  <h3
                    className={`mb-3 ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`mb-4 text-sm ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      theme === "dark" ? "text-lime-400" : "text-emerald-600"
                    }`}
                  >
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
  const { theme } = useTheme();

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
    <section
      className={`relative py-24 px-6 lg:px-12 ${
        theme === "dark" ? "bg-neutral-900" : "bg-orange-50/50"
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
            Explore by Region
          </div>
          <h2
            className={`mb-4 ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            Discover Cultural Treasures
          </h2>
          <p
            className={`max-w-2xl mx-auto ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
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
              <div
                className={`relative overflow-hidden rounded-2xl border ${
                  theme === "dark"
                    ? "bg-neutral-800 border-neutral-700 hover:border-lime-400/50"
                    : "bg-white border-neutral-200 hover:border-emerald-400/50 shadow-md hover:shadow-xl"
                } transition-all`}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 ${
                      theme === "dark"
                        ? "bg-linear-to-t from-neutral-800 to-transparent"
                        : "bg-linear-to-t from-white to-transparent"
                    }`}
                  />
                </div>
                <div className="p-5">
                  <h3
                    className={`mb-2 ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {region.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {region.traditions} traditions
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div
          className={`rounded-3xl p-8 lg:p-12 ${
            theme === "dark"
              ? "bg-neutral-800/50 border border-neutral-700"
              : "bg-linear-to-br from-emerald-50 to-orange-50 border border-emerald-200/50"
          }`}
        >
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
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 ${
                      theme === "dark" ? "text-neutral-950" : "text-white"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`mb-2 ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
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
  const { theme } = useTheme();

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
    if (typeof window === "undefined") {
      return { rotation: 0, scale: 1, strength: 0, show: false };
    }

    const plantX = (plant.x / 100) * window.innerWidth;
    const plantY = (plant.y / 100) * window.innerHeight;

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
    <section
      className={`relative min-h-screen overflow-hidden ${
        theme === "dark"
          ? "bg-neutral-950"
          : "bg-linear-to-b from-orange-50/30 to-white"
      }`}
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1710596220294-3f88dfe02fd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMG5hdHVyZSUyMGdyb3d0aHxlbnwxfHx8fDE3NjI4ODczNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Nature background"
          className={`w-full h-full object-cover ${
            theme === "dark" ? "opacity-20" : "opacity-10"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-linear-to-b from-neutral-900 via-neutral-950/90 to-neutral-950"
              : "bg-linear-to-b from-orange-50/50 via-white/90 to-white"
          }`}
        />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-3xl"
        >
          <div
            className={`inline-block px-4 py-2 rounded-full mb-4 ${
              theme === "dark"
                ? "bg-lime-400/10 text-lime-400"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Interactive Experience
          </div>
          <h2
            className={
              theme === "dark" ? "text-white mb-4" : "text-neutral-900 mb-4"
            }
          >
            A Living Garden of Cultures
          </h2>
          <p
            className={`mb-8 ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Move your cursor to interact with the living ecosystem of cultures.
            Each element represents a tradition swaying in the winds of time.
          </p>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm ${
              theme === "dark"
                ? "bg-neutral-800/50 border-neutral-700 text-neutral-400"
                : "bg-white/70 border-emerald-200 text-neutral-600"
            }`}
          >
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
                          theme === "dark"
                            ? `linear-gradient(to top, rgb(132, 204, 22, ${Number(
                                (0.6 + strength * 0.4).toFixed(4)
                              )}), transparent)`
                            : `linear-gradient(to top, rgb(101, 163, 13, ${Number(
                                (0.7 + strength * 0.3).toFixed(4)
                              )}), transparent)`,
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 backdrop-blur-sm border rounded-lg text-xs whitespace-nowrap pointer-events-auto ${
                          theme === "dark"
                            ? "bg-neutral-900/90 border-lime-400/30 text-lime-400"
                            : "bg-white/90 border-lime-500/30 text-lime-700"
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
                          theme === "dark"
                            ? `radial-gradient(circle, rgb(163, 230, 53, ${Number(
                                (0.8 + strength * 0.2).toFixed(4)
                              )}), rgb(132, 204, 22, ${Number(
                                (0.6 + strength * 0.4).toFixed(4)
                              )}))`
                            : `radial-gradient(circle, rgb(132, 204, 22, ${Number(
                                (0.8 + strength * 0.2).toFixed(4)
                              )}), rgb(101, 163, 13, ${Number(
                                (0.6 + strength * 0.4).toFixed(4)
                              )}))`,
                        boxShadow:
                          theme === "dark"
                            ? `0 0 ${Number(
                                (10 + strength * 10).toFixed(4)
                              )}px rgba(163, 230, 53, ${Number(
                                (0.5 + strength * 0.5).toFixed(4)
                              )})`
                            : `0 0 ${Number(
                                (10 + strength * 10).toFixed(4)
                              )}px rgba(132, 204, 22, ${Number(
                                (0.4 + strength * 0.4).toFixed(4)
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
                          theme === "dark"
                            ? `linear-gradient(to top, rgb(132, 204, 22, ${
                                0.5 + strength * 0.3
                              }), transparent)`
                            : `linear-gradient(to top, rgb(101, 163, 13, ${
                                0.6 + strength * 0.3
                              }), transparent)`,
                      }}
                    />
                    {show && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 backdrop-blur-sm border rounded-lg text-xs whitespace-nowrap pointer-events-auto ${
                          theme === "dark"
                            ? "bg-neutral-900/90 border-lime-400/30 text-lime-400"
                            : "bg-white/90 border-lime-500/30 text-lime-700"
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
              className={`px-8 py-4 rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                  : "bg-lime-600 text-white hover:bg-lime-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Community
            </motion.button>
            <motion.button
              className={`px-8 py-4 rounded-full backdrop-blur-sm border transition-colors ${
                theme === "dark"
                  ? "bg-neutral-800/50 text-white border-neutral-700 hover:bg-neutral-700/50"
                  : "bg-white/50 text-neutral-900 border-neutral-300 hover:bg-neutral-100/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t pointer-events-none z-30 ${
          theme === "dark"
            ? "from-neutral-950 to-transparent"
            : "from-white to-transparent"
        }`}
      />
    </section>
  );
}

function CTASection() {
  const { theme } = useTheme();

  return (
    <section
      className={`relative py-24 px-6 lg:px-12 overflow-hidden ${
        theme === "dark" ? "bg-neutral-950" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark"
              ? "bg-linear-to-br from-neutral-900 to-neutral-800 border border-neutral-700"
              : "bg-linear-to-br from-emerald-600 to-orange-500"
          }`}
        >
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
                <h2
                  className={`mb-4 ${
                    theme === "dark" ? "text-white" : "text-white"
                  }`}
                >
                  Start Your Cultural Journey Today
                </h2>
                <p
                  className={`mb-8 text-lg ${
                    theme === "dark" ? "text-neutral-300" : "text-white/90"
                  }`}
                >
                  Join thousands of curious minds exploring the world&rsquo;s
                  rich tapestry of traditions, cuisine, and heritage. Sign up
                  for free and begin your adventure.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div
                      className={`flex items-center gap-3 px-5 py-4 rounded-full backdrop-blur-sm border ${
                        theme === "dark"
                          ? "bg-neutral-800/50 border-neutral-600"
                          : "bg-white/20 border-white/30"
                      }`}
                    >
                      <Mail
                        className={`w-5 h-5 ${
                          theme === "dark"
                            ? "text-neutral-400"
                            : "text-white/70"
                        }`}
                      />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className={`flex-1 bg-transparent outline-none placeholder:${
                          theme === "dark"
                            ? "text-neutral-500"
                            : "text-white/60"
                        } ${theme === "dark" ? "text-white" : "text-white"}`}
                      />
                    </div>
                  </div>
                  <motion.button
                    className={`px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-colors ${
                      theme === "dark"
                        ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                        : "bg-white text-emerald-600 hover:bg-neutral-100"
                    }`}
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
                    className={`p-6 rounded-2xl backdrop-blur-sm border ${
                      theme === "dark"
                        ? "bg-neutral-800/50 border-neutral-700"
                        : "bg-white/20 border-white/30"
                    }`}
                  >
                    <div
                      className={`mb-2 ${
                        theme === "dark" ? "text-lime-400" : "text-white"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-neutral-300" : "text-white/90"
                      }`}
                    >
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
          className={`mt-16 pt-8 border-t text-center ${
            theme === "dark"
              ? "border-neutral-800 text-neutral-400"
              : "border-neutral-200 text-neutral-600"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {["About", "Features", "Community", "Privacy", "Terms"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className={`text-sm transition-colors ${
                    theme === "dark"
                      ? "hover:text-lime-400"
                      : "hover:text-emerald-600"
                  }`}
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
  width?: number | string;
  height?: number | string;
};

function ImageWithFallback({
  src,
  alt = "",
  className,
  width,
  height,
}: ImageWithFallbackProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

export default function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <div className="relative">
        <Navbar scrollY={scrollY} />
        <ThemeToggle />
        <HeroSection scrollY={scrollY} />
        <FeaturesSection />
        <ExploreSection />
        <InteractiveGarden mousePosition={mousePosition} />
        <CTASection />
      </div>
    </ThemeProvider>
  );
}
