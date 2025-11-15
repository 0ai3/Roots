"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, AlertTriangle, Info, Sparkles, Calendar, RefreshCw, Settings } from "lucide-react";

type NewsItem = {
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
};

type LawItem = {
  title: string;
  description: string;
  severity: "critical" | "important" | "good-to-know";
  comparison: string;
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
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  const loadNews = async () => {
    setIsLoading(true);
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
        return "border-blue-400/50 bg-blue-500/10 text-blue-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Sparkles className="h-5 w-5" />;
  };
  return (
    <DashboardPageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Cultural News & Local Laws</h1>
            <p className="mt-2 text-white/70">
              Stay informed about {location || "your destination"}
            </p>
          </div>
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Location Info */}
        {location && !error && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Your Location</p>
                <p className="text-2xl font-bold text-white">{location}</p>
                {homeCountry && (
                  <p className="text-sm text-white/70">Comparing laws with {homeCountry}</p>
                )}
              </div>
              {isCached && (
                <div className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/60">
                  <Calendar className="h-4 w-4" />
                  Updated today
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-12 w-12 animate-spin text-emerald-400" />
              <p className="mt-4 text-white/60">Loading latest news and local laws...</p>
              <p className="mt-2 text-xs text-white/40">This may take a few moments...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/50 bg-red-500/10 p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
              <p className="mt-4 text-lg text-red-200">{error}</p>
              {errorDetails && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-red-300/60 hover:text-red-300">
                    Show technical details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-xl bg-black/30 p-4 text-left text-xs text-red-200">
                    {errorDetails}
                  </pre>
                </details>
              )}
              {needsSetup ? (
                <button
                  onClick={() => router.push("/app/profile")}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <Settings className="h-5 w-5" />
                  Go to Profile Settings
                </button>
              ) : (
                <button
                  onClick={loadNews}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
              )}
            </div>
          </div>
        ) : newsData ? (
          <>
            {/* Cultural Tips */}
            {newsData.culturalTips && newsData.culturalTips.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                  Cultural Tips
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {newsData.culturalTips.map((tip, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-4"
                    >
                      <p className="text-sm text-white/80">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Laws */}
            {newsData.importantLaws && newsData.importantLaws.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  Important Laws & Differences
                </h2>
                <div className="space-y-4">
                  {newsData.importantLaws.map((law, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl border p-5 ${getSeverityColor(law.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{law.title}</h3>
                          <p className="mt-2 text-sm opacity-90">{law.description}</p>
                          {law.comparison && (
                            <div className="mt-3 rounded-xl border border-current/20 bg-black/20 p-3">
                              <p className="text-xs uppercase tracking-wide opacity-60">
                                Compared to {homeCountry}
                              </p>
                              <p className="mt-1 text-sm">{law.comparison}</p>
                            </div>
                          )}
                        </div>
                        <span className="rounded-full border border-current px-3 py-1 text-xs uppercase tracking-wide">
                          {law.severity.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural & Entertainment News */}
            {newsData.culturalNews && newsData.culturalNews.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                  <Newspaper className="h-6 w-6 text-blue-400" />
                  Cultural & Entertainment News
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {newsData.culturalNews.map((item, index) => (
                    <article
                      key={index}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition hover:bg-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs uppercase tracking-wide text-white/40">
                            {item.category}
                          </span>
                          <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                          <p className="mt-2 text-sm text-white/70">{item.summary}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                            <span>{item.source}</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <Info className="mx-auto h-12 w-12 text-white/40" />
            <p className="mt-4 text-white/60">
              Set your location in your profile to see personalized news
            </p>
            <button
              onClick={() => router.push("/app/profile")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Settings className="h-5 w-5" />
              Go to Profile
            </button>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
