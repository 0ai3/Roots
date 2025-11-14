"use client";

import "leaflet/dist/leaflet.css";

import L, { LatLngBoundsExpression } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";

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

function CityMarkers({ city, freeMode }: { city?: City | null; freeMode: boolean }) {
  if (!city || freeMode) {
    return null;
  }
  return <Marker position={city.coords} />;
}

function normalizeCityBounds(coords: [number, number]): Bounds {
  const [lat, lng] = coords;
  const delta = 1.5;
  return [
    [lat - delta, lng - delta],
    [lat + delta, lng + delta],
  ];
}

export default function WorldExplorerMap() {
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [freeMode, setFreeMode] = useState(false);

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

  const activeBounds = useMemo(() => {
    if (selectedCity) {
      return normalizeCityBounds(selectedCity.coords);
    }
    if (selectedRegion) {
      return selectedRegion.bounds;
    }
    if (selectedCountry) {
      return selectedCountry.bounds;
    }
    if (selectedContinent) {
      return selectedContinent.bounds;
    }
    return WORLD_BOUNDS;
  }, [selectedCity, selectedRegion, selectedCountry, selectedContinent]);

  const availableCountries = selectedContinent?.countries ?? [];
  const availableRegions = selectedCountry?.regions ?? [];
  const availableCities = selectedRegion?.cities ?? [];

  const resetSelections = () => {
    setSelectedContinent(null);
    setSelectedCountry(null);
    setSelectedRegion(null);
    setSelectedCity(null);
    setFreeMode(false);
  };

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "600px", width: "100%" }}
            worldCopyJump
            minZoom={2}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewport bounds={activeBounds} freeMode={freeMode} />
            <CityMarkers city={selectedCity} freeMode={freeMode} />
          </MapContainer>
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">World Explorer</h2>
            <button
              type="button"
              onClick={() => setFreeMode((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                freeMode ? "bg-emerald-400 text-slate-950" : "bg-white/10"
              }`}
            >
              {freeMode ? "Free mode on" : "Enable free mode"}
            </button>
          </div>

          {freeMode ? (
            <p className="mt-4 text-sm text-white/70">
              Free mode lets you pan, zoom, and explore anywhere on the map.
              Disable it to return to guided continent/country navigation.
            </p>
          ) : (
            <p className="mt-4 text-sm text-white/70">
              Select a continent to zoom in. Continue drilling down to countries,
              regions, and cities to focus on specific areas.
            </p>
          )}

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                <span>Continents</span>
                {selectedContinent && (
                  <button
                    type="button"
                    className="text-emerald-300"
                    onClick={() => {
                      setSelectedContinent(null);
                      setSelectedCountry(null);
                      setSelectedRegion(null);
                      setSelectedCity(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {atlas.map((continent) => (
                  <button
                    key={continent.name}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                      selectedContinent?.name === continent.name
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                    }`}
                    onClick={() => {
                      setSelectedContinent(continent);
                      setSelectedCountry(null);
                      setSelectedRegion(null);
                      setSelectedCity(null);
                      setFreeMode(false);
                    }}
                  >
                    {continent.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-white/60">
                Countries
              </div>
              <div className="mt-2 space-y-2">
                {availableCountries.length === 0 && (
                  <p className="text-sm text-white/50">
                    Choose a continent first.
                  </p>
                )}
                {availableCountries.map((country) => (
                  <button
                    key={country.name}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold ${
                      selectedCountry?.name === country.name
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                    }`}
                    onClick={() => {
                      setSelectedCountry(country);
                      setSelectedRegion(null);
                      setSelectedCity(null);
                      setFreeMode(false);
                    }}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-white/60">
                Regions
              </div>
              <div className="mt-2 space-y-2">
                {availableRegions.length === 0 && (
                  <p className="text-sm text-white/50">
                    Select a country to explore regions.
                  </p>
                )}
                {availableRegions.map((region) => (
                  <button
                    key={region.name}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold ${
                      selectedRegion?.name === region.name
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                    }`}
                    onClick={() => {
                      setSelectedRegion(region);
                      setSelectedCity(null);
                      setFreeMode(false);
                    }}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-white/60">
                Cities
              </div>
              <div className="mt-2 space-y-2">
                {availableCities.length === 0 && (
                  <p className="text-sm text-white/50">
                    Pick a region to focus on cities.
                  </p>
                )}
                {availableCities.map((city) => (
                  <button
                    key={city.name}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold ${
                      selectedCity?.name === city.name
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                    }`}
                    onClick={() => {
                      setSelectedCity(city);
                      setFreeMode(false);
                    }}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCity(null);
                setSelectedRegion(null);
                setSelectedCountry(null);
                if (selectedContinent) {
                  setFreeMode(false);
                }
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/40"
            >
              Back a level
            </button>
            <button
              type="button"
              onClick={resetSelections}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Reset explorer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

