import DashboardPageLayout from "../../components/DashboardPageLayout";
import ProfileForm from "../../components/ProfileForm";
import { getExperiencePointsFromSession } from "../../lib/experiencePoints.server";
import { getRequestLocale } from "../../lib/i18n/server";
import { createTranslator } from "../../lib/i18n/translations";

export default async function ProfilePage() {
  const experience = await getExperiencePointsFromSession();
  const locale = await getRequestLocale();
  const t = createTranslator(locale);

  return (
    <DashboardPageLayout
      title={t("profile.title")}
      description={t("profile.description")}
      isDarkMode={true}
    >
      <ProfileForm
        initialPoints={experience.points}
        initialUserId={experience.userId}
      />
    </DashboardPageLayout>
  );
}
