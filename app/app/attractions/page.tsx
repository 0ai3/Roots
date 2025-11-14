import DashboardPageLayout from "../../components/DashboardPageLayout";
import AttractionPlanner from "../../components/AttractionPlanner";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";

export default async function AttractionsPage() {
  const experience = await getExperiencePointsFromSession();

  return (
    <DashboardPageLayout
      title="Attractions"
      description="Share your travel details and let our Roots concierge craft activity ideas."
    >
      <AttractionPlanner
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
