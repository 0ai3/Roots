import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";
import { getRequestLocale } from "../../lib/i18n/server";
import { createTranslator } from "../../lib/i18n/translations";

export default async function OffertsPage() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  return (
    <DashboardPageLayout
      title={t("offers.title")}
      description={t("offers.description")}
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <p className="text-neutral-800">{t("offers.body")}</p>
    </DashboardPageLayout>
  );
}
