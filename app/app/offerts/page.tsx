"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import { Ticket, Clock, Sparkles, Gift, Coffee, Utensils, Building2, Loader2, CheckCircle, X, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "museum" | "coffee" | "food">("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        const dark = saved === "dark";
        setIsDarkMode(dark);
        if (dark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

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
      
      redeemedCoupons.forEach(coupon => {
        const expiresAt = new Date(coupon.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        newTimeRemaining[coupon._id] = remaining;
      });

      setTimeRemaining(newTimeRemaining);

      // Reload if any coupon expired
      const hasExpired = Object.values(newTimeRemaining).some(t => t === 0);
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const filteredCoupons = coupons.filter(c => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (showActiveOnly && c.usesRemaining === 0) return false;
    return true;
  });

  const activeCoupons = redeemedCoupons.filter(c => 
    timeRemaining[c._id] && timeRemaining[c._id] > 0
  );

  return (
    <DashboardPageLayout isDarkMode={isDarkMode}>
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <motion.button
            type="button"
            onClick={() => {
              const next = !isDarkMode;
              setIsDarkMode(next);
              try {
                if (next) document.documentElement.classList.add("dark");
                else document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", next ? "dark" : "light");
              } catch (e) {
                // noop
              }
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              isDarkMode
                ? "bg-neutral-800/60 text-white border border-neutral-700"
                : "bg-white/90 text-neutral-900 border border-neutral-200"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </motion.button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              Coupon Marketplace
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-white/70" : "text-neutral-600"}`}>
              Redeem exclusive discounts with your points
            </p>
          </div>
          <div className={`flex items-center gap-3 rounded-full border px-6 py-3 backdrop-blur ${
            isDarkMode 
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30" 
              : "bg-white border-emerald-200 shadow-sm"
          }`}>
            <Sparkles className={`h-6 w-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
            <div>
              <p className={`text-xs uppercase tracking-wide ${isDarkMode ? "text-white/60" : "text-neutral-500"}`}>
                Your Points
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                {userPoints}
              </p>
            </div>
          </div>
        </div>

        {/* Active Redeemed Coupons */}
        {activeCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
              <CheckCircle className={`h-6 w-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
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
                        ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                        : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-3 border ${
                          isDarkMode 
                            ? "bg-emerald-400/20 border-emerald-400/30" 
                            : "bg-emerald-100 border-emerald-300"
                        }`}>
                          <Icon className={`h-6 w-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                            {coupon.couponTitle}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                            {coupon.couponDiscount} off
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1 border ${
                        isExpiring 
                          ? isDarkMode ? "bg-red-500/20 border-red-400/30" : "bg-red-50 border-red-300"
                          : isDarkMode ? "bg-white/10 border-white/20" : "bg-white border-neutral-200"
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          isExpiring 
                            ? "text-red-400" 
                            : isDarkMode ? "text-white/70" : "text-neutral-600"
                        }`} />
                        <span className={`text-sm font-mono ${
                          isExpiring 
                            ? "text-red-400" 
                            : isDarkMode ? "text-white/70" : "text-neutral-600"
                        }`}>
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
                      <div className="flex items-center justify-center gap-[2px] py-4">
                        {coupon.barcode.split('').map((digit, i) => (
                          <div
                            key={i}
                            className="h-16 bg-slate-900"
                            style={{ width: i % 2 === 0 ? '3px' : '2px' }}
                          />
                        ))}
                      </div>
                      <p className="text-center text-sm font-mono text-slate-600">{coupon.barcode}</p>
                    </div>

                    <p className={`mt-3 text-xs text-center ${isDarkMode ? "text-white/50" : "text-neutral-500"}`}>
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
            {(["all", "museum", "coffee", "food"] as const).map((category) => (
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
                      : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
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
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {showActiveOnly ? "Available Only" : "Show All"}
          </button>
        </div>

        {/* Coupon Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`h-8 w-8 animate-spin ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center backdrop-blur ${
            isDarkMode 
              ? "border-white/10 bg-white/5" 
              : "border-neutral-200 bg-white shadow-sm"
          }`}>
            <Ticket className={`mx-auto h-12 w-12 ${isDarkMode ? "text-white/40" : "text-neutral-400"}`} />
            <p className={`mt-4 ${isDarkMode ? "text-white/60" : "text-neutral-600"}`}>
              No coupons available with current filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((coupon) => {
              const Icon = getCategoryIcon(coupon.category);
              const percentRemaining = (coupon.usesRemaining / coupon.totalUses) * 100;
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
                        : "border-neutral-200 bg-white hover:border-emerald-300 shadow-sm hover:shadow-md"
                      : isDarkMode
                        ? "border-white/5 bg-white/[0.02] opacity-60"
                        : "border-neutral-100 bg-neutral-50 opacity-60"
                  }`}
                >
                  {/* Icon Badge */}
                  <div className={`absolute right-4 top-4 text-4xl transition-opacity ${
                    isDarkMode ? "opacity-20 group-hover:opacity-30" : "opacity-10 group-hover:opacity-20"
                  }`}>
                    {coupon.icon}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`rounded-xl p-3 border ${
                        coupon.category === "museum" 
                          ? isDarkMode ? "bg-blue-500/20 border-blue-400/30" : "bg-blue-50 border-blue-200"
                          : coupon.category === "coffee" 
                            ? isDarkMode ? "bg-orange-500/20 border-orange-400/30" : "bg-orange-50 border-orange-200"
                            : isDarkMode ? "bg-pink-500/20 border-pink-400/30" : "bg-pink-50 border-pink-200"
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          coupon.category === "museum" 
                            ? isDarkMode ? "text-blue-400" : "text-blue-600"
                            : coupon.category === "coffee" 
                              ? isDarkMode ? "text-orange-400" : "text-orange-600"
                              : isDarkMode ? "text-pink-400" : "text-pink-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold leading-tight ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                          {coupon.title}
                        </h3>
                        <p className={`mt-1 text-sm ${isDarkMode ? "text-white/60" : "text-neutral-600"}`}>
                          {coupon.description}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={isDarkMode ? "text-white/60" : "text-neutral-600"}>Availability</span>
                        <span className={`font-semibold ${
                          isLowStock 
                            ? "text-red-400" 
                            : isDarkMode ? "text-white/70" : "text-neutral-700"
                        }`}>
                          {coupon.usesRemaining}/{coupon.totalUses}
                        </span>
                      </div>
                      <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? "bg-white/10" : "bg-neutral-200"}`}>
                        <div
                          className={`h-full transition-all ${
                            isLowStock ? "bg-red-400" : isDarkMode ? "bg-emerald-400" : "bg-emerald-600"
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
                        <span className={`text-2xl font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                          {coupon.pointsCost}
                        </span>
                        <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-neutral-600"}`}>points</span>
                      </div>
                      <button
                        onClick={() => handleRedeem(coupon._id, coupon.pointsCost)}
                        disabled={!canAfford || isRedeeming === coupon._id || coupon.usesRemaining === 0}
                        className={`rounded-full px-6 py-2 font-semibold transition-all ${
                          canAfford && coupon.usesRemaining > 0
                            ? isDarkMode
                              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                            : isDarkMode
                              ? "bg-white/10 text-white/40 cursor-not-allowed"
                              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
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

                    <p className={`mt-3 text-xs ${isDarkMode ? "text-white/40" : "text-neutral-500"}`}>
                      Valid until {new Date(coupon.validUntil).toLocaleDateString()}
                    </p>
                  </div>

                  {coupon.usesRemaining === 0 && (
                    <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm ${
                      isDarkMode ? "bg-slate-950/80" : "bg-white/90"
                    }`}>
                      <div className={`rounded-full border px-6 py-3 ${
                        isDarkMode 
                          ? "bg-red-500/20 border-red-400/50" 
                          : "bg-red-50 border-red-300"
                      }`}>
                        <p className={`font-bold flex items-center gap-2 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}>
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
    </DashboardPageLayout>
  );
}
