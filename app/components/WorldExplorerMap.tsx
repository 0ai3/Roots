
"use client";

import dynamic from "next/dynamic";

const WorldExplorerMapClient = dynamic(
  () => import("./WorldExplorerMapClient"),
  { ssr: false }
);

export default function WorldExplorerMap() {
  return <WorldExplorerMapClient />;
}
