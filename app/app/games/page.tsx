import DashboardPageLayout from "../../components/DashboardPageLayout";
import LearnAndEarnGame from "../../components/LearnAndEarnGame";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";
import { getRequestLocale } from "../../lib/i18n/server";
import { createTranslator } from "../../lib/i18n/translations";

export default async function GamesPage() {
  const experience = await getExperiencePointsFromSession();
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={t("games.title")}
      description={t("games.description")}
    >
      {/* Theme controlled by global ThemeToggle */}
      <LearnAndEarnGame
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
