import DashboardPageLayout from "../../components/DashboardPageLayout";
import AttractionPlanner from "../../components/AttractionPlanner";

export default function AttractionsPage() {
  return (
    <DashboardPageLayout
      title="Attractions"
      description="Share your travel details and let our Roots concierge craft activity ideas."
    >
      <AttractionPlanner />
    </DashboardPageLayout>
  );
}
