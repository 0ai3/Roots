import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";
import { getRequestLocale } from "../../lib/i18n/server";
import { createTranslator } from "../../lib/i18n/translations";

export default async function GamesPage() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  return (
    <DashboardPageLayout
      title={t("games.title")}
      description={t("games.description")}
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <p className="text-white/70">{t("games.body")}</p>
    </DashboardPageLayout>
  );
}
