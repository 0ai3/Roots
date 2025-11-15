import type { LatLngBoundsExpression } from "leaflet";

export type CoordinateTuple = [number, number];

export type RouteResult = {
  coordinates: CoordinateTuple[];
  distanceKm: number;
  durationMinutes: number;
  bounds: LatLngBoundsExpression;
};

type MapboxDirectionsResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: [number, number][];
    };
  }>;
};

const MAPBOX_BASE_URL = "https://api.mapbox.com/directions/v5/mapbox";

export async function fetchDirections(
  start: CoordinateTuple,
  end: CoordinateTuple,
  profile: "walking" | "cycling" | "driving" = "walking"
): Promise<RouteResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN. Add it to your .env.local file."
    );
  }

  const query = `${start[1]},${start[0]};${end[1]},${end[0]}`;
  const url = `${MAPBOX_BASE_URL}/${profile}/${query}?geometries=geojson&overview=full&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) {
    const details = await response.text().catch(() => response.statusText);
    throw new Error(`Directions API error (${response.status}): ${details}`);
  }

  const data = (await response.json()) as MapboxDirectionsResponse;
  const route = data.routes?.[0];

  if (!route || !route.geometry?.coordinates?.length) {
    throw new Error("No route available for the selected points.");
  }

  const coordinates = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as CoordinateTuple
  );

  return {
    coordinates,
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    bounds: computeBounds(coordinates),
  };
}

function computeBounds(points: CoordinateTuple[]): LatLngBoundsExpression {
  const latitudes = points.map(([lat]) => lat);
  const longitudes = points.map(([, lng]) => lng);

  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}
