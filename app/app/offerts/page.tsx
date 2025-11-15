import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";

export default function OffertsPage() {
  return (
    <DashboardPageLayout
      title="Offerts"
      description="Special offers will be listed soon."
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>
      <p className="text-neutral-800">
        Unlock exclusive discounts, bundles, and early access opportunities as
        the Roots community grows.
      </p>
    </DashboardPageLayout>
  );
}
