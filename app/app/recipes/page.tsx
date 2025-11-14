import DashboardPageLayout from "../../components/DashboardPageLayout";
import RecipeIdeasPlanner from "../../components/RecipeIdeasPlanner";

export default function RecipesPage() {
  return (
    <DashboardPageLayout
      title="Recipes"
      description="Choose a country and zone to explore five dishes powered by Gemini."
    >
      <RecipeIdeasPlanner />
    </DashboardPageLayout>
  );
}
