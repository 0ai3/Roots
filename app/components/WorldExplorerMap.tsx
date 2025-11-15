
"use client";

import dynamic from "next/dynamic";
import type { LiveLocationMapProps } from "./WorldExplorerMapClient";

const LiveLocationMap = dynamic(() => import("./WorldExplorerMapClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
      Initializing map experience...
    </div>
  ),
});

export type { LiveLocationMapProps } from "./WorldExplorerMapClient";

export default function WorldExplorerMap(props: LiveLocationMapProps = {}) {
  return <LiveLocationMap {...props} />;
}
