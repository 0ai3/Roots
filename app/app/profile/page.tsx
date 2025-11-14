import DashboardPageLayout from "../../components/DashboardPageLayout";
import ProfileForm from "../../components/ProfileForm";

export default function ProfilePage() {
  return (
    <DashboardPageLayout
      title="Profile"
      description="Tell Roots about your favorite museums, dishes, and travel stories."
    >
      <ProfileForm />
    </DashboardPageLayout>
  );
}
