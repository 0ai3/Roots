"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useSWR from "swr";
import {
  fetchDirections,
  type CoordinateTuple,
  type RouteResult,
} from "../lib/directions";

export type LiveLocationMapProps = {
  initialCenter?: CoordinateTuple;
  defaultZoom?: number;
  height?: number | string;
};

export type RouteLineProps = {
  coordinates: LatLngExpression[];
  color?: string;
  weight?: number;
  dashArray?: string;
};

export function RouteLine({
  coordinates,
  color = "#0ea5e9",
  weight = 5,
  dashArray,
}: RouteLineProps) {
  if (!coordinates.length) {
    return null;
  }

  return (
    <Polyline
      positions={coordinates}
      pathOptions={{ color, weight, dashArray, opacity: 0.85 }}
    />
  );
}


type RouteProfile = "walking" | "cycling" | "driving";

type SavedAttraction = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  source: string;
  category?: string;
  description?: string;
};

type SavedAttractionResponse = {
  attractions: SavedAttraction[];
};

const savedAttractionFetcher = async (url: string) => {
  const response = await fetch(url);
  const data = (await response.json().catch(() => null)) ?? {};
  if (!response.ok) {
    const message = (data as { error?: string })?.error;
    throw new Error(message ?? "Unable to load saved attractions.");
  }
  return data as SavedAttractionResponse;
};

type MapStatus = {
  message: string;
  tone: "info" | "success" | "error";
};

const FALLBACK_CENTER: CoordinateTuple = [40.7128, -74.006];
const DEFAULT_HEIGHT = "600px";
const PROFILE_OPTIONS: Array<{ label: string; value: RouteProfile }> = [
  { label: "Walking", value: "walking" },
  { label: "Cycling", value: "cycling" },
  { label: "Driving", value: "driving" },
];

const CATEGORY_ICON_STYLES: Record<
  string,
  { emoji: string; bgClass: string; textClass: string }
> = {
  museum: {
    emoji: "🏛️",
    bgClass: "bg-violet-500/90",
    textClass: "text-white",
  },
  park: {
    emoji: "🌳",
    bgClass: "bg-emerald-500/90",
    textClass: "text-white",
  },
  food: {
    emoji: "🍜",
    bgClass: "bg-amber-400/90",
    textClass: "text-slate-900",
  },
  nightlife: {
    emoji: "🎶",
    bgClass: "bg-pink-500/90",
    textClass: "text-white",
  },
  shopping: {
    emoji: "🛍️",
    bgClass: "bg-fuchsia-500/90",
    textClass: "text-white",
  },
  landmark: {
    emoji: "📍",
    bgClass: "bg-sky-500/90",
    textClass: "text-white",
  },
  other: {
    emoji: "⭐",
    bgClass: "bg-slate-500/90",
    textClass: "text-white",
  },
};

const CATEGORY_KEYWORD_FALLBACKS: Array<{ key: keyof typeof CATEGORY_ICON_STYLES; matches: RegExp[] }> = [
  { key: "museum", matches: [/museum/i, /gallery/i] },
  { key: "park", matches: [/park/i, /garden/i, /trail/i] },
  { key: "food", matches: [/cafe/i, /restaurant/i, /food/i, /market/i] },
  { key: "nightlife", matches: [/bar/i, /club/i, /night/i] },
  { key: "shopping", matches: [/shop/i, /bazaar/i, /mall/i] },
  { key: "landmark", matches: [/bridge/i, /tower/i, /plaza/i, /monument/i] },
];

function deriveCategory(
  rawCategory?: string,
  label?: string,
  description?: string
): keyof typeof CATEGORY_ICON_STYLES {
  const normalized = rawCategory?.trim().toLowerCase();
  if (normalized && CATEGORY_ICON_STYLES[normalized]) {
    return normalized as keyof typeof CATEGORY_ICON_STYLES;
  }
  const haystack = `${label ?? ""} ${description ?? ""}`.toLowerCase();
  for (const entry of CATEGORY_KEYWORD_FALLBACKS) {
    if (entry.matches.some((regex) => regex.test(haystack))) {
      return entry.key;
    }
  }
  return "other";
}

