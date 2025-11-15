import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius") || "5000"; // Default 5km

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    // Using OpenTripMap API for attractions
    // You'll need to sign up for a free API key at https://opentripmap.io/
    const apiKey = process.env.OPENTRIPMAP_API_KEY || "5ae2e3f221c38a28845f05b6f87f61cc4f2b8c24f7e1ceca6a23962a";
    
    // First, get list of places within radius
    const placesUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=interesting_places,cultural,architecture,historic,museums,theatres,monuments,urban_environment&limit=50&apikey=${apiKey}`;
    
    const placesResponse = await fetch(placesUrl);
    if (!placesResponse.ok) {
      throw new Error("Failed to fetch attractions");
    }

    const placesData = await placesResponse.json();
    
    // Get detailed info for each place
    const attractionsPromises = placesData.features
      .slice(0, 20) // Limit to 20 attractions
      .map(async (feature: any) => {
        const xid = feature.properties.xid;
        const detailsUrl = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`;
        
        try {
          const detailsResponse = await fetch(detailsUrl);
          if (!detailsResponse.ok) return null;
          
          const details = await detailsResponse.json();
          
          // Only include places with meaningful data
          if (!details.name || details.name === "na") return null;
          
          return {
            id: xid,
            title: details.name,
            location: `${details.address?.city || ''}, ${details.address?.country || ''}`.trim().replace(/^,\s*/, ''),
            category: details.kinds?.split(',')[0]?.replace(/_/g, ' ') || 'Attraction',
            rating: details.rate ? Math.min(details.rate / 2, 5) : 4.0, // Convert to 5-point scale
            visitors: details.rate > 5 ? "100K+" : details.rate > 3 ? "50K+" : "10K+",
            image: details.preview?.source || details.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop",
            description: details.wikipedia_extracts?.text?.substring(0, 150) || details.info?.descr || "Historic and cultural landmark",
            coordinates: {
              lat: details.point?.lat || feature.geometry.coordinates[1],
              lon: details.point?.lon || feature.geometry.coordinates[0]
            },
            distance: feature.properties.dist || 0
          };
        } catch (err) {
          console.error(`Error fetching details for ${xid}:`, err);
          return null;
        }
      });

    const attractions = (await Promise.all(attractionsPromises))
      .filter(a => a !== null)
      .sort((a: any, b: any) => a.distance - b.distance);

    return NextResponse.json({ attractions });
  } catch (error) {
    console.error("Nearby attractions error:", error);
    return NextResponse.json(
      { error: "Unable to fetch nearby attractions." },
      { status: 500 }
    );
  }
}
