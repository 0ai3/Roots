import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardPageLayout from "../../../../components/DashboardPageLayout";
import NewsCard from "../../../../components/NewsCard";
import { getContinentData, getContinents } from "../../../../lib/news";
import { getRequestLocale } from "../../../../lib/i18n/server";
import { createTranslator } from "../../../../lib/i18n/translations";

type PageProps = {
  params: Promise<{
    continent: string;
  }>;
};

export function generateStaticParams() {
  return getContinents().map((continent) => ({ continent: continent.slug }));
}

export default async function ContinentNewsPage({ params }: PageProps) {
  const { continent: continentParam } = await params;
  const continent = getContinentData(continentParam);

  if (!continent) {
    return notFound();
  }
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={t("news.continentTitle", { continent: continent.name })}
      description={t("news.continentDescription", {
        storyCount: String(continent.count),
        countryCount: String(continent.countries.length),
      })}
    >
      <div className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            {t("news.countriesLabel")}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {continent.countries.map((country) => (
              <Link
                key={country.slug}
                href={`/app/news/continent/${continent.slug}/${country.slug}`}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-emerald-300 hover:text-emerald-200"
              >
                {country.name} ({country.count})
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {t("news.headlines")}
            </h2>
            <Link
              href="/app/news"
              className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              {t("news.backToNews")}
            </Link>
          </div>
          <div className="grid gap-6">
            {continent.articles.map((article) => (
              <NewsCard key={article._id} article={article} locale={locale} />
            ))}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
