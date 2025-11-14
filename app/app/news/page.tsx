import DashboardPageLayout from "../../components/DashboardPageLayout";

export default function NewsPage() {
  return (
    <DashboardPageLayout
      title="News"
      description="Latest updates will appear here."
    >
      <p className="text-white/70">
        We&apos;ll share platform updates, product announcements, and cultural
        highlights right in this feed.
      </p>
    </DashboardPageLayout>
  );
}
