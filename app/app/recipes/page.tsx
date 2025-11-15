import DashboardPageLayout from "../../components/DashboardPageLayout";
import RecipeIdeasPlanner from "../../components/RecipeIdeasPlanner";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";
import { getRequestLocale } from "../../lib/i18n/server";
import { createTranslator } from "../../lib/i18n/translations";

export default async function RecipesPage() {
  const experience = await getExperiencePointsFromSession();
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={t("recipes.title")}
      description={t("recipes.description")}
    >
      {/* Theme controlled by global ThemeToggle */}
      <RecipeIdeasPlanner
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
