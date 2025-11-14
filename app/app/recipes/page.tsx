import DashboardPageLayout from "../../components/DashboardPageLayout";
import RecipeIdeasPlanner from "../../components/RecipeIdeasPlanner";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";

export default async function RecipesPage() {
  const experience = await getExperiencePointsFromSession();

  return (
    <DashboardPageLayout
      title="Recipes"
      description="Choose a country and zone to explore five dishes powered by Gemini."
    >
      <RecipeIdeasPlanner
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
