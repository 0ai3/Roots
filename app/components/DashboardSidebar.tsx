"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setStoredUserId, clearCachedUserId } from "../lib/userId";
import { useI18n } from "../../app/hooks/useI18n";
import {
  Home,
  User,
  Map,
  Gamepad2,
  Utensils,
  Gift,
  Newspaper,
  Landmark,
  Trophy,
  LogOut,
  BookOpen,
  MessageCircle,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";

const mainNavLinks = [
  { label: "nav.dashboard", href: "/app/dashboard", icon: Home },
  { label: "nav.chat", href: "/app/chat", icon: MessageCircle },
  { label: "nav.map", href: "/app/map", icon: Map },
  { label: "nav.games", href: "/app/games", icon: Gamepad2 },
  { label: "nav.recipes", href: "/app/recipes", icon: Utensils },
  { label: "nav.news", href: "/app/news", icon: Newspaper },
  { label: "nav.attractions", href: "/app/attractions", icon: Landmark },
];

const profileDropdownLinks = [
  { label: "nav.logs", href: "/app/logs", icon: BookOpen },
  { label: "nav.leaderboard", href: "/app/leaderboard", icon: Trophy },
  { label: "nav.offers", href: "/app/offerts", icon: Gift },
];

interface ProfileData {
  name?: string;
  email?: string;
  location?: string;
  homeCountry?: string;
  favoriteMuseums?: string;
  favoriteRecipes?: string;
  bio?: string;
  socialHandle?: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t } = useI18n();

  const [isDarkLocal, setIsDarkLocal] = useState<boolean>(false);
  const [location, setLocation] = useState("");
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [hasLocation, setHasLocation] = useState(true);
  const profileDataRef = useRef<ProfileData | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load location from profile
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          const profile: ProfileData = data.profile || {};
          profileDataRef.current = profile;
          const loc = profile.location || "";
          setLocation(loc);
          setHasLocation(loc.trim().length > 0);
        }
      } catch (error) {
        console.error("Error loading location:", error);
      }
    };
    loadLocation();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = scrollPosition > 50;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setIsDarkLocal(saved === "dark");
      } else {
        setIsDarkLocal(document.documentElement.classList.contains("dark"));
      }
    } catch (_e) {
      // ignore
    }

    const handleThemeChange = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail && typeof detail.isDark === "boolean") {
          setIsDarkLocal(detail.isDark);
          return;
        }
      } catch {
        console.error("Failed to update theme");
      }
      try {
        const saved = localStorage.getItem("theme");
        setIsDarkLocal(saved === "dark");
      } catch {
        console.error("Failed to update theme");
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "theme") setIsDarkLocal(e.newValue === "dark");
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Auto-save location after user stops typing
  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip if location hasn't been loaded yet from initial fetch
    if (profileDataRef.current === null) {
      return;
    }

    // Update hasLocation state based on location input
    setHasLocation(location.trim().length > 0);
  }, [location]);

  // Manual save location function
  const handleSaveLocation = async () => {
    const profileData = profileDataRef.current;
    if (!profileData) {
      return;
    }

    const currentSavedLocation = profileData.location || "";
    if (location.trim() === currentSavedLocation.trim()) {
      console.log("Location unchanged, skipping save");
      return;
    }

    // Don't save if we don't have required profile data yet
    if (!profileData.name || !profileData.email) {
      console.log("Skipping location save - profile data not loaded yet");
      return;
    }

    console.log("Saving location:", location.trim());
    setIsSavingLocation(true);
    
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          location: location.trim(),
          homeCountry: profileData.homeCountry || "",
          favoriteMuseums: profileData.favoriteMuseums || "",
          favoriteRecipes: profileData.favoriteRecipes || "",
          bio: profileData.bio || "",
          socialHandle: profileData.socialHandle || "",
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        profileDataRef.current = data.profile;
        setHasLocation(location.trim().length > 0);
        console.log("✅ Location saved successfully:", location.trim());
      } else {
        console.error("Failed to save location:", response.status);
      }
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearCachedUserId();
      setStoredUserId(null);
      router.push("/");
    } catch {
      console.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDarkLocal
            ? "bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-800"
            : "bg-white/90 backdrop-blur-lg border-b border-neutral-200 shadow-sm"
          : isDarkLocal
          ? "bg-neutral-950/50 backdrop-blur-sm border-b border-neutral-800/50"
          : "bg-white/50 backdrop-blur-sm border-b border-neutral-200/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkLocal ? "bg-lime-400" : "bg-emerald-600"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isDarkLocal ? "text-neutral-950" : "text-white"}
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
            <Link
              href="/app/dashboard"
              className={`text-xl font-semibold ${
                isDarkLocal ? "text-white" : "text-neutral-900"
              }`}
            >
              Roots
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Location Input with Save Icon */}
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLocation();
                  }
                }}
                placeholder={!hasLocation ? "⚠️ Set your location" : "Current location..."}
                className={`w-52 px-3 py-2 pr-10 text-sm rounded-full border transition-all focus:outline-none focus:ring-2 ${
                  !hasLocation
                    ? isDarkLocal
                      ? "bg-red-900/20 border-red-500/50 text-red-200 placeholder:text-red-300 focus:ring-red-400/30 focus:border-red-400 animate-pulse"
                      : "bg-red-50 border-red-400/50 text-red-900 placeholder:text-red-600 focus:ring-red-500/30 focus:border-red-500 animate-pulse"
                    : isDarkLocal
                    ? "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:ring-lime-400/30 focus:border-lime-400"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:ring-emerald-500/30 focus:border-emerald-500"
                }`}
              />
              <button
                onClick={handleSaveLocation}
                disabled={isSavingLocation}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all hover:bg-opacity-80 disabled:opacity-50 ${
                  isDarkLocal
                    ? "text-lime-400 hover:bg-lime-400/10"
                    : "text-emerald-600 hover:bg-emerald-600/10"
                }`}
                title="Save location"
              >
                {isSavingLocation ? (
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    isDarkLocal ? "border-lime-400" : "border-emerald-600"
                  }`} />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>

            {mainNavLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? isDarkLocal
                        ? "text-lime-400"
                        : "text-emerald-600"
                      : isDarkLocal
                      ? "text-neutral-300 hover:text-lime-400"
                      : "text-neutral-700 hover:text-emerald-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.label)}
                </Link>
              );
            })}

            {/* Profile Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/app/profile" || pathname === "/app/logs" || pathname === "/app/leaderboard" || pathname === "/app/offerts"
                    ? isDarkLocal
                      ? "text-lime-400 bg-lime-400/10"
                      : "text-emerald-600 bg-emerald-50"
                    : isDarkLocal
                    ? "text-neutral-300 hover:text-lime-400 hover:bg-neutral-800"
                    : "text-neutral-700 hover:text-emerald-600 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  isDarkLocal
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="py-2">
                  {/* Profile Link */}
                  <Link
                    href="/app/profile"
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      pathname === "/app/profile"
                        ? isDarkLocal
                          ? "text-lime-400 bg-lime-400/10"
                          : "text-emerald-600 bg-emerald-50"
                        : isDarkLocal
                        ? "text-neutral-300 hover:bg-neutral-800"
                        : "text-neutral-700 hover:bg-slate-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {t("nav.profile")}
                  </Link>

                  {/* Logs and other dropdown links */}
                  {profileDropdownLinks.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      pathname?.startsWith(`${link.href}/`);
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? isDarkLocal
                              ? "text-lime-400 bg-lime-400/10"
                              : "text-emerald-600 bg-emerald-50"
                            : isDarkLocal
                            ? "text-neutral-300 hover:bg-neutral-800"
                            : "text-neutral-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t(link.label)}
                      </Link>
                    );
                  })}

                  {/* Divider */}
                  <div className={`my-2 border-t ${
                    isDarkLocal ? "border-neutral-800" : "border-neutral-200"
                  }`} />

                  {/* Logout Button in Dropdown */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isDarkLocal
                        ? "text-red-400 hover:bg-red-400/10"
                        : "text-red-600 hover:bg-red-50"
                    } disabled:opacity-50`}
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut
                      ? t("dashboard.sidebar.signingOut")
                      : t("dashboard.sidebar.logout")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 ${
              isDarkLocal ? "text-white" : "text-neutral-900"
            }`}
          >
            {isMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:hidden py-4 border-t ${
              isDarkLocal ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            {/* Mobile Location Input */}
            <div className="px-4 mb-4">
              <label className={`text-xs font-medium mb-2 block ${
                !hasLocation
                  ? isDarkLocal ? "text-red-400" : "text-red-600"
                  : isDarkLocal ? "text-neutral-400" : "text-neutral-600"
              }`}>
                {!hasLocation ? "⚠️ Current Location (Required)" : "Current Location"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={!hasLocation ? "⚠️ Please set your location" : "Enter your location..."}
                  className={`w-full px-3 py-2 pr-10 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    !hasLocation
                      ? isDarkLocal
                        ? "bg-red-900/20 border-red-500/50 text-red-200 placeholder:text-red-300 focus:ring-red-400/30 focus:border-red-400 animate-pulse"
                        : "bg-red-50 border-red-400/50 text-red-900 placeholder:text-red-600 focus:ring-red-500/30 focus:border-red-500 animate-pulse"
                      : isDarkLocal
                      ? "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:ring-lime-400/30 focus:border-lime-400"
                      : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:ring-emerald-500/30 focus:border-emerald-500"
                  }`}
                />
                {isSavingLocation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      isDarkLocal ? "border-lime-400" : "border-emerald-600"
                    }`} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {/* All Main Nav Links */}
              {mainNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname?.startsWith(`${link.href}/`);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? isDarkLocal
                          ? "text-lime-400 bg-lime-400/10"
                          : "text-emerald-600 bg-emerald-50"
                        : isDarkLocal
                        ? "text-neutral-300 hover:bg-neutral-800"
                        : "text-neutral-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {t(link.label)}
                  </Link>
                );
              })}

              {/* Profile Section */}
              <div className={`my-2 pt-2 border-t ${
                isDarkLocal ? "border-neutral-800" : "border-neutral-200"
              }`}>
                <Link
                  href="/app/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    pathname === "/app/profile"
                      ? isDarkLocal
                        ? "text-lime-400 bg-lime-400/10"
                        : "text-emerald-600 bg-emerald-50"
                      : isDarkLocal
                      ? "text-neutral-300 hover:bg-neutral-800"
                      : "text-neutral-700 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {t("nav.profile")}
                </Link>

                {/* Profile Dropdown Links */}
                {profileDropdownLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname?.startsWith(`${link.href}/`);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        isActive
                          ? isDarkLocal
                            ? "text-lime-400 bg-lime-400/10"
                            : "text-emerald-600 bg-emerald-50"
                          : isDarkLocal
                          ? "text-neutral-300 hover:bg-neutral-800"
                          : "text-neutral-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {t(link.label)}
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors ${
                isDarkLocal
                  ? "bg-lime-400 text-neutral-950"
                  : "bg-emerald-600 text-white"
              } disabled:opacity-50`}
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut
                ? t("dashboard.sidebar.signingOut")
                : t("dashboard.sidebar.logout")}
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
