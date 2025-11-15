"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";
import { useTheme } from "../../components/ThemeProvider";
import {
  Ticket,
  Clock,
  Sparkles,
  Gift,
  Coffee,
  Utensils,
  Building2,
  Loader2,
  CheckCircle,
  X,
  Sun,
  Moon,
  ArrowRight,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type Coupon = {
  _id: string;
  title: string;
  description: string;
  category: "museum" | "coffee" | "food";
  discount: string;
  pointsCost: number;
  totalUses: number;
  usesRemaining: number;
  validUntil: string;
  icon: string;
};

type RedeemedCoupon = {
  _id: string;
  couponId: string;
  couponTitle: string;
  couponDiscount: string;
  couponCategory: string;
  barcode: string;
  redeemedAt: string;
  expiresAt: string;
};

export default function OffertsPage() {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBrowse, setShowBrowse] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "museum" | "coffee" | "food"
  >("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>(
    {}
  );

  // Theme management
  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  // Color utility functions
  const getBgColor = () => {
    return isDarkMode ? "bg-black" : "bg-white";
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

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();
      if (response.ok) {
        setCoupons(data.coupons || []);
        setRedeemedCoupons(data.redeemedCoupons || []);
        setUserPoints(data.userPoints || 0);
      }
    } catch (error) {
      console.error("Failed to load coupons", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Update timer every second for active coupons
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: number } = {};

      redeemedCoupons.forEach((coupon) => {
        const expiresAt = new Date(coupon.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        newTimeRemaining[coupon._id] = remaining;
      });

      setTimeRemaining(newTimeRemaining);

      // Reload if any coupon expired
      const hasExpired = Object.values(newTimeRemaining).some((t) => t === 0);
      if (hasExpired) {
        loadCoupons();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [redeemedCoupons]);

  const handleRedeem = async (couponId: string, pointsCost: number) => {
    if (userPoints < pointsCost) {
      alert("Not enough points to redeem this coupon!");
      return;
    }

    setIsRedeeming(couponId);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Coupon redeemed successfully! Check your active coupons below.");
        loadCoupons();
      } else {
        alert(data.error || "Failed to redeem coupon");
      }
    } catch (error) {
      console.error("Redemption error", error);
      alert("Failed to redeem coupon. Please try again.");
    } finally {
      setIsRedeeming(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "museum":
        return Building2;
      case "coffee":
        return Coffee;
      case "food":
        return Utensils;
      default:
        return Gift;
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (showActiveOnly && c.usesRemaining === 0) return false;
    return true;
  });

  const activeCoupons = redeemedCoupons.filter(
    (c) => timeRemaining[c._id] && timeRemaining[c._id] > 0
  );

  return (
    <DashboardPageLayout isDarkMode={isDarkMode}>
      <PageThemeToggle />
      {showBrowse ? (
        <div className={`min-h-screen ${getBgColor()}`}>
          {/* Hero Section */}
          <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"
                alt="Exclusive offers"
                fill
                className="object-cover"
                priority
              />
              <div
                className={`absolute inset-0 ${
                  isDarkMode
                    ? "bg-linear-to-br from-black/80 via-black/70 to-black/80"
                    : "bg-linear-to-br from-black/60 via-black/50 to-black/60"
                }`}
              />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span className="text-sm font-medium">Exclusive Rewards</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Special{" "}
                <span
                  className={isDarkMode ? "text-lime-400" : "text-lime-300"}
                >
                  Offers
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
              >
                Redeem your points for exclusive discounts on museums,
                restaurants, and cafes
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
                      : "bg-lime-500 text-white hover:bg-lime-600"
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  Browse Offers
                  <ArrowRight className="w-5 h-5" />
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
                    icon: Tag,
                    label: "Active Offers",
                    value: coupons.length,
                    color: "lime",
                    desc: "Available deals",
                  },
                  {
                    icon: Users,
                    label: "Redeemed",
                    value: redeemedCoupons.length,
                    color: "emerald",
                    desc: "By community",
                  },
                  {
                    icon: Sparkles,
                    label: "Your Points",
                    value: userPoints,
                    color: "yellow",
                    desc: "Ready to spend",
                  },
                  {
                    icon: TrendingUp,
                    label: "Best Value",
                    value: "50%",
                    color: "blue",
                    desc: "Maximum discount",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`rounded-2xl p-6 backdrop-blur-sm border ${
                      isDarkMode
                        ? "bg-neutral-900/90 border-white/10"
                        : "bg-white border-neutral-200 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          stat.color === "lime"
                            ? isDarkMode
                              ? "bg-lime-400/20"
                              : "bg-lime-100"
                            : stat.color === "emerald"
                            ? isDarkMode
                              ? "bg-emerald-400/20"
                              : "bg-emerald-100"
                            : stat.color === "yellow"
                            ? isDarkMode
                              ? "bg-yellow-400/20"
                              : "bg-yellow-100"
                            : isDarkMode
                            ? "bg-blue-400/20"
                            : "bg-blue-100"
                        }`}
                      >
                        <stat.icon
                          className={`w-6 h-6 ${
                            stat.color === "lime"
                              ? isDarkMode
                                ? "text-lime-400"
                                : "text-lime-600"
                              : stat.color === "emerald"
                              ? isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600"
                              : stat.color === "yellow"
                              ? isDarkMode
                                ? "text-yellow-400"
                                : "text-yellow-600"
                              : isDarkMode
                              ? "text-blue-400"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${
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
          </div>
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Coupon Marketplace</h1>
                <p className={`mt-2 ${getMutedTextColor()}`}>
                  Redeem exclusive discounts with your points
                </p>
              </div>
              <div
                className={`flex items-center gap-3 rounded-full border px-6 py-3 backdrop-blur ${
                  isDarkMode
                    ? "bg-linear-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30"
                    : "bg-white border-emerald-200 shadow-sm"
                }`}
              >
                <Sparkles
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-xs uppercase tracking-wide ${getMutedTextColor()}`}
                  >
                    Your Points
                  </p>
                  <p className="text-2xl font-bold">{userPoints}</p>
                </div>
              </div>
            </div>

            {/* Active Redeemed Coupons */}
            {activeCoupons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle
                    className={`h-6 w-6 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  Active Coupons
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeCoupons.map((coupon) => {
                    const Icon = getCategoryIcon(coupon.couponCategory);
                    const remaining = timeRemaining[coupon._id] || 0;
                    const isExpiring = remaining < 60;

                    return (
                      <motion.div
                        key={coupon._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur ${
                          isDarkMode
                            ? "border-emerald-400/50 bg-linear-to-br from-emerald-500/20 to-teal-500/20"
                            : "border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50 shadow-lg"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl p-3 border ${
                                isDarkMode
                                  ? "bg-emerald-400/20 border-emerald-400/30"
                                  : "bg-emerald-100 border-emerald-300"
                              }`}
                            >
                              <Icon
                                className={`h-6 w-6 ${
                                  isDarkMode
                                    ? "text-emerald-400"
                                    : "text-emerald-700"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {coupon.couponTitle}
                              </h3>
                              <p
                                className={`text-sm ${
                                  isDarkMode
                                    ? "text-emerald-400"
                                    : "text-emerald-700"
                                }`}
                              >
                                {coupon.couponDiscount} off
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-2 rounded-full px-3 py-1 border ${
                              isExpiring
                                ? isDarkMode
                                  ? "bg-red-500/20 border-red-400/30"
                                  : "bg-red-50 border-red-300"
                                : isDarkMode
                                ? "bg-white/10 border-white/20"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <Clock
                              className={`h-4 w-4 ${
                                isExpiring
                                  ? "text-red-400"
                                  : isDarkMode
                                  ? "text-white/70"
                                  : "text-slate-600"
                              }`}
                            />
                            <span
                              className={`text-sm font-mono ${
                                isExpiring
                                  ? "text-red-400"
                                  : isDarkMode
                                  ? "text-white/70"
                                  : "text-slate-600"
                              }`}
                            >
                              {formatTime(remaining)}
                            </span>
                          </div>
                        </div>

                        {/* Barcode */}
                        <div className="rounded-xl bg-white p-4 shadow-inner">
                          <div className="mb-2 text-center">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                              Scan at checkout
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-0.5 py-4">
                            {coupon.barcode.split("").map((digit, i) => (
                              <div
                                key={i}
                                className="h-16 bg-slate-900"
                                style={{ width: i % 2 === 0 ? "3px" : "2px" }}
                              />
                            ))}
                          </div>
                          <p className="text-center text-sm font-mono text-slate-600">
                            {coupon.barcode}
                          </p>
                        </div>

                        <p
                          className={`mt-3 text-xs text-center ${getMutedTextColor()}`}
                        >
                          Valid for {formatTime(remaining)} • Use before expiry
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2">
                {(["all", "museum", "coffee", "food"] as const).map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                        filterCategory === category
                          ? isDarkMode
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-emerald-600 text-white"
                          : isDarkMode
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {category === "all"
                        ? "All"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  showActiveOnly
                    ? isDarkMode
                      ? "bg-teal-500 text-slate-950"
                      : "bg-teal-600 text-white"
                    : isDarkMode
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {showActiveOnly ? "Available Only" : "Show All"}
              </button>
            </div>

            {/* Coupon Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  className={`h-8 w-8 animate-spin ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div
                className={`rounded-2xl border p-12 text-center backdrop-blur ${getBorderColor()} ${getCardBg()}`}
              >
                <Ticket
                  className={`mx-auto h-12 w-12 ${getMutedTextColor()}`}
                />
                <p className={`mt-4 ${getMutedTextColor()}`}>
                  No coupons available with current filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCoupons.map((coupon) => {
                  const Icon = getCategoryIcon(coupon.category);
                  const percentRemaining =
                    (coupon.usesRemaining / coupon.totalUses) * 100;
                  const isLowStock = percentRemaining < 20;
                  const canAfford = userPoints >= coupon.pointsCost;

                  return (
                    <motion.div
                      key={coupon._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className={`group relative overflow-hidden rounded-2xl border backdrop-blur transition-all ${
                        canAfford
                          ? isDarkMode
                            ? "border-white/10 bg-white/5 hover:border-emerald-400/50"
                            : "border-slate-200 bg-white hover:border-emerald-300 shadow-sm hover:shadow-md"
                          : isDarkMode
                          ? "border-white/5 bg-white/200 opacity-60"
                          : "border-slate-100 bg-slate-50 opacity-60"
                      }`}
                    >
                      {/* Icon Badge */}
                      <div
                        className={`absolute right-4 top-4 text-4xl transition-opacity ${
                          isDarkMode
                            ? "opacity-20 group-hover:opacity-30"
                            : "opacity-10 group-hover:opacity-20"
                        }`}
                      >
                        {coupon.icon}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className={`rounded-xl p-3 border ${
                              coupon.category === "museum"
                                ? isDarkMode
                                  ? "bg-blue-500/20 border-blue-400/30"
                                  : "bg-blue-50 border-blue-200"
                                : coupon.category === "coffee"
                                ? isDarkMode
                                  ? "bg-orange-500/20 border-orange-400/30"
                                  : "bg-orange-50 border-orange-200"
                                : isDarkMode
                                ? "bg-pink-500/20 border-pink-400/30"
                                : "bg-pink-50 border-pink-200"
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 ${
                                coupon.category === "museum"
                                  ? isDarkMode
                                    ? "text-blue-400"
                                    : "text-blue-600"
                                  : coupon.category === "coffee"
                                  ? isDarkMode
                                    ? "text-orange-400"
                                    : "text-orange-600"
                                  : isDarkMode
                                  ? "text-pink-400"
                                  : "text-pink-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold leading-tight">
                              {coupon.title}
                            </h3>
                            <p
                              className={`mt-1 text-sm ${getMutedTextColor()}`}
                            >
                              {coupon.description}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className={getMutedTextColor()}>
                              Availability
                            </span>
                            <span
                              className={`font-semibold ${
                                isLowStock
                                  ? "text-red-400"
                                  : getMutedTextColor()
                              }`}
                            >
                              {coupon.usesRemaining}/{coupon.totalUses}
                            </span>
                          </div>
                          <div
                            className={`h-2 overflow-hidden rounded-full ${
                              isDarkMode ? "bg-white/10" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`h-full transition-all ${
                                isLowStock
                                  ? "bg-red-400"
                                  : isDarkMode
                                  ? "bg-emerald-400"
                                  : "bg-emerald-600"
                              }`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                          {isLowStock && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Almost gone!
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-2xl font-bold ${
                                isDarkMode
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }`}
                            >
                              {coupon.pointsCost}
                            </span>
                            <span className={`text-sm ${getMutedTextColor()}`}>
                              points
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleRedeem(coupon._id, coupon.pointsCost)
                            }
                            disabled={
                              !canAfford ||
                              isRedeeming === coupon._id ||
                              coupon.usesRemaining === 0
                            }
                            className={`rounded-full px-6 py-2 font-semibold transition-all ${
                              canAfford && coupon.usesRemaining > 0
                                ? isDarkMode
                                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                                : isDarkMode
                                ? "bg-white/10 text-white/40 cursor-not-allowed"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isRedeeming === coupon._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : coupon.usesRemaining === 0 ? (
                              "Sold Out"
                            ) : !canAfford ? (
                              "Need More Points"
                            ) : (
                              "Redeem"
                            )}
                          </button>
                        </div>

                        <p className={`mt-3 text-xs ${getMutedTextColor()}`}>
                          Valid until{" "}
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </p>
                      </div>

                      {coupon.usesRemaining === 0 && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm ${
                            isDarkMode ? "bg-slate-950/80" : "bg-white/90"
                          }`}
                        >
                          <div
                            className={`rounded-full border px-6 py-3 ${
                              isDarkMode
                                ? "bg-red-500/20 border-red-400/50"
                                : "bg-red-50 border-red-300"
                            }`}
                          >
                            <p
                              className={`font-bold flex items-center gap-2 ${
                                isDarkMode ? "text-red-400" : "text-red-600"
                              }`}
                            >
                              <X className="h-5 w-5" />
                              Sold Out
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
