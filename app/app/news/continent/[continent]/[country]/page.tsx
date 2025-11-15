import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardPageLayout from "../../../../../components/DashboardPageLayout";
import NewsCard from "../../../../../components/NewsCard";
import { getContinents, getCountryData } from "../../../../../lib/news";
import { getRequestLocale } from "../../../../../lib/i18n/server";
import { createTranslator } from "../../../../../lib/i18n/translations";

type PageProps = {
  params: Promise<{
    continent: string;
    country: string;
  }>;
};

export function generateStaticParams() {
  const continents = getContinents();
  return continents.flatMap((continent) =>
    continent.countries.map((country) => ({
      continent: continent.slug,
      country: country.slug,
    }))
  );
}

export default async function CountryNewsPage({ params }: PageProps) {
  const { continent, country } = await params;
  const countryData = getCountryData(continent, country);

  if (!countryData) {
    return notFound();
  }
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={t("news.countryTitle", { country: countryData.countryName })}
      description={t("news.countryDescription", {
        country: countryData.countryName,
        storyCount: String(countryData.countryArticleCount),
        continent: countryData.continentName,
      })}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <Link
            href="/app/news"
            className="font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            {t("news.allNews")}
          </Link>
          <span>·</span>
          <Link
            href={`/app/news/continent/${countryData.continentSlug}`}
            className="font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            {countryData.continentName}
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-xs uppercase tracking-wide text-white/50">
          {t("news.countrySummary", {
            continent: countryData.continentName,
            countryTotal: String(countryData.continentCountryCount),
            articleTotal: String(countryData.continentArticleCount),
          })}
        </div>

        <div className="grid gap-6">
          {countryData.articles.map((article) => (
            <NewsCard key={article._id} article={article} locale={locale} />
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
