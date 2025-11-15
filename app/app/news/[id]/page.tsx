import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardPageLayout from "../../../components/DashboardPageLayout";
import { getAllNews, getNewsById, slugify } from "../../../lib/news";
import { getRequestLocale } from "../../../lib/i18n/server";
import { createTranslator } from "../../../lib/i18n/translations";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getAllNews().map((article) => ({ id: article._id }));
}

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = getNewsById(id);
  if (!article) {
    return notFound();
  }
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={article.title}
      description={`${formatDate(article.date_created, locale)} • ${article.source.author} • ${article.country}, ${article.continent}`}
    >
      <div className="space-y-6 text-white/80">
        <Link
          href="/app/news"
          className="inline-flex items-center text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          {t("news.backToNews")}
        </Link>

        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-white/50">
          <Link
            href={`/app/news/continent/${slugify(article.continent)}`}
            className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-emerald-300 hover:text-emerald-200"
          >
            {article.continent}
          </Link>
          <Link
            href={`/app/news/continent/${slugify(article.continent)}/${slugify(article.country)}`}
            className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-emerald-300 hover:text-emerald-200"
          >
            {article.country}
          </Link>
        </div>

        <article className="space-y-6">
          <p className="text-base leading-relaxed">{article.content.text}</p>

          <div className="space-y-4">
            {article.content.images.map((image) => (
              <figure
                key={image.url}
                className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.description}
                  className="w-full rounded-2xl object-cover"
                />
                <figcaption className="text-xs uppercase tracking-wide text-white/50">
                  {image.description}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-wide text-white/50">
            {t("news.source", { source: article.source.website })}
          </div>
        </article>
      </div>
    </DashboardPageLayout>
  );
}