function formatCoordinate([lat, lng]: CoordinateTuple) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function MapClickHandler({
  onSelectDestination,
}: {
  onSelectDestination: (coords: CoordinateTuple) => void;
}) {
  useMapEvents({
    click(event) {
      onSelectDestination([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

export default function LiveLocationMap({
  initialCenter = FALLBACK_CENTER,
  defaultZoom = 13,
  height = DEFAULT_HEIGHT,
}: LiveLocationMapProps) {
  const [userLocation, setUserLocation] = useState<CoordinateTuple | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<CoordinateTuple | null>(null);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [pendingCandidate, setPendingCandidate] =
    useState<CoordinateTuple | null>(null);
  const [pendingLabel, setPendingLabel] = useState("");
  const [isSavingAttraction, setIsSavingAttraction] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [routeProfile, setRouteProfile] = useState<RouteProfile>("walking");
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [status, setStatus] = useState<MapStatus>({
    message: "Share your location to begin tracking.",
    tone: "info",
  });
  const [isRouting, setIsRouting] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const mapRef = useRef<LeafletMap | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const followModeRef = useRef(followMode);
  const categoryIconCache = useRef<Record<string, L.DivIcon>>({});
  const {
    data: savedData,
    error: savedError,
    isLoading: savedLoading,
    mutate: refreshSaved,
  } = useSWR<SavedAttractionResponse>(
    "/api/profile/attractions",
    savedAttractionFetcher,
    { revalidateOnFocus: false }
  );
  const savedAttractions = useMemo(
    () => savedData?.attractions ?? [],
    [savedData]
  );
    const getCategoryIcon = useCallback(
      (attraction: SavedAttraction) => {
        const key = deriveCategory(
          attraction.category,
          attraction.label,
          attraction.description
        );
        if (!categoryIconCache.current[key]) {
          const style = CATEGORY_ICON_STYLES[key];
          categoryIconCache.current[key] = L.divIcon({
            className: "shadow-lg",
            html: `<span class="flex h-11 w-11 items-center justify-center rounded-full ${style.bgClass} ${style.textClass} font-semibold text-lg">${style.emoji}</span>`,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });
        }
        return categoryIconCache.current[key];
      },
      []
    );
  const selectedAttraction = savedAttractions.find(
    (item) => item.id === selectedAttractionId
  );
  const pendingMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className:
          "rounded-full bg-emerald-300/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg",
        html: "New",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    []
  );

  useEffect(() => {
    followModeRef.current = followMode;
  }, [followMode]);

  useEffect(() => {
    if (!selectedAttractionId && savedAttractions.length > 0) {
      setSelectedAttractionId(savedAttractions[savedAttractions.length - 1].id);
    }
  }, [savedAttractions, selectedAttractionId]);

  useEffect(() => {
    setRouteError(null);
  }, [selectedAttractionId]);

  useEffect(() => {
    // Ensure Leaflet default markers load correctly inside Next.js
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not available in this browser.");
      setStatus({ message: "Geolocation not supported.", tone: "error" });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextCoords: CoordinateTuple = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(nextCoords);
        setLocationError(null);
        setStatus({ message: "Tracking live location.", tone: "success" });

        if (followModeRef.current && mapRef.current) {
          mapRef.current.flyTo(nextCoords, Math.max(mapRef.current.getZoom(), 15), {
            animate: true,
            duration: 0.65,
          });
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied."
            : "Unable to read your location.";
        setLocationError(message);
        setStatus({ message, tone: "error" });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );

    watchIdRef.current = watchId;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestRoute = useCallback(
    async (destination?: CoordinateTuple) => {
      if (!userLocation) {
        setRouteError("Share your live location before requesting a route.");
        return;
      }

      if (!destination) {
        setRouteError("Pick a saved attraction to navigate to.");
        return;
      }

      setRouteError(null);
      setIsRouting(true);
      try {
        const nextRoute = await fetchDirections(
          userLocation,
          destination,
          routeProfile
        );
        setRouteInfo(nextRoute);
        setSelectedDestination(destination);
        setFollowMode(false);
        if (nextRoute.bounds && mapRef.current) {
          mapRef.current.fitBounds(nextRoute.bounds, { padding: [32, 32] });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to fetch directions.";
        setRouteError(message);
      } finally {
        setIsRouting(false);
      }
    },
    [routeProfile, userLocation]
  );

  const handleSelectionSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const attraction = selectedAttraction;
      if (!attraction) {
        setRouteError("Select a saved attraction first.");
        return;
      }
      await requestRoute([attraction.latitude, attraction.longitude]);
      setFollowMode(false);
      setPendingCandidate(null);
    },
    [requestRoute, selectedAttraction]
  );

  const handleMapDestination = useCallback((coords: CoordinateTuple) => {
    setPendingCandidate(coords);
    setPendingLabel("");
    setSaveError(null);
    setSelectedAttractionId(null);
    setRouteError(null);
  }, []);

  const handleSavePendingAttraction = useCallback(async () => {
    if (!pendingCandidate) {
      return;
    }
    setIsSavingAttraction(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/profile/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pendingCandidate[0],
          longitude: pendingCandidate[1],
          label: pendingLabel,
          source: "live-map",
        }),
      });
      const data = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        throw new Error((data as { error?: string })?.error ?? "Unable to save attraction.");
      }
      const saved = (data as { attraction?: SavedAttraction }).attraction;
      await refreshSaved();
      if (saved) {
        setSelectedAttractionId(saved.id);
        await requestRoute([saved.latitude, saved.longitude]);
      }
      setPendingCandidate(null);
      setPendingLabel("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save attraction.";
      setSaveError(message);
    } finally {
      setIsSavingAttraction(false);
    }
  }, [pendingCandidate, pendingLabel, refreshSaved, requestRoute]);

  const handleRoutePendingOnly = useCallback(async () => {
    if (!pendingCandidate) {
      return;
    }
    await requestRoute(pendingCandidate);
    setFollowMode(false);
  }, [pendingCandidate, requestRoute]);

  const handleSavedMarkerClick = useCallback(
    async (attraction: SavedAttraction) => {
      setSelectedAttractionId(attraction.id);
      setPendingCandidate(null);
      await requestRoute([attraction.latitude, attraction.longitude]);
    },
    [requestRoute]
  );

  const handleDismissPending = () => {
    setPendingCandidate(null);
    setPendingLabel("");
    setSaveError(null);
  };

  const handleClearRoute = () => {
    setRouteInfo(null);
    setSelectedDestination(null);
    setRouteError(null);
  };

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(
        userLocation,
        Math.max(mapRef.current.getZoom(), 15),
        {
          animate: true,
          duration: 0.5,
        }
      );
    }
  };

  const mapCenter = useMemo(
    () => userLocation ?? initialCenter,
    [initialCenter, userLocation]
  );

  const destinationIcon = useMemo(
    () =>
      L.divIcon({
        className:
          "rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg",
        html: "Dest",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    []
  );
  const destinationSummary = selectedAttraction
    ? `${selectedAttraction.label} · ${selectedAttraction.latitude.toFixed(3)}, ${selectedAttraction.longitude.toFixed(3)}`
    : selectedDestination
    ? formatCoordinate(selectedDestination)
    : "--";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">
              Live location status
            </p>
            <p
              className={`text-sm font-semibold ${
                status.tone === "error"
                  ? "text-rose-300"
                  : status.tone === "success"
                  ? "text-emerald-300"
                  : "text-white/70"
              }`}
            >
              {status.message}
            </p>
            {locationError && (
              <p className="text-xs text-rose-200">{locationError}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/60">
            <button
              type="button"
              onClick={() => setFollowMode((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                followMode
                  ? "border-emerald-300/70 text-emerald-100"
                  : "border-white/20 text-white hover:border-emerald-300"
              }`}
            >
              {followMode ? "Following" : "Free explore"}
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-emerald-300"
            >
              Recenter
            </button>
            <button
              type="button"
              onClick={handleClearRoute}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-rose-300"
            >
              Clear route
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSelectionSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-white/80 md:col-span-2">
            <span>Saved attractions</span>
            <div className="space-y-3">
              <select
                value={selectedAttractionId ?? ""}
                onChange={(event) => setSelectedAttractionId(event.target.value || null)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white focus:border-emerald-300 focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-white/70">
                  {savedLoading
                    ? "Loading saved attractions..."
                    : savedError
                    ? "Unable to load attractions"
                    : savedAttractions.length === 0
                    ? "No saved attractions yet"
                    : "Select an attraction"}
                </option>
                {savedAttractions.map((attraction) => {
                  const categoryKey = deriveCategory(
                    attraction.category,
                    attraction.label,
                    attraction.description
                  );
                  const emoji = CATEGORY_ICON_STYLES[categoryKey].emoji;
                  return (
                    <option
                      key={attraction.id}
                      value={attraction.id}
                      className="bg-slate-900 text-white"
                    >
                      {emoji} {attraction.label} · {attraction.latitude.toFixed(3)}, {" "}
                      {attraction.longitude.toFixed(3)}
                    </option>
                  );
                })}
              </select>
              {savedError && (
                <p className="text-xs text-rose-200">
                  {savedError.message || "Sign in to sync saved attractions."}
                </p>
              )}
              <p className="text-xs text-white/60">
                Planner saves land here automatically, or tap the map to drop a pin and keep it for later.
              </p>
            </div>
          </label>

          <label className="space-y-2 text-sm font-medium text-white/80">
            <span>Travel mode</span>
            <select
              value={routeProfile}
              onChange={(event) =>
                setRouteProfile(event.target.value as RouteProfile)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white focus:border-emerald-300 focus:outline-none"
            >
              {PROFILE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-slate-900 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {routeError && (
          <p className="mt-3 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {routeError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isRouting || !selectedAttraction}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRouting ? "Fetching route..." : "Navigate"}
          </button>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Tip: tap anywhere on the map to save it as a favorite stop.
          </p>
        </div>
      </form>

      {pendingCandidate && (
        <div className="rounded-3xl border border-emerald-300/40 bg-emerald-300/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2 text-sm font-medium text-white/80">
              <span>Save this spot to your profile</span>
              <input
                type="text"
                value={pendingLabel}
                onChange={(event) => setPendingLabel(event.target.value)}
                placeholder={formatCoordinate(pendingCandidate)}
                className="w-full rounded-2xl border border-white/20 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none"
              />
              <p className="text-xs text-white/70">
                Saved attractions can be routed to anytime from the dropdown above.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2 text-sm text-white/80">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Coordinates</p>
                <p className="font-mono text-base">{formatCoordinate(pendingCandidate)}</p>
              </div>
              {saveError && (
                <p className="text-xs text-rose-200">{saveError}</p>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isSavingAttraction}
                  onClick={handleSavePendingAttraction}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingAttraction ? "Saving..." : "Save & Route"}
                </button>
                <button
                  type="button"
                  disabled={isRouting}
                  onClick={handleRoutePendingOnly}
                  className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRouting ? "Routing..." : "Route now"}
                </button>
                <button
                  type="button"
                  disabled={isSavingAttraction}
                  onClick={handleDismissPending}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          scrollWheelZoom
          style={{ height, width: "100%" }}
          ref={(mapInstance: LeafletMap | null) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution='
              &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
              contributors
            '
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <Marker position={userLocation} title="You are here" />
          )}

          {savedAttractions.map((attraction) => (
            <Marker
              key={attraction.id}
              position={[attraction.latitude, attraction.longitude]}
              icon={getCategoryIcon(attraction)}
              eventHandlers={{
                click: () => {
                  void handleSavedMarkerClick(attraction);
                },
              }}
            />
          ))}

          {selectedDestination && (
            <Marker position={selectedDestination} icon={destinationIcon} />
          )}

          {pendingCandidate && (
            <Marker position={pendingCandidate} icon={pendingMarkerIcon} />
          )}

          <RouteLine coordinates={routeInfo?.coordinates ?? []} />
          <MapClickHandler onSelectDestination={handleMapDestination} />
        </MapContainer>
      </div>

      {routeInfo && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Distance
            </p>
            <p className="text-2xl font-semibold text-white">
              {routeInfo.distanceKm.toFixed(2)} km
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Estimated time
            </p>
            <p className="text-2xl font-semibold text-white">
              {routeInfo.durationMinutes.toFixed(0)} min
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Destination
            </p>
            <p className="text-sm text-white/80">{destinationSummary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
