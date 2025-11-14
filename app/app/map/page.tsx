import DashboardPageLayout from "../../components/DashboardPageLayout";
import WorldExplorerMap from "../../components/WorldExplorerMap";

export default function MapPage() {
  return (
    <DashboardPageLayout contentClassName="border-none bg-transparent p-0 shadow-none">
      <WorldExplorerMap />
    </DashboardPageLayout>
  );
}
