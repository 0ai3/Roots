"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "../../../app/components/DashboardPageLayout";
import PageThemeToggle from "../../../app/components/PageThemeToggle";
import {
  MapPin,
  Utensils,
  Star,
  Trash2,
  Plus,
  Globe2,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  FileText,
  Camera,
  Award,
  Loader2,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Book,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type LogEntry = {
  _id: string;
  type: "attraction" | "recipe";
  title: string;
  description: string;
  country: string;
  city: string;
  rating: number | null;
  imageUrl: string;
  notes: string;
  visitedAt: string;
};

type Task = {
  _id: string;
  type: "recipe" | "location";
  title: string;
  location: string;
  country: string;
  beforeImage: string;
  afterImage: string;
  verification: {
    verified: boolean;
    confidence: number;
    reasoning: string;
    dishIdentified?: string;
    locationIdentified?: string;
  };
  pointsEarned: number;
  createdAt: string;
};

type LogStats = {
  totalAttractions: number;
  totalRecipes: number;
  countriesVisited: number;
  worldPercentage: number;
};

type ValidationState = {
  country: "idle" | "validating" | "valid" | "invalid";
  city: "idle" | "validating" | "valid" | "invalid";
};

export default function LogsPage() {
  const [showBrowse, setShowBrowse] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme management
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkMode(saved === "dark");
      } else {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    } catch {
      // ignore
    }

    const handleThemeChange = (event: CustomEvent<{ isDark: boolean }>) => {
      setIsDarkMode(event.detail.isDark);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, []);

  // Color utility functions
  const getBgColor = (opacity: string = "") => {
    return isDarkMode ? `bg-black${opacity}` : `bg-white${opacity}`;
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-slate-900";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-white/70" : "text-slate-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-slate-200";
  };

  const getCardBg = () => {
    return isDarkMode ? "bg-white/5" : "bg-slate-50";
  };

  const getInputBg = () => {
    return isDarkMode ? "bg-slate-950/40" : "bg-white";
  };

  // Accent color helpers: emerald in light mode, lime in dark mode
  const accent = {
    bg500: isDarkMode ? "bg-lime-500" : "bg-emerald-500",
    hover400: isDarkMode ? "hover:bg-lime-400" : "hover:bg-emerald-400",
    text400: isDarkMode ? "text-lime-400" : "text-emerald-400",
    border400_50: isDarkMode ? "border-lime-400/50" : "border-emerald-400/50",
    bg50: isDarkMode ? "bg-lime-50" : "bg-emerald-50",
    text900: isDarkMode ? "text-lime-900" : "text-emerald-900",
    border400_40: isDarkMode ? "border-lime-400/40" : "border-emerald-400/40",
    bg400_10: isDarkMode ? "bg-lime-400/10" : "bg-emerald-400/10",
    text700: isDarkMode ? "text-lime-700" : "text-emerald-700",
    hoverBorder400_50: isDarkMode
      ? "hover:border-lime-400/50"
      : "hover:border-emerald-400/50",
    from500_20: isDarkMode ? "from-lime-500/20" : "from-emerald-500/20",
    from400: isDarkMode ? "from-lime-400" : "from-emerald-400",
    bg500_10: isDarkMode ? "bg-lime-500/10" : "bg-emerald-500/10",
    border400_30: isDarkMode ? "border-lime-400/30" : "border-emerald-400/30",
  };

  // ALL YOUR EXISTING STATE VARIABLES - KEEP EVERYTHING EXACTLY AS IS
  const [activeTab, setActiveTab] = useState<"logs" | "tasks">("logs");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalAttractions: 0,
    totalRecipes: 0,
    countriesVisited: 0,
    worldPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "attraction" | "recipe">(
    "all"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [validation, setValidation] = useState<ValidationState>({
    country: "idle",
    city: "idle",
  });
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    type: "attraction" as "attraction" | "recipe",
    title: "",
    description: "",
    country: "",
    city: "",
    rating: 5,
    notes: "",
    imageUrl: "",
  });
  const [taskFormData, setTaskFormData] = useState({
    type: "recipe" as "recipe" | "location",
    title: "",
    location: "",
    country: "",
    beforeImage: "",
    afterImage: "",
  });
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs || []);
        setStats(
          data.stats || {
            totalAttractions: 0,
            totalRecipes: 0,
            countriesVisited: 0,
            worldPercentage: 0,
          }
        );
      }
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  useEffect(() => {
    loadLogs();
    loadTasks();
  }, []);

  // Debounced validation for location
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.city && formData.country) {
        validateLocation(formData.city, formData.country);
      } else if (formData.country && !formData.city) {
        validateCountry(formData.country);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.city, formData.country]);

  const validateCountry = async (country: string) => {
    if (!country.trim()) {
      setValidation((prev) => ({ ...prev, country: "idle" }));
      return;
    }

    setValidation((prev) => ({ ...prev, country: "validating" }));

    try {
      // Using REST Countries API to validate country
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(
          country
        )}?fullText=false`
      );

      if (response.ok) {
        const data = await response.json();
        const exactMatch = data.some((c: { name: { common: string; official: string } }) =>
          c.name.common.toLowerCase() === country.toLowerCase() ||
          c.name.official.toLowerCase() === country.toLowerCase()
        );

        if (exactMatch || data.length > 0) {
          setValidation((prev) => ({ ...prev, country: "valid" }));
          setValidationMessage(`✓ ${data[0].name.common} found`);
        } else {
          setValidation((prev) => ({ ...prev, country: "invalid" }));
          setValidationMessage("Country not found. Please check spelling.");
        }
      } else {
        setValidation((prev) => ({ ...prev, country: "invalid" }));
        setValidationMessage("Country not found. Please check spelling.");
      }
    } catch (error) {
      console.error("Country validation error", error);
      setValidation((prev) => ({ ...prev, country: "idle" }));
    }
  };

  const validateLocation = async (city: string, country: string) => {
    if (!city.trim() || !country.trim()) {
      setValidation({ country: "idle", city: "idle" });
      return;
    }

    setValidation({ country: "validating", city: "validating" });

    try {
      // Using OpenStreetMap Nominatim API for location validation
      const query = `${city}, ${country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "RootsApp/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
          const result = data[0];
          setValidation({ country: "valid", city: "valid" });
          setValidationMessage(`✓ Location verified: ${result.display_name}`);
        } else {
          setValidation({ country: "invalid", city: "invalid" });
          setValidationMessage(
            "Location not found. Please check city and country spelling."
          );
        }
      } else {
        setValidation({ country: "idle", city: "idle" });
        setValidationMessage("");
      }
    } catch (error) {
      console.error("Location validation error", error);
      setValidation({ country: "idle", city: "idle" });
      setValidationMessage("");
    }
  };

  const toggleNotes = (logId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaskImageChange =
    (type: "before" | "after") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size should be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file");
          return;
        }

        // Convert to base64 for preview and storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if (type === "before") {
            setBeforePreview(base64String);
            setTaskFormData({ ...taskFormData, beforeImage: base64String });
          } else {
            setAfterPreview(base64String);
            setTaskFormData({ ...taskFormData, afterImage: base64String });
          }
        };
        reader.readAsDataURL(file);
      }
    };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
  };

  const removeTaskImage = (type: "before" | "after") => {
    if (type === "before") {
      setBeforePreview(null);
      setTaskFormData({ ...taskFormData, beforeImage: "" });
    } else {
      setAfterPreview(null);
      setTaskFormData({ ...taskFormData, afterImage: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if location is validated when provided
    if (formData.country && validation.country === "invalid") {
      alert("Please enter a valid country name.");
      return;
    }

    if (formData.city && validation.city === "invalid") {
      alert("Please enter a valid city name.");
      return;
    }

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          type: "attraction",
          title: "",
          description: "",
          country: "",
          city: "",
          rating: 5,
          notes: "",
          imageUrl: "",
        });
        setImagePreview(null);
        setValidation({ country: "idle", city: "idle" });
        setValidationMessage("");
        setShowAddForm(false);
        loadLogs();
      }
    } catch (error) {
      console.error("Failed to add log", error);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskFormData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Task ${data.verification.verified ? "verified" : "not verified"}! ${
            data.verification.verified
              ? `You earned ${data.pointsEarned} points!`
              : data.verification.reasoning
          }`
        );
        setTaskFormData({
          type: "recipe",
          title: "",
          location: "",
          country: "",
          beforeImage: "",
          afterImage: "",
        });
        setBeforePreview(null);
        setAfterPreview(null);
        setShowTaskForm(false);
        loadTasks();
      } else {
        alert(data.error || "Failed to verify task");
      }
    } catch (error) {
      console.error("Failed to submit task", error);
      alert("Failed to submit task. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const response = await fetch(`/api/logs?id=${logId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadLogs();
      }
    } catch (error) {
      console.error("Failed to delete log", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const filteredLogs =
    filterType === "all" ? logs : logs.filter((log) => log.type === filterType);

  const getValidationIcon = (field: "country" | "city") => {
    switch (validation[field]) {
      case "validating":
        return (
          <div
            className={`h-5 w-5 animate-spin rounded-full border-2 ${
              isDarkMode ? "border-white/20" : "border-slate-400"
            } ${isDarkMode ? "border-t-lime-400" : "border-t-emerald-400"}`}
          />
        );
      case "valid":
        return (
          <CheckCircle
            className={`h-5 w-5 ${
              isDarkMode ? "text-lime-400" : "text-emerald-400"
            }`}
          />
        );
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <DashboardPageLayout>
      {showBrowse ? (
        // Hero/Browse View
        <div className="relative min-h-screen">
          <div className="fixed top-6 right-6 z-50">
            <PageThemeToggle />
          </div>

          {/* Hero Section */}
          <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1920&q=80"
                alt="Travel journal"
                fill
                className="object-cover"
                priority
              />
              <div
                className={`absolute inset-0 ${
                  isDarkMode
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
                  isDarkMode
                    ? "bg-lime-400/10 border-lime-400/20"
                    : "bg-emerald-100/80 border-emerald-300/50"
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-lime-400" : "text-emerald-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-lime-400" : "text-emerald-700"
                  }`}
                >
                  Your Adventure Journal
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                Travel{" "}
                <span
                  className={isDarkMode ? "text-lime-400" : "text-emerald-600"}
                >
                  Logs
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`text-xl mb-8 max-w-2xl mx-auto ${
                  isDarkMode ? "text-white/90" : "text-neutral-700"
                }`}
              >
                Document your cultural adventures, track visited places, and
                verify your experiences with AI-powered photo verification
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
                  onClick={() => setShowBrowse(false)}
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-colors ${
                    isDarkMode
                      ? "bg-lime-400 text-black hover:bg-lime-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <Book className="w-5 h-5" />
                  View My Logs
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBrowse(false)}
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 backdrop-blur-sm border transition-colors ${
                    isDarkMode
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      : "bg-white/50 text-neutral-900 border-neutral-300 hover:bg-white"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  Submit Verification
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="relative z-20 -mt-20 mb-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: MapPin,
                    label: "Attractions",
                    value: stats.totalAttractions,
                    color: "lime",
                    desc: "Places you've visited",
                  },
                  {
                    icon: Utensils,
                    label: "Recipes",
                    value: stats.totalRecipes,
                    color: "orange",
                    desc: "Dishes you've cooked",
                  },
                  {
                    icon: Globe2,
                    label: "Countries",
                    value: stats.countriesVisited,
                    color: "blue",
                    desc: `World coverage: ${stats.worldPercentage}%`,
                  },
                  {
                    icon: TrendingUp,
                    label: "This Month",
                    value: "+12",
                    color: "purple",
                    desc: "New entries added",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl p-6 shadow-xl border ${
                      isDarkMode
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isDarkMode
                            ? `bg-${stat.color}-400/20`
                            : `bg-${stat.color}-100`
                        }`}
                      >
                        <stat.icon
                          className={`w-6 h-6 ${
                            isDarkMode
                              ? `text-${stat.color}-400`
                              : `text-${stat.color}-600`
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-neutral-400" : "text-neutral-600"
                          }`}
                        >
                          {stat.label}
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      {stat.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        // Original Logs Interface
        <div
          className={`min-h-screen ${getBgColor()} ${getTextColor()} transition-colors duration-300`}
        >
          <div className="flex justify-between items-center mb-6 px-6 pt-6">
            <button
              onClick={() => setShowBrowse(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                isDarkMode
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              }`}
            >
              ← Back to Overview
            </button>
            <PageThemeToggle />
          </div>
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Travel Logs & Tasks</h1>
                <p className={`mt-2 ${getMutedTextColor()}`}>
                  Track your adventures and complete verification tasks
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Theme is controlled by the global ThemeToggle component */}
                {/* EXISTING BUTTON */}
                <button
                  onClick={() =>
                    activeTab === "logs"
                      ? setShowAddForm(!showAddForm)
                      : setShowTaskForm(!showTaskForm)
                  }
                  className={`flex items-center gap-2 rounded-full ${accent.bg500} px-6 py-3 font-semibold text-slate-950 transition ${accent.hover400}`}
                >
                  <Plus className="h-5 w-5" />
                  {activeTab === "logs" ? "Add Entry" : "New Task"}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition ${
                  activeTab === "logs"
                    ? `${accent.bg500} text-slate-950`
                    : isDarkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                <Globe2 className="h-5 w-5" />
                Logs
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition ${
                  activeTab === "tasks"
                    ? `${accent.bg500} text-slate-950`
                    : isDarkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                <Award className="h-5 w-5" />
                Verification Tasks
              </button>
            </div>

            {activeTab === "logs" ? (
              <>
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-3xl border border-white/10 bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-6 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <Globe2 className="h-8 w-8 text-emerald-400" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/60">
                          World Explored
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.worldPercentage}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-linear-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                        style={{ width: `${stats.worldPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border ${getBorderColor()} ${getCardBg()} p-6 backdrop-blur`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-8 w-8 text-blue-400" />
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                        >
                          Attractions
                        </p>
                        <p className="text-3xl font-bold">
                          {stats.totalAttractions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border ${getBorderColor()} ${getCardBg()} p-6 backdrop-blur`}
                  >
                    <div className="flex items-center gap-3">
                      <Utensils className="h-8 w-8 text-orange-400" />
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                        >
                          Recipes Cooked
                        </p>
                        <p className="text-3xl font-bold">
                          {stats.totalRecipes}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border ${getBorderColor()} ${getCardBg()} p-6 backdrop-blur`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe2 className="h-8 w-8 text-purple-400" />
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                        >
                          Countries
                        </p>
                        <p className="text-3xl font-bold">
                          {stats.countriesVisited}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <form
                    onSubmit={handleSubmit}
                    className={`space-y-4 rounded-3xl border ${getBorderColor()} ${getCardBg()} p-6 backdrop-blur`}
                  >
                    <h3 className="text-xl font-semibold">Add New Entry</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label
                        className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                      >
                        <span>Type</span>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as "attraction" | "recipe",
                            })
                          }
                          className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3`}
                        >
                          <option value="attraction">Attraction</option>
                          <option value="recipe">Recipe</option>
                        </select>
                      </label>

                      <label
                        className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                      >
                        <span>Title *</span>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                          placeholder="Name of place or recipe"
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label
                        className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                      >
                        <span>Country</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                country: e.target.value,
                              })
                            }
                            className={`w-full rounded-2xl border px-4 py-3 pr-12 ${
                              validation.country === "invalid"
                                ? "border-red-400/50 bg-red-50 text-red-900"
                                : validation.country === "valid"
                                ? `${accent.border400_50} ${accent.bg50} ${accent.text900}`
                                : `${getBorderColor()} ${getInputBg()}`
                            }`}
                            placeholder="Country name"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {getValidationIcon("country")}
                          </div>
                        </div>
                      </label>

                      <label
                        className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                      >
                        <span>City</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className={`w-full rounded-2xl border px-4 py-3 pr-12 ${
                              validation.city === "invalid"
                                ? "border-red-400/50 bg-red-50 text-red-900"
                                : validation.city === "valid"
                                ? `${accent.border400_50} ${accent.bg50} ${accent.text900}`
                                : `${getBorderColor()} ${getInputBg()}`
                            }`}
                            placeholder="City name"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {getValidationIcon("city")}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Validation Message */}
                    {validationMessage && (
                      <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                          validation.country === "valid" &&
                          validation.city === "valid"
                            ? `${accent.border400_40} ${accent.bg400_10} ${accent.text700}`
                            : "border-yellow-400/40 bg-yellow-400/10 text-yellow-700"
                        }`}
                      >
                        {validationMessage}
                      </div>
                    )}

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${getMutedTextColor()}`}
                      >
                        Photo (Optional)
                      </label>
                      {imagePreview ? (
                        <div className="relative">
                          <div
                            className={`relative h-64 w-full overflow-hidden rounded-2xl border ${getBorderColor()}`}
                          >
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed ${
                            isDarkMode ? "border-white/20" : "border-slate-300"
                          } ${getInputBg()} transition ${
                            accent.hoverBorder400_50
                          }`}
                        >
                          <Upload
                            className={`h-8 w-8 ${getMutedTextColor()}`}
                          />
                          <span
                            className={`mt-2 text-sm ${getMutedTextColor()}`}
                          >
                            Click to upload a photo
                          </span>
                          <span
                            className={`mt-1 text-xs ${getMutedTextColor()}`}
                          >
                            PNG, JPG up to 5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <label
                      className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                    >
                      <span>Description</span>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                        placeholder="Tell us about your experience..."
                        rows={3}
                      />
                    </label>

                    <label
                      className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                    >
                      <span>Rating: {formData.rating}/5</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>

                    <label
                      className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                    >
                      <span>Personal Notes</span>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                        placeholder="Private notes, tips, things to remember..."
                        rows={2}
                      />
                      <p className={`text-xs ${getMutedTextColor()}`}>
                        These are your personal notes that will be shown below
                        each log entry.
                      </p>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className={`rounded-full ${accent.bg500} px-6 py-2 font-semibold text-slate-950 transition ${accent.hover400}`}
                      >
                        Save Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setImagePreview(null);
                          setValidation({ country: "idle", city: "idle" });
                          setValidationMessage("");
                        }}
                        className={`rounded-full border ${getBorderColor()} px-6 py-2 font-semibold transition ${
                          isDarkMode
                            ? "text-white hover:bg-white/10"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {(["all", "attraction", "recipe"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                        filterType === type
                          ? `${accent.bg500} text-slate-950`
                          : isDarkMode
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : type === "attraction"
                        ? "Attractions"
                        : "Recipes"}
                    </button>
                  ))}
                </div>

                {/* Logs List */}
                {isLoading ? (
                  <p className={`text-center ${getMutedTextColor()}`}>
                    Loading your travel logs...
                  </p>
                ) : filteredLogs.length === 0 ? (
                  <div
                    className={`rounded-3xl border ${getBorderColor()} ${getCardBg()} p-12 text-center backdrop-blur`}
                  >
                    <p className={getMutedTextColor()}>
                      No entries yet. Start logging your adventures!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLogs.map((log) => (
                      <div
                        key={log._id}
                        className={`group rounded-3xl border ${getBorderColor()} ${getCardBg()} backdrop-blur transition hover:${
                          isDarkMode ? "bg-white/10" : "bg-slate-100"
                        } overflow-hidden`}
                      >
                        {/* Image */}
                        {log.imageUrl ? (
                          <div className="relative h-48 w-full">
                            <Image
                              src={log.imageUrl}
                              alt={log.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex h-48 w-full items-center justify-center ${
                              isDarkMode
                                ? "bg-linear-to-br from-slate-800/50 to-slate-900/50"
                                : "bg-slate-200"
                            }`}
                          >
                            <ImageIcon
                              className={`h-16 w-16 ${
                                isDarkMode ? "text-white/20" : "text-slate-400"
                              }`}
                            />
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {log.type === "attraction" ? (
                                <MapPin className="h-5 w-5 text-blue-400" />
                              ) : (
                                <Utensils className="h-5 w-5 text-orange-400" />
                              )}
                              <span
                                className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                              >
                                {log.type}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDelete(log._id)}
                              className="opacity-0 transition group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                            </button>
                          </div>

                          <h3 className="mt-3 text-xl font-semibold">
                            {log.title}
                          </h3>

                          {(log.city || log.country) && (
                            <p className={`mt-1 text-sm ${accent.text400}`}>
                              {[log.city, log.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}

                          {log.description && (
                            <p
                              className={`mt-3 text-sm ${getMutedTextColor()} line-clamp-2`}
                            >
                              {log.description}
                            </p>
                          )}

                          {log.rating && (
                            <div className="mt-3 flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < log.rating!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : getMutedTextColor()
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Notes Section */}
                          {log.notes && (
                            <div className="mt-4">
                              <button
                                onClick={() => toggleNotes(log._id)}
                                className={`flex items-center gap-2 text-xs ${getMutedTextColor()} hover:${
                                  isDarkMode
                                    ? "text-white/80"
                                    : "text-slate-800"
                                } transition`}
                              >
                                <FileText className="h-4 w-4" />
                                <span>
                                  {expandedNotes.has(log._id) ? "Hide" : "Show"}{" "}
                                  Personal Notes
                                </span>
                              </button>
                              {expandedNotes.has(log._id) && (
                                <div
                                  className={`mt-2 rounded-xl border ${getBorderColor()} ${
                                    isDarkMode
                                      ? "bg-slate-950/40"
                                      : "bg-slate-100"
                                  } p-3`}
                                >
                                  <p
                                    className={`text-sm ${getMutedTextColor()} whitespace-pre-wrap`}
                                  >
                                    {log.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="mt-4 text-xs text-white/40">
                            {new Date(log.visitedAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Tasks Tab Content */}
                <div className="rounded-3xl border border-white/10 bg-linear-to-br from-purple-500/20 to-pink-500/20 p-6 backdrop-blur">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Award className="h-6 w-6 text-purple-400" />
                    Photo Verification Challenges
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    Upload before/after photos of recipes you cooked or photos
                    from locations you visited. Our AI will verify them and
                    award you bonus points!
                  </p>
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-orange-400" />
                      <span className="text-white/80">Recipe: +10 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span className="text-white/80">Location: +15 pts</span>
                    </div>
                  </div>
                </div>

                {/* Task Form */}
                {showTaskForm && (
                  <form
                    onSubmit={handleTaskSubmit}
                    className={`space-y-4 rounded-3xl border ${getBorderColor()} ${getCardBg()} p-6 backdrop-blur`}
                  >
                    <h3 className="text-xl font-semibold">
                      Submit Verification Task
                    </h3>

                    <label
                      className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                    >
                      <span>Task Type</span>
                      <select
                        value={taskFormData.type}
                        onChange={(e) =>
                          setTaskFormData({
                            ...taskFormData,
                            type: e.target.value as "recipe" | "location",
                          })
                        }
                        className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3`}
                      >
                        <option value="recipe">
                          Recipe (Before & After Photos)
                        </option>
                        <option value="location">
                          Location (Photo at Place)
                        </option>
                      </select>
                    </label>

                    <label
                      className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                    >
                      <span>
                        {taskFormData.type === "recipe"
                          ? "Recipe Name"
                          : "Location Name"}{" "}
                        *
                      </span>
                      <input
                        type="text"
                        value={taskFormData.title}
                        onChange={(e) =>
                          setTaskFormData({
                            ...taskFormData,
                            title: e.target.value,
                          })
                        }
                        className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                        placeholder={
                          taskFormData.type === "recipe"
                            ? "e.g., Sushi Rolls"
                            : "e.g., Eiffel Tower"
                        }
                        required
                      />
                    </label>

                    {taskFormData.type === "location" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label
                          className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                        >
                          <span>City/Location</span>
                          <input
                            type="text"
                            value={taskFormData.location}
                            onChange={(e) =>
                              setTaskFormData({
                                ...taskFormData,
                                location: e.target.value,
                              })
                            }
                            className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                            placeholder="Paris"
                          />
                        </label>

                        <label
                          className={`space-y-2 text-sm font-medium ${getMutedTextColor()}`}
                        >
                          <span>Country</span>
                          <input
                            type="text"
                            value={taskFormData.country}
                            onChange={(e) =>
                              setTaskFormData({
                                ...taskFormData,
                                country: e.target.value,
                              })
                            }
                            className={`w-full rounded-2xl border ${getBorderColor()} ${getInputBg()} px-4 py-3 placeholder:${getMutedTextColor()}`}
                            placeholder="France"
                          />
                        </label>
                      </div>
                    )}

                    {/* Photo Uploads */}
                    <div
                      className={`grid gap-4 ${
                        taskFormData.type === "recipe" ? "md:grid-cols-2" : ""
                      }`}
                    >
                      {taskFormData.type === "recipe" && (
                        <div className="space-y-2">
                          <label
                            className={`text-sm font-medium ${getMutedTextColor()}`}
                          >
                            Before Photo (Ingredients/Process) *
                          </label>
                          {beforePreview ? (
                            <div className="relative">
                              <div
                                className={`relative h-48 w-full overflow-hidden rounded-2xl border ${getBorderColor()}`}
                              >
                                <Image
                                  src={beforePreview}
                                  alt="Before"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTaskImage("before")}
                                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed ${
                                isDarkMode
                                  ? "border-white/20"
                                  : "border-slate-300"
                              } ${getInputBg()} transition ${
                                accent.hoverBorder400_50
                              }`}
                            >
                              <Camera
                                className={`h-8 w-8 ${getMutedTextColor()}`}
                              />
                              <span
                                className={`mt-2 text-sm ${getMutedTextColor()}`}
                              >
                                Upload before photo
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleTaskImageChange("before")}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label
                          className={`text-sm font-medium ${getMutedTextColor()}`}
                        >
                          {taskFormData.type === "recipe"
                            ? "After Photo (Finished Dish)"
                            : "Location Photo"}{" "}
                          *
                        </label>
                        {afterPreview ? (
                          <div className="relative">
                            <div
                              className={`relative h-48 w-full overflow-hidden rounded-2xl border ${getBorderColor()}`}
                            >
                              <Image
                                src={afterPreview}
                                alt="After"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTaskImage("after")}
                              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed ${
                              isDarkMode
                                ? "border-white/20"
                                : "border-slate-300"
                            } ${getInputBg()} transition ${
                              accent.hoverBorder400_50
                            }`}
                          >
                            <Camera
                              className={`h-8 w-8 ${getMutedTextColor()}`}
                            />
                            <span
                              className={`mt-2 text-sm ${getMutedTextColor()}`}
                            >
                              Upload{" "}
                              {taskFormData.type === "recipe"
                                ? "after"
                                : "location"}{" "}
                              photo
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleTaskImageChange("after")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={
                          isVerifying ||
                          !afterPreview ||
                          (taskFormData.type === "recipe" && !beforePreview)
                        }
                        className={`flex items-center gap-2 rounded-full ${accent.bg500} px-6 py-2 font-semibold text-slate-950 transition ${accent.hover400} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isVerifying && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {isVerifying
                          ? "Verifying with AI..."
                          : "Submit for Verification"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTaskForm(false);
                          setBeforePreview(null);
                          setAfterPreview(null);
                        }}
                        className={`rounded-full border ${getBorderColor()} px-6 py-2 font-semibold transition ${
                          isDarkMode
                            ? "text-white hover:bg-white/10"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Tasks List */}
                {tasks.length === 0 ? (
                  <div
                    className={`rounded-3xl border ${getBorderColor()} ${getCardBg()} p-12 text-center backdrop-blur`}
                  >
                    <Camera
                      className={`mx-auto h-12 w-12 ${getMutedTextColor()}`}
                    />
                    <p className={`mt-4 ${getMutedTextColor()}`}>
                      No verification tasks yet. Start completing challenges!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className={`rounded-3xl border p-6 backdrop-blur ${
                          task.verification.verified
                            ? `${accent.border400_50} ${accent.bg500_10}`
                            : "border-red-400/50 bg-red-500/10"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {task.type === "recipe" ? (
                              <Utensils className="h-5 w-5 text-orange-400" />
                            ) : (
                              <MapPin className="h-5 w-5 text-blue-400" />
                            )}
                            <span
                              className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                            >
                              {task.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.verification.verified ? (
                              <CheckCircle
                                className={`h-5 w-5 ${accent.text400}`}
                              />
                            ) : (
                              <X className="h-5 w-5 text-red-400" />
                            )}
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="rounded-full p-1 transition hover:bg-white/10"
                            >
                              <Trash2 className="h-4 w-4 text-white/60 hover:text-red-400" />
                            </button>
                          </div>
                        </div>

                        <h3 className="mt-3 text-xl font-semibold">
                          {task.title}
                        </h3>
                        {task.location && (
                          <p className={`text-sm ${getMutedTextColor()}`}>
                            {task.location}, {task.country}
                          </p>
                        )}

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          {task.beforeImage && (
                            <div
                              className={`relative h-32 overflow-hidden rounded-xl border ${getBorderColor()}`}
                            >
                              <Image
                                src={task.beforeImage}
                                alt="Before"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
                                Before
                              </div>
                            </div>
                          )}
                          <div
                            className={`relative h-32 overflow-hidden rounded-xl border ${getBorderColor()}`}
                          >
                            <Image
                              src={task.afterImage}
                              alt="After"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
                              {task.type === "recipe" ? "After" : "Location"}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`mt-4 rounded-xl border p-3 ${
                            task.verification.verified
                              ? `${accent.border400_30} ${accent.bg500_10}`
                              : "border-red-400/30 bg-red-500/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {task.verification.verified
                                ? "✓ Verified"
                                : "✗ Not Verified"}
                            </span>
                            {task.verification.verified && (
                              <span
                                className={`text-sm font-bold ${accent.text400}`}
                              >
                                +{task.pointsEarned} pts
                              </span>
                            )}
                          </div>
                          <p className={`mt-2 text-xs ${getMutedTextColor()}`}>
                            Confidence: {task.verification.confidence}%
                          </p>
                          <p className={`mt-1 text-sm ${getMutedTextColor()}`}>
                            {task.verification.reasoning}
                          </p>
                          {task.verification.dishIdentified && (
                            <p
                              className={`mt-1 text-xs ${getMutedTextColor()}`}
                            >
                              Identified: {task.verification.dishIdentified}
                            </p>
                          )}
                          {task.verification.locationIdentified && (
                            <p
                              className={`mt-1 text-xs ${getMutedTextColor()}`}
                            >
                              Identified: {task.verification.locationIdentified}
                            </p>
                          )}
                        </div>

                        <p className={`mt-3 text-xs ${getMutedTextColor()}`}>
                          {new Date(task.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
