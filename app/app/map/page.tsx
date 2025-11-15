import DashboardPageLayout from "../../components/DashboardPageLayout";
import WorldExplorerMap from "../../components/WorldExplorerMap";
import PageThemeToggle from "../../components/PageThemeToggle";

export default function MapPage() {
  return (
    <DashboardPageLayout
      contentClassName="border-none bg-transparent p-0 shadow-none"
      isDarkMode={false}
    >
      <div className="flex justify-end">
        <PageThemeToggle />
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-wide text-white/40">
            Live explorer
          </p>
          <h1 className="text-2xl font-semibold text-white">Track, follow, and route in real-time</h1>
          <p className="mt-3 text-sm text-white/70">
            Share your current position, follow yourself on the map, and request turn-by-turn routes to any saved
            attraction in your Roots profile. Tap anywhere to drop a pin, save it with a label, then route back to it
            whenever you like.
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-3">
            <li className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              ✅ Continuous geolocation tracking with follow-mode toggle
            </li>
            <li className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              📍 Attraction Planner picks are saved automatically, and you can drop extra pins anytime
            </li>
            <li className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              🚶‍♀️🚴‍♂️🚗 Walking, cycling, and driving profiles powered by Mapbox Directions
            </li>
          </ul>
        </div>

        <WorldExplorerMap height="70vh" />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <h2 className="text-lg font-semibold text-white">Setup</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Create <code className="rounded bg-white/10 px-2 py-0.5 text-xs">.env.local</code> (if you do not have
              one yet) and add:
              <pre className="mt-2 rounded-2xl bg-slate-950/60 p-3 text-xs text-white/80">
{`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxxxxx-your-token`}
              </pre>
            </li>
            <li>Restart the dev server so the API key is injected into the client bundle.</li>
            <li>Sign in so the profile API can store your saved attractions.</li>
            <li>
              Grant location permissions in the browser when prompted. If unavailable, the map still renders but
              routing requires a starting coordinate.
            </li>
          </ol>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
