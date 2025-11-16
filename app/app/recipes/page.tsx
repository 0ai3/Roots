import DashboardPageLayout from "../../components/DashboardPageLayout";
import RecipeIdeasPlanner from "../../components/RecipeIdeasPlanner";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";

export default async function RecipesPage() {
  const experience = await getExperiencePointsFromSession();

  return (
    <DashboardPageLayout
      contentClassName="border-none bg-transparent p-0 shadow-none"
      isDarkMode={true}
    >
      <RecipeIdeasPlanner
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
