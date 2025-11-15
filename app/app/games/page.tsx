import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";

export default function GamesPage() {
  return (
    <DashboardPageLayout
      title="Games"
      description="Content coming soon."
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <p className="text-neutral-800">
        Check back shortly to discover gamified ways to learn more about the
        Roots universe.
      </p>
    </DashboardPageLayout>
  );
}
