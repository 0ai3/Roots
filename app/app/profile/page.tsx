import DashboardPageLayout from "../../components/DashboardPageLayout";
import ProfileForm from "../../components/ProfileForm";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";

export default async function ProfilePage() {
  const experience = await getExperiencePointsFromSession();

  return (
    <DashboardPageLayout
      title="Profile"
      description="Tell Roots about your favorite museums, dishes, and travel stories."
    >
      <ProfileForm
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
