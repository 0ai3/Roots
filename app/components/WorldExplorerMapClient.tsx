"use client";

import "leaflet/dist/leaflet.css";

import L, { LatLngBoundsExpression } from "leaflet";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { motion } from "framer-motion";
import { Compass, Navigation, Globe, MapPin, Search, Sparkles } from "lucide-react";
import { useI18n } from "@/app/hooks/useI18n";
import type { CityAttraction } from "@/app/types/cityAttractions";

type Bounds = LatLngBoundsExpression;

type City = {
  name: string;
  coords: [number, number];
};

type Region = {
  name: string;
  bounds: Bounds;
  cities: City[];
};

type Country = {
  name: string;
  bounds: Bounds;
  regions: Region[];
};

type Continent = {
  name: string;
  bounds: Bounds;
  countries: Country[];
};

const WORLD_BOUNDS: Bounds = [
  [-60, -180],
  [85, 180],
];
const CITY_ATTRACTION_LIMIT = 8;

const ATTRACTION_FOCUS_SUGGESTIONS = [
  "Museums",
  "Parks & gardens",
  "Street food",
  "Architecture",
  "Family-friendly",
  "Nightlife",
  "History tours",
] as const;

const atlas: Continent[] = [
  {
    name: "North America",
    bounds: [
      [5, -168],
      [83, -52],
    ],
    countries: [
      {
        name: "United States",
        bounds: [
          [18, -125],
          [49, -66],
        ],
        regions: [
          {
            name: "West Coast",
            bounds: [
              [32, -125],
              [49, -114],
            ],
            cities: [
              { name: "San Francisco", coords: [37.7749, -122.4194] },
              { name: "Seattle", coords: [47.6062, -122.3321] },
            ],
          },
          {
            name: "Northeast",
            bounds: [
              [39, -79],
              [47, -66],
            ],
            cities: [
              { name: "New York City", coords: [40.7128, -74.006] },
              { name: "Boston", coords: [42.3601, -71.0589] },
            ],
          },
        ],
      },
      {
        name: "Canada",
        bounds: [
          [42, -141],
          [83, -52],
        ],
        regions: [
          {
            name: "British Columbia",
            bounds: [
              [48, -139],
              [60, -114],
            ],
            cities: [
              { name: "Vancouver", coords: [49.2827, -123.1207] },
              { name: "Victoria", coords: [48.4284, -123.3656] },
            ],
          },
          {
            name: "Ontario",
            bounds: [
              [41, -95],
              [57, -74],
            ],
            cities: [
              { name: "Toronto", coords: [43.65107, -79.347015] },
              { name: "Ottawa", coords: [45.4215, -75.6972] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "South America",
    bounds: [
      [-56, -82],
      [13, -34],
    ],
    countries: [
      {
        name: "Brazil",
        bounds: [
          [-34, -74],
          [6, -34],
        ],
        regions: [
          {
            name: "Southeast",
            bounds: [
              [-24, -50],
              [-14, -37],
            ],
            cities: [
              { name: "São Paulo", coords: [-23.5505, -46.6333] },
              { name: "Rio de Janeiro", coords: [-22.9068, -43.1729] },
            ],
          },
          {
            name: "Northeast",
            bounds: [
              [-12, -45],
              [0, -34],
            ],
            cities: [
              { name: "Salvador", coords: [-12.9777, -38.5016] },
              { name: "Recife", coords: [-8.0476, -34.877] },
            ],
          },
        ],
      },
      {
        name: "Argentina",
        bounds: [
          [-55, -73],
          [-22, -53],
        ],
        regions: [
          {
            name: "Buenos Aires",
            bounds: [
              [-37, -59],
              [-34, -57],
            ],
            cities: [
              { name: "Buenos Aires", coords: [-34.6037, -58.3816] },
            ],
          },
          {
            name: "Patagonia",
            bounds: [
              [-55, -73],
              [-42, -65],
            ],
            cities: [
              { name: "Ushuaia", coords: [-54.8019, -68.303] },
              { name: "Bariloche", coords: [-41.1335, -71.3103] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Europe",
    bounds: [
      [34, -25],
      [72, 45],
    ],
    countries: [
      {
        name: "United Kingdom",
        bounds: [
          [49.9, -8.6],
          [59, 1.8],
        ],
        regions: [
          {
            name: "England",
            bounds: [
              [50, -5.8],
              [55.8, 1.8],
            ],
            cities: [
              { name: "London", coords: [51.5072, -0.1276] },
              { name: "Manchester", coords: [53.4808, -2.2426] },
            ],
          },
          {
            name: "Scotland",
            bounds: [
              [55, -7.7],
              [59, -0.8],
            ],
            cities: [
              { name: "Edinburgh", coords: [55.9533, -3.1883] },
              { name: "Glasgow", coords: [55.8642, -4.2518] },
            ],
          },
        ],
      },
      {
        name: "Germany",
        bounds: [
          [47, 5],
          [55, 15.5],
        ],
        regions: [
          {
            name: "Bavaria",
            bounds: [
              [47, 9],
              [50.6, 13.5],
            ],
            cities: [
              { name: "Munich", coords: [48.1351, 11.582] },
              { name: "Nuremberg", coords: [49.4521, 11.0767] },
            ],
          },
          {
            name: "Berlin",
            bounds: [
              [52.2, 13],
              [52.7, 13.8],
            ],
            cities: [{ name: "Berlin", coords: [52.52, 13.405] }],
          },
        ],
      },
    ],
  },
  {
    name: "Africa",
    bounds: [
      [-35, -18],
      [38, 52],
    ],
    countries: [
      {
        name: "Nigeria",
        bounds: [
          [4, 2.6],
          [14, 14.7],
        ],
        regions: [
          {
            name: "Lagos State",
            bounds: [
              [6, 2.3],
              [6.9, 4.4],
            ],
            cities: [{ name: "Lagos", coords: [6.5244, 3.3792] }],
          },
          {
            name: "Abuja",
            bounds: [
              [8.6, 6.8],
              [9.5, 7.7],
            ],
            cities: [{ name: "Abuja", coords: [9.0765, 7.3986] }],
          },
        ],
      },
      {
        name: "South Africa",
        bounds: [
          [-35, 16],
          [-22, 33],
        ],
        regions: [
          {
            name: "Western Cape",
            bounds: [
              [-35, 17],
              [-30, 23],
            ],
            cities: [{ name: "Cape Town", coords: [-33.9249, 18.4241] }],
          },
          {
            name: "Gauteng",
            bounds: [
              [-27.6, 27],
              [-25.5, 29.5],
            ],
            cities: [
              { name: "Johannesburg", coords: [-26.2041, 28.0473] },
              { name: "Pretoria", coords: [-25.7479, 28.2293] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Asia",
    bounds: [
      [-10, 25],
      [77, 180],
    ],
    countries: [
      {
        name: "Japan",
        bounds: [
          [30, 129],
          [46, 146],
        ],
        regions: [
          {
            name: "Kanto",
            bounds: [
              [34.5, 138],
              [36.5, 141],
            ],
            cities: [
              { name: "Tokyo", coords: [35.6762, 139.6503] },
              { name: "Yokohama", coords: [35.4437, 139.638] },
            ],
          },
          {
            name: "Kansai",
            bounds: [
              [34, 134],
              [36.5, 137],
            ],
            cities: [
              { name: "Osaka", coords: [34.6937, 135.5023] },
              { name: "Kyoto", coords: [35.0116, 135.7681] },
            ],
          },
        ],
      },
      {
        name: "India",
        bounds: [
          [8, 68],
          [37, 97],
        ],
        regions: [
          {
            name: "Maharashtra",
            bounds: [
              [15.6, 72.5],
              [22.1, 80],
            ],
            cities: [
              { name: "Mumbai", coords: [19.076, 72.8777] },
              { name: "Pune", coords: [18.5204, 73.8567] },
            ],
          },
          {
            name: "Delhi",
            bounds: [
              [28.3, 76.7],
              [29.1, 77.4],
            ],
            cities: [{ name: "New Delhi", coords: [28.6139, 77.209] }],
          },
        ],
      },
    ],
  },
  {
    name: "Oceania",
    bounds: [
      [-50, 110],
      [0, 180],
    ],
    countries: [
      {
        name: "Australia",
        bounds: [
          [-44, 112],
          [-10, 154],
        ],
        regions: [
          {
            name: "New South Wales",
            bounds: [
              [-38, 141],
              [-28, 153.5],
            ],
            cities: [
              { name: "Sydney", coords: [-33.8688, 151.2093] },
              { name: "Newcastle", coords: [-32.9283, 151.7817] },
            ],
          },
          {
            name: "Queensland",
            bounds: [
              [-29, 138],
              [-10, 154],
            ],
            cities: [
              { name: "Brisbane", coords: [-27.4698, 153.0251] },
              { name: "Cairns", coords: [-16.9186, 145.7781] },
            ],
          },
        ],
      },
      {
        name: "New Zealand",
        bounds: [
          [-47, 166],
          [-34, 179],
        ],
        regions: [
          {
            name: "North Island",
            bounds: [
              [-39, 173],
              [-34, 178],
            ],
            cities: [
              { name: "Auckland", coords: [-36.8485, 174.7633] },
              { name: "Wellington", coords: [-41.2865, 174.7762] },
            ],
          },
          {
            name: "South Island",
            bounds: [
              [-47, 166],
              [-40, 174],
            ],
            cities: [
              { name: "Christchurch", coords: [-43.5321, 172.6362] },
              { name: "Queenstown", coords: [-45.0312, 168.6626] },
            ],
          },
        ],
      },
    ],
  },
];

const MIN_ATTRACTION_ZOOM = 6;

function MapViewport({
  bounds,
  freeMode,
}: {
  bounds: Bounds;
  freeMode: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || freeMode || !bounds) {
      return;
    }
    map.flyToBounds(bounds, {
      duration: 1.3,
      padding: [40, 40],
    });
  }, [map, bounds, freeMode]);

  return null;
}

function MapViewTracker({
  onChange,
}: {
  onChange: (view: { center: [number, number]; zoom: number }) => void;
}) {
  useMapEvents({
    load(event) {
      const map = event.target;
      const center = map.getCenter();
      onChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
    },
    moveend(event) {
      const map = event.target;
      const center = map.getCenter();
      onChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
    },
    zoomend(event) {
      const map = event.target;
      const center = map.getCenter();
      onChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
    },
  });
  return null;
}

function CityMarkers({ city, freeMode }: { city?: City | null; freeMode: boolean }) {
  if (!city || freeMode) {
    return null;
  }
  return (
    <Marker position={city.coords}>
      <Popup>
        <div className="text-sm font-semibold">{city.name}</div>
      </Popup>
    </Marker>
  );
}

function normalizeCityBounds(coords: [number, number]): Bounds {
  const [lat, lng] = coords;
  const delta = 0.7;
  return [
    [lat - delta, lng - delta],
    [lat + delta, lng + delta],
  ];
}

function attractionBounds(attractions: CityAttraction[]): Bounds | null {
  const validPoints = attractions.filter(
    (item) =>
      Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
  );

  if (validPoints.length === 0) {
    return null;
  }

  const latitudes = validPoints.map((item) => item.latitude);
  const longitudes = validPoints.map((item) => item.longitude);

  const padding = 0.2;
  return [
    [Math.min(...latitudes) - padding, Math.min(...longitudes) - padding],
    [Math.max(...latitudes) + padding, Math.max(...longitudes) + padding],
  ];
}

function AttractionMarkers({
  attractions,
  freeMode,
  mapsLabel,
}: {
  attractions: CityAttraction[];
  freeMode: boolean;
  mapsLabel: string;
}) {
  if (freeMode || attractions.length === 0) {
    return null;
  }
  return (
    <>
      {attractions.map((spot) => (
        <Marker
          key={`${spot.title}-${spot.latitude}-${spot.longitude}`}
          position={[spot.latitude, spot.longitude]}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{spot.title}</p>
              {spot.neighborhood && (
                <p className="text-xs text-neutral-500">{spot.neighborhood}</p>
              )}
              {spot.summary && (
                <p className="text-xs text-neutral-600">{spot.summary}</p>
              )}
              {spot.mapLink && (
                <a
                  href={spot.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-lime-600 underline"
                >
                  {mapsLabel}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function WorldExplorerMap() {
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [freeMode, setFreeMode] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [attractions, setAttractions] = useState<CityAttraction[]>([]);
  const [attractionsError, setAttractionsError] = useState<string | null>(null);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [attractionFocus, setAttractionFocus] = useState("");
  const [attractionRefreshKey, setAttractionRefreshKey] = useState(0);
  const [mapView, setMapView] = useState<{
    center: [number, number];
    zoom: number;
  }>({ center: [20, 0], zoom: 3 });
  const { t } = useI18n();

  useEffect(() => {
    // Fix Leaflet's default icon path issues in Next.js
    const iconProto = L.Icon.Default.prototype as unknown as {
      _getIconUrl?: () => string;
    };
    delete iconProto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    if (!selectedCity) {
      setAttractions([]);
      setAttractionsError(null);
      setAttractionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchAttractions = async () => {
      setAttractionsLoading(true);
      setAttractionsError(null);
      try {
        const response = await fetch("/api/attractions/city", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: selectedCity.name,
            country: selectedCountry?.name,
            limit: CITY_ATTRACTION_LIMIT,
            category: attractionFocus.trim() || undefined,
          }),
          signal: controller.signal,
        });

        const text = await response.text();
        if (!response.ok) {
          let message = t("worldExplorer.messages.unableToFetch");
          try {
            const errorPayload = JSON.parse(text) as { error?: string };
            message = errorPayload.error || message;
          } catch {
            // ignore parse errors
          }
          throw new Error(message);
        }

        if (!text) {
          throw new Error(t("worldExplorer.messages.emptyResponse"));
        }

        const payload = JSON.parse(text) as { attractions?: CityAttraction[] };
        setAttractions(Array.isArray(payload.attractions) ? payload.attractions : []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : t("worldExplorer.messages.failedToLoad");
        setAttractions([]);
        setAttractionsError(message);
      } finally {
        if (!controller.signal.aborted) {
          setAttractionsLoading(false);
        }
      }
    };

    fetchAttractions();

    return () => controller.abort();
  }, [selectedCity, selectedCountry?.name, attractionFocus, attractionRefreshKey, t]);

  const attractionHighlightBounds = useMemo(() => {
    if (freeMode) {
      return null;
    }
    return attractionBounds(attractions);
  }, [attractions, freeMode]);

  const activeBounds = useMemo(() => {
    if (attractionHighlightBounds) {
      return attractionHighlightBounds;
    }
    if (selectedCity) {
      return normalizeCityBounds(selectedCity.coords);
    }
    if (selectedCountry) {
      return selectedCountry.bounds;
    }
    if (selectedContinent) {
      return selectedContinent.bounds;
    }
    return WORLD_BOUNDS;
  }, [attractionHighlightBounds, selectedCity, selectedCountry, selectedContinent]);

  const availableCountries = useMemo(() => {
    if (selectedContinent) {
      return selectedContinent.countries;
    }
    return atlas.flatMap((continent) => continent.countries);
  }, [selectedContinent]);

  const availableCities = useMemo(() => {
    if (selectedCountry) {
      return selectedCountry.regions.flatMap((region) => region.cities);
    }
    if (selectedContinent) {
      return selectedContinent.countries.flatMap((country) =>
        country.regions.flatMap((region) => region.cities)
      );
    }
    return atlas.flatMap((continent) =>
      continent.countries.flatMap((country) =>
        country.regions.flatMap((region) => region.cities)
      )
    );
  }, [selectedCountry, selectedContinent]);

  const countriesWithParents = useMemo(
    () =>
      atlas.flatMap((continent) =>
        continent.countries.map((country) => ({ continent, country }))
      ),
    []
  );

  const normalizeLabel = useCallback((value: string) => value.trim().toLowerCase(), []);

  const handleLocationSearch = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const normalizedCountry = normalizeLabel(countryQuery);
      const normalizedCity = normalizeLabel(cityQuery);

      if (!normalizedCountry || !normalizedCity) {
        setSearchError(t("worldExplorer.messages.enterBoth"));
        return;
      }

      const countryMatch =
        countriesWithParents.find(
          ({ country }) => normalizeLabel(country.name) === normalizedCountry
        ) ??
        countriesWithParents.find(({ country }) =>
          normalizeLabel(country.name).includes(normalizedCountry)
        );

      if (!countryMatch) {
        setSearchError(t("worldExplorer.messages.countryNotFound"));
        return;
      }

      const allCities = countryMatch.country.regions.flatMap((region) =>
        region.cities.map((city) => ({ city, region }))
      );

      const cityMatch =
        allCities.find(
          ({ city }) => normalizeLabel(city.name) === normalizedCity
        ) ??
        allCities.find(({ city }) =>
          normalizeLabel(city.name).includes(normalizedCity)
        );

      if (!cityMatch) {
        setSearchError(
          t("worldExplorer.messages.cityNotFound", {
            city: cityQuery,
            country: countryMatch.country.name,
          })
        );
        return;
      }

      setSelectedContinent(countryMatch.continent);
      setSelectedCountry(countryMatch.country);
      setSelectedCity(cityMatch.city);
      setFreeMode(false);
      setCountryQuery(countryMatch.country.name);
      setCityQuery(cityMatch.city.name);
      setSearchError(null);
    },
    [countriesWithParents, countryQuery, cityQuery, normalizeLabel, t]
  );

  const refreshAttractions = useCallback(() => {
    setAttractionRefreshKey((prev) => prev + 1);
  }, []);

  const handleMapViewChange = useCallback(
    (view: { center: [number, number]; zoom: number }) => {
      setMapView(view);
    },
    []
  );

  const handleLookForAttractions = useCallback(() => {
    if (mapView.zoom < MIN_ATTRACTION_ZOOM) {
      setAttractionsError(t("worldExplorer.messages.zoomInFurther"));
      return;
    }
    const lat = mapView.center[0].toFixed(2);
    const lng = mapView.center[1].toFixed(2);
    const label = t("worldExplorer.customArea.label", { lat, lng });
    const pseudoCity: City = {
      name: label,
      coords: mapView.center,
    };
    setSelectedContinent(null);
    setSelectedCountry(null);
    setSelectedCity(pseudoCity);
    setCountryQuery("");
    setCityQuery(label);
    setSearchError(null);
    setAttractionsError(null);
  }, [mapView, t]);

  const resetSelections = () => {
    setSelectedContinent(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setFreeMode(false);
    setCountryQuery("");
    setCityQuery("");
    setAttractions([]);
    setAttractionsError(null);
    setAttractionsLoading(false);
    setSearchError(null);
    setAttractionFocus("");
    setAttractionRefreshKey(0);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 overflow-hidden rounded-[28px] border border-white/5 bg-neutral-900/40 shadow-2xl backdrop-blur-sm"
        >
          <div className="relative">
            <MapContainer
              center={[20, 0]}
              zoom={3}
              className="rounded-[28px]"
              style={{ height: "640px", width: "100%" }}
              worldCopyJump
              minZoom={2}
              maxZoom={10}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewport bounds={activeBounds} freeMode={freeMode} />
              <MapViewTracker onChange={handleMapViewChange} />
              <CityMarkers city={selectedCity} freeMode={freeMode} />
              <AttractionMarkers
                attractions={attractions}
                freeMode={freeMode}
                mapsLabel={t("worldExplorer.attractions.openInMaps")}
              />
            </MapContainer>
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center z-[100]">
              <button
                type="button"
                onClick={handleLookForAttractions}
                disabled={mapView.zoom < MIN_ATTRACTION_ZOOM}
                className={`pointer-events-auto rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide shadow-lg transition ${
                  mapView.zoom < MIN_ATTRACTION_ZOOM
                    ? "bg-white/30 text-white/70"
                    : "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                }`}
              >
                {t("worldExplorer.buttons.lookForAttractions")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full flex-shrink-0 rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm lg:w-[360px] xl:w-[390px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <h2 className="text-xl font-bold">{t("worldExplorer.title")}</h2>
            </div>
            <motion.button
              type="button"
              onClick={() => setFreeMode((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2 ${
                freeMode 
                  ? "bg-lime-400 text-neutral-950" 
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
            >
              <Compass className="w-4 h-4" />
              {freeMode
                ? t("worldExplorer.freeMode.active")
                : t("worldExplorer.freeMode.cta")}
            </motion.button>
          </div>

          {/* Description */}
          {freeMode ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-white/70 leading-relaxed"
            >
              {t("worldExplorer.freeModeDescription")}
            </motion.p>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-white/70 leading-relaxed"
            >
              {t("worldExplorer.guidedDescription")}
            </motion.p>
          )}

          {/* Location Controls */}
          <div className="mt-6 space-y-6">
            {/* Continents */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60 mb-3">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t("worldExplorer.sections.continents")}
                </span>
                {selectedContinent && (
                  <motion.button
                    type="button"
                    className="text-lime-300 hover:text-lime-200 transition-colors"
                    onClick={() => {
                      setSelectedContinent(null);
                      setSelectedCountry(null);
                      setSelectedCity(null);
                      setCountryQuery("");
                      setCityQuery("");
                      setFreeMode(false);
                      setAttractions([]);
                      setAttractionsError(null);
                    }}
                  >
                    {t("worldExplorer.actions.clear")}
                  </motion.button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {atlas.map((continent) => (
                  <motion.button
                    key={continent.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      selectedContinent?.name === continent.name
                        ? "border-lime-400 bg-lime-400/10 text-lime-100 shadow-lg"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSelectedContinent(continent);
                      setSelectedCountry(null);
                      setSelectedCity(null);
                      setCountryQuery("");
                      setCityQuery("");
                      setSearchError(null);
                      setAttractions([]);
                      setAttractionsError(null);
                      setFreeMode(false);
                    }}
                  >
                    {continent.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
              onSubmit={handleLocationSearch}
            >
              <div>
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  {t("worldExplorer.sections.country")}
                </div>
                <input
                  type="text"
                  list="navigator-country-options"
                  value={countryQuery}
                  onChange={(event) => {
                    setCountryQuery(event.target.value);
                    setSearchError(null);
                  }}
                  placeholder={t("worldExplorer.placeholders.country")}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-lime-300 focus:outline-none"
                />
                <p className="mt-2 text-xs text-white/50">
                  {selectedContinent
                    ? t("worldExplorer.sections.countryHintSelected", {
                        continent: selectedContinent.name,
                      })
                    : t("worldExplorer.sections.countryHintAll")}
                </p>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("worldExplorer.sections.city")}
                </div>
                <input
                  type="text"
                  list="navigator-city-options"
                  value={cityQuery}
                  onChange={(event) => {
                    setCityQuery(event.target.value);
                    setSearchError(null);
                  }}
                  placeholder={t("worldExplorer.placeholders.city")}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-lime-300 focus:outline-none"
                />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t("worldExplorer.sections.focusLabel")}
                </div>
                <input
                  type="text"
                  list="attraction-focus-options"
                  value={attractionFocus}
                  onChange={(event) => {
                    setAttractionFocus(event.target.value);
                    setAttractionsError(null);
                  }}
                  placeholder={t("worldExplorer.placeholders.focus")}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-lime-300 focus:outline-none"
                />
                <p className="mt-2 text-xs text-white/50">
                  {t("worldExplorer.focusHint")}
                </p>
              </div>

              {searchError && (
                <p className="text-xs text-red-300">{searchError}</p>
              )}

              {selectedCity && !searchError && (
                <p className="text-xs text-white/50">
                  {t("worldExplorer.sections.centered", {
                    city: selectedCity.name,
                    country: selectedCountry ? `, ${selectedCountry.name}` : "",
                  })}
                </p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition-all hover:bg-lime-300"
              >
                <Search className="w-4 h-4" />
                {t("worldExplorer.buttons.search")}
              </motion.button>

              <datalist id="navigator-country-options">
                {availableCountries.map((country) => (
                  <option key={country.name} value={country.name} />
                ))}
              </datalist>
              <datalist id="navigator-city-options">
                {availableCities.map((city) => (
                  <option
                    key={`${city.name}-${city.coords[0]}-${city.coords[1]}`}
                    value={city.name}
                  />
                ))}
              </datalist>
              <datalist id="attraction-focus-options">
                {ATTRACTION_FOCUS_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </motion.form>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <motion.button
              type="button"
              onClick={() => {
                if (selectedCity) {
                  setSelectedCity(null);
                  setAttractions([]);
                  setAttractionsError(null);
                } else if (selectedCountry) {
                  setSelectedCountry(null);
                  setCountryQuery("");
                  setCityQuery("");
                } else {
                  setSelectedContinent(null);
                }
                setSearchError(null);
                setFreeMode(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition-all hover:border-white/40 hover:bg-white/10"
            >
              {t("worldExplorer.buttons.back")}
            </motion.button>
            <motion.button
              type="button"
              onClick={resetSelections}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-all hover:bg-green-400"
            >
              {t("worldExplorer.buttons.reset")}
            </motion.button>
          </motion.div>

          {/* Gemini Attractions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {t("worldExplorer.attractions.heading")}
                </p>
                <p className="text-sm text-white/80">
                  {selectedCity
                    ? t("worldExplorer.attractions.subtitleSelected", {
                        count: CITY_ATTRACTION_LIMIT,
                        city: selectedCity.name,
                      })
                    : t("worldExplorer.attractions.subtitleEmpty")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">
                  {t("worldExplorer.attractions.powered")}
                </span>
                <button
                  type="button"
                  onClick={refreshAttractions}
                  disabled={!selectedCity || attractionsLoading}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                    !selectedCity || attractionsLoading
                      ? "border border-white/10 text-white/40"
                      : "border border-lime-300/60 text-lime-200 hover:border-lime-200 hover:text-lime-100"
                  }`}
                >
                  {t("worldExplorer.attractions.refresh")}
                </button>
              </div>
            </div>

            {!selectedCity && (
              <p className="mt-4 text-sm text-white/60">
                {t("worldExplorer.attractions.instructions")}
              </p>
            )}

            {selectedCity && (
              <div className="mt-4 space-y-4">
                {attractionFocus.trim() && (
                  <p className="text-xs uppercase tracking-wide text-lime-200">
                    {t("worldExplorer.attractions.focusing", {
                      focus: attractionFocus.trim(),
                    })}
                  </p>
                )}
                {attractionsLoading && (
                  <p className="text-sm text-white/70">
                    {t("worldExplorer.attractions.loading")}
                  </p>
                )}
                {attractionsError && (
                  <p className="text-sm text-red-300">{attractionsError}</p>
                )}
                {!attractionsLoading &&
                  !attractionsError &&
                  attractions.length === 0 && (
                    <p className="text-sm text-white/60">
                      {t("worldExplorer.attractions.error")}
                    </p>
                  )}
                {attractions.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {attractions.map((spot) => (
                      <article
                        key={`${spot.title}-${spot.latitude}-${spot.longitude}`}
                        className="rounded-xl border border-white/10 bg-neutral-900/60 p-4"
                      >
                        <p className="text-sm font-semibold text-white">
                          {spot.title}
                        </p>
                        {spot.neighborhood && (
                          <p className="text-xs uppercase tracking-wide text-white/40">
                            {spot.neighborhood}
                          </p>
                        )}
                        {spot.summary && (
                          <p className="mt-2 text-sm text-white/80">
                            {spot.summary}
                          </p>
                        )}
                        {spot.mapLink && (
                          <a
                            href={spot.mapLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-lime-300 hover:text-lime-200"
                          >
                            <MapPin className="w-3 h-3" />
                            {t("worldExplorer.attractions.openInMaps")}
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
