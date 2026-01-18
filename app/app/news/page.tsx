"use client";
import { useEffect, useState } from "react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import { useRouter } from "next/navigation";
import {
  Newspaper,
  AlertTriangle,
  Info,
  Sparkles,
  Calendar,
  RefreshCw,
  Settings,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "../../hooks/useI18n";

type NewsItem = {
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  url?: string;
};

type LawItem = {
  title: string;
  description: string;
  severity: "critical" | "important" | "good-to-know";
  comparison: string;
  officialSource?: string;
  sourceUrl?: string;
};

type NewsData = {
  location: string;
  date: string;
  culturalNews: NewsItem[];
  importantLaws: LawItem[];
  culturalTips: string[];
};

export default function NewsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  const loadNews = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setErrorDetails(null);
    setNeedsSetup(false);
    try {
      console.log("Fetching news from API...");
      const response = await fetch("/api/news");
      const data = await response.json();

      console.log("API response:", response.status, data);

      if (response.ok) {
        setNewsData(data.news);
        setLocation(data.location);
        setHomeCountry(data.homeCountry);
        setIsCached(data.cached);
      } else {
        setError(data.error || "Failed to load news");
        setErrorDetails(data.details || null);
        if (data.needsSetup) {
          setNeedsSetup(true);
        }
      }
    } catch (err) {
      console.error("News load error:", err);
      setError("Unable to connect to the news service. Please try again.");
      setErrorDetails(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-400/50 bg-red-500/10 text-red-200";
      case "important":
        return "border-yellow-400/50 bg-yellow-500/10 text-yellow-200";
      default:
        return "border-lime-400/50 bg-lime-500/10 text-lime-200";
    }
  };

  const getCategoryIcon = () => {
    return <Sparkles className="h-5 w-5" />;
  };
  return (
    <DashboardPageLayout>
      <div className="relative min-h-screen bg-neutral-950">
        {/* Hero Section */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=80"
              alt="News background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-6"
            >
              <Newspaper className="w-4 h-4 text-lime-400" />
              <span className="text-sm font-medium text-lime-400">
                {t("news.hero.badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            >
              {t("news.hero.title")}{" "}
              <span className="text-lime-400">
                {t("news.hero.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/80 max-w-2xl mx-auto mb-6"
            >
              {location
                ? t("news.hero.subtitleWithLocation", { location })
                : t("news.hero.subtitleDefault")}
            </motion.p>

            {location && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => loadNews(true)}
                disabled={isLoading || isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-lime-400 text-black rounded-xl font-semibold transition-all hover:bg-lime-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 mx-auto"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? t("news.refreshing") : t("news.refresh")}
              </motion.button>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="relative z-20 -mt-12 pb-20">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            {/* Location Info */}
            {location && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lime-400/20 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">
                        {t("news.hero.yourLocation")}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {location}
                      </p>
                      {homeCountry && (
                        <p className="text-sm text-neutral-500">
                          {t("news.hero.comparingWith", {
                            country: homeCountry,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {isCached && (
                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-400">
                      <Calendar className="h-4 w-4" />
                      {t("news.hero.updatedToday")}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[400px] items-center justify-center"
              >
                <div className="text-center bg-neutral-900 rounded-2xl p-12 border border-neutral-800">
                  <RefreshCw className="mx-auto h-12 w-12 animate-spin text-lime-400" />
                  <p className="mt-4 text-white text-lg font-semibold">
                    {t("news.loading.title")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    {t("news.loading.subtitle")}
                  </p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 rounded-2xl border border-red-500/30 p-8 shadow-xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-10 w-10 text-red-400" />
                  </div>
                  <p className="text-xl font-bold text-white mb-2">
                    {t("news.error.title")}
                  </p>
                  <p className="text-red-200">{error}</p>
                  {errorDetails && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-red-300/60 hover:text-red-300">
                        {t("news.error.showDetails")}
                      </summary>
                      <pre className="mt-2 overflow-auto rounded-xl bg-black/30 p-4 text-left text-xs text-red-200">
                        {errorDetails}
                      </pre>
                    </details>
                  )}
                  {needsSetup ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/app/profile")}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 font-semibold text-black transition hover:bg-lime-300"
                    >
                      <Settings className="h-5 w-5" />
                      {t("news.error.goToSettings")}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => loadNews(true)}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 font-semibold text-black transition hover:bg-lime-300"
                    >
                      <RefreshCw className="h-5 w-5" />
                      {t("news.error.tryAgain")}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : newsData ? (
              <>
                {/* Cultural Tips */}
                {newsData.culturalTips && newsData.culturalTips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Cultural Tips
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {newsData.culturalTips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 hover:bg-emerald-400/10 transition-colors"
                        >
                          <p className="text-sm text-neutral-200 leading-relaxed">
                            {tip}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Important Laws */}
                {newsData.importantLaws &&
                  newsData.importantLaws.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Important Laws & Differences
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {newsData.importantLaws.map((law, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -2 }}
                            className={`rounded-xl border p-6 ${getSeverityColor(
                              law.severity
                            )} transition-all`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2">
                                  {law.title}
                                </h3>
                                <p className="text-sm opacity-90 leading-relaxed">
                                  {law.description}
                                </p>
                                {law.comparison && (
                                  <div className="mt-4 rounded-lg border border-current/20 bg-black/30 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                                      Compared to {homeCountry}
                                    </p>
                                    <p className="text-sm leading-relaxed">
                                      {law.comparison}
                                    </p>
                                  </div>
                                )}
                                {law.officialSource && law.sourceUrl && (
                                  <a
                                    href={law.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                    Source: {law.officialSource}
                                  </a>
                                )}
                              </div>
                              <span className="rounded-full border border-current px-4 py-1.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                                {law.severity.replace("-", " ")}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                {/* Cultural & Entertainment News */}
                {newsData.culturalNews && newsData.culturalNews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-lime-400/20 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-lime-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Cultural & Entertainment News
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {newsData.culturalNews.map((item, index) => (
                        <motion.article
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="group rounded-xl border border-neutral-700 bg-neutral-800/30 p-6 transition-all hover:border-lime-400/30 hover:shadow-lg"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-lime-400/20 flex items-center justify-center shrink-0">
                              {getCategoryIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-lime-400">
                                  {item.category}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-neutral-600" />
                                <span className="text-xs text-neutral-500">
                                  {item.date}
                                </span>
                              </div>
                              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-lime-400 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                                {item.summary}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-neutral-500">
                                  {item.source}
                                </span>
                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-lime-400 hover:text-lime-300 transition-colors"
                                  >
                                    Read more
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 rounded-2xl border border-neutral-800 p-12 text-center shadow-xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-6">
                  <Info className="h-12 w-12 text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Location Set
                </h3>
                <p className="text-neutral-400 mb-6">
                  Set your location in your profile to see personalized news
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/app/profile")}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 font-semibold text-black transition hover:bg-lime-300"
                >
                  <Settings className="h-5 w-5" />
                  Go to Profile
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </DashboardPageLayout>
  );
}
