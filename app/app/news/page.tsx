import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";

export default function NewsPage() {
  return (
    <DashboardPageLayout
      title="News"
      description="Latest updates will appear here."
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <p className="text-neutral-800">
        We&apos;ll share platform updates, product announcements, and cultural
        highlights right in this feed.
      </p>
    </DashboardPageLayout>
  );
}
