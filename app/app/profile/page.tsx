import DashboardPageLayout from "../../components/DashboardPageLayout";
import ProfileForm from "../../components/ProfileForm";
import PageThemeToggle from "../../components/PageThemeToggle";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";

export default async function ProfilePage() {
  const experience = await getExperiencePointsFromSession();

  return (
    <DashboardPageLayout
      title="Profile"
      description="Tell Roots about your favorite museums, dishes, and travel stories."
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <ProfileForm
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
