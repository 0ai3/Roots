import Link from "next/link";
import type { NewsArticle } from "../lib/news";
import type { LocaleCode } from "@/app/lib/i18n/languages";
import { createTranslator } from "@/app/lib/i18n/translations";

/* eslint-disable @next/next/no-img-element */

type Props = {
  article: NewsArticle;
  locale?: LocaleCode;
};

function formatDate(date: string, locale: LocaleCode) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NewsCard({ article, locale = "en" }: Props) {
  const heroImage = article.content.images[0];
  const t = createTranslator(locale);

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner transition">
      {heroImage && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img
            src={heroImage.url}
            alt={heroImage.description}
            className="h-56 w-full object-cover transition duration-200 hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/40">
          {formatDate(article.date_created, locale)} • {article.country},{" "}
          {article.continent}
        </p>
        <h2 className="text-2xl font-semibold text-white">{article.title}</h2>
        <p className="text-sm text-white/70">{article.content.text}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <span>{article.source.author}</span>
        <span>{article.source.website}</span>
      </div>
      <div>
        <Link
          href={`/app/news/${article._id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          {t("news.readMore")}
        </Link>
      </div>
    </article>
  );
}
