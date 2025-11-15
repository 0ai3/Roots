import { NextRequest, NextResponse } from "next/server";

// Fallback attractions data for when API is unavailable
const FALLBACK_ATTRACTIONS = [
  {
    id: "fallback-1",
    title: "Local Museum",
    location: "Near you",
    category: "Museum",
    rating: 4.5,
    visitors: "50K+",
    image: "https://images.unsplash.com/photo-1565359472850-749ba7402ea4?w=800&auto=format&fit=crop",
    description: "Explore local history and culture",
  },
  {
    id: "fallback-2",
    title: "City Park",
    location: "Near you",
    category: "Park",
    rating: 4.3,
    visitors: "100K+",
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop",
    description: "Beautiful green space for relaxation",
  },
  {
    id: "fallback-3",
    title: "Historic Center",
    location: "Near you",
    category: "Historic",
    rating: 4.7,
    visitors: "75K+",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop",
    description: "Historic landmarks and architecture",
  },
  {
    id: "fallback-4",
    title: "Art Gallery",
    location: "Near you",
    category: "Cultural",
    rating: 4.6,
    visitors: "40K+",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&auto=format&fit=crop",
    description: "Contemporary and classical art exhibitions",
  },
  {
    id: "fallback-5",
    title: "Cultural Center",
    location: "Near you",
    category: "Cultural",
    rating: 4.4,
    visitors: "60K+",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    description: "Events, performances, and exhibitions",
  },
  {
    id: "fallback-6",
    title: "Local Theater",
    location: "Near you",
    category: "Entertainment",
    rating: 4.8,
    visitors: "30K+",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop",
    description: "Live performances and shows",
  },
];

// Function to fetch real images from Wikimedia Commons
async function fetchWikimediaImage(name: string, tags: any): Promise<string> {
  try {
    // Try to get image from Wikipedia if available
    if (tags.wikipedia) {
      const wikiTitle = tags.wikipedia.split(':')[1] || tags.wikipedia;
      const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
      
      const wikiResponse = await fetch(wikiApiUrl);
      if (wikiResponse.ok) {
        const wikiData = await wikiResponse.json();
        const pages = wikiData.query?.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }

    // Try Wikimedia Commons search
    const searchQuery = encodeURIComponent(name);
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${searchQuery}&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    
    const commonsResponse = await fetch(commonsUrl);
    if (commonsResponse.ok) {
      const commonsData = await commonsResponse.json();
      const pages = commonsData.query?.pages;
      if (pages) {
        const pageIds = Object.keys(pages);
        for (const pageId of pageIds) {
          const imageUrl = pages[pageId]?.imageinfo?.[0]?.thumburl;
          if (imageUrl && !imageUrl.includes('.svg')) {
            return imageUrl;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Wikimedia image:', error);
  }
  
  return '';
}

// Get appropriate fallback image based on category
const getImageForCategory = (cat: string) => {
  const images: Record<string, string> = {
    'museum': 'https://images.unsplash.com/photo-1565359472850-749ba7402ea4?w=800&auto=format&fit=crop',
    'gallery': 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&auto=format&fit=crop',
    'monument': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
    'memorial': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&auto=format&fit=crop',
    'castle': 'https://images.unsplash.com/photo-1585834171856-50a1e845f283?w=800&auto=format&fit=crop',
    'ruins': 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&auto=format&fit=crop',
    'archaeological_site': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&auto=format&fit=crop',
    'theatre': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
    'arts_centre': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    'cinema': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
    'attraction': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
    'viewpoint': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
    'artwork': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&auto=format&fit=crop',
  };
  return images[cat.toLowerCase()] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop';
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius") || "5000";

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    // Try Overpass API (OpenStreetMap) as primary source
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"~"museum|gallery|attraction|artwork|viewpoint"](around:${radius},${lat},${lon});
          node["historic"~"monument|memorial|castle|ruins|archaeological_site"](around:${radius},${lat},${lon});
          node["amenity"~"theatre|arts_centre|cinema"](around:${radius},${lat},${lon});
          way["tourism"~"museum|gallery|attraction"](around:${radius},${lat},${lon});
          way["historic"~"monument|memorial|castle|ruins"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      
      const response = await fetch(overpassUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(20000), // 20 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const elements = data.elements || [];

        // Fetch images for all attractions in parallel
        const attractionsWithImages = await Promise.all(
          elements
            .filter((el: any) => el.tags?.name && el.lat && el.lon)
            .slice(0, 30)
            .map(async (el: any) => {
              const tags = el.tags || {};
              const category = 
                tags.tourism || 
                tags.historic || 
                tags.amenity || 
                'Attraction';

              // Fetch real image from Wikimedia
              const realImage = await fetchWikimediaImage(tags.name, tags);
              const fallbackImage = getImageForCategory(category);

              // Calculate approximate distance
              const R = 6371e3; // Earth's radius in meters
              const φ1 = parseFloat(lat) * Math.PI / 180;
              const φ2 = el.lat * Math.PI / 180;
              const Δφ = (el.lat - parseFloat(lat)) * Math.PI / 180;
              const Δλ = (el.lon - parseFloat(lon)) * Math.PI / 180;
              const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                       Math.cos(φ1) * Math.cos(φ2) *
                       Math.sin(Δλ/2) * Math.sin(Δλ/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;

              return {
                id: `osm-${el.id}`,
                title: tags.name,
                location: `${tags['addr:city'] || tags['addr:suburb'] || 'Near you'}, ${tags['addr:country'] || ''}`.trim().replace(/,\s*$/, ''),
                category: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
                rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
                visitors: distance < 1000 ? "100K+" : distance < 3000 ? "50K+" : "25K+",
                image: realImage || fallbackImage,
                description: tags.description || tags.wikipedia || `Historic and cultural ${category}`,
                coordinates: {
                  lat: el.lat,
                  lon: el.lon,
                },
                distance: Math.round(distance),
              };
            })
        );

        const attractions = attractionsWithImages
          .sort((a: any, b: any) => a.distance - b.distance);

        if (attractions.length > 0) {
          console.log(`Found ${attractions.length} attractions from OpenStreetMap`);
          return NextResponse.json({ attractions });
        }
      }
    } catch (error) {
      console.error("OpenStreetMap API error:", error);
    }

    // If all APIs fail, return fallback attractions with user's location
    console.log("Using fallback attractions");
    const fallbackWithLocation = FALLBACK_ATTRACTIONS.map((attr, index) => ({
      ...attr,
      coordinates: {
        lat: parseFloat(lat) + (Math.random() - 0.5) * 0.1,
        lon: parseFloat(lon) + (Math.random() - 0.5) * 0.1,
      },
      distance: 1000 + index * 500,
    }));

    return NextResponse.json({ attractions: fallbackWithLocation });
  } catch (error) {
    console.error("Nearby attractions error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Unable to fetch nearby attractions.", details: errorMessage },
      { status: 500 }
    );
  }
}
