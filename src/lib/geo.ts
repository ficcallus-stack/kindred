/**
 * Marketplace Pulse: High-Fidelity Geocoding Engine
 * Bridges IP-telemetry and Text-based locations into spatial coordinates.
 */
export class GeoEngine {
  private static MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  /**
   * Resolve Latitude/Longitude from a Client IP address.
   * Low-UX fallback for guests and users with incomplete profiles.
   */
  static async getCoordsFromIP(ip: string): Promise<{ lat: number; lng: number } | null> {
    if (!ip || ip === "::1" || ip === "127.0.0.1") return null;

    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,lat,lon,countryCode`);
      const data = await res.json();
      
      if (data.status === "success" && data.countryCode === "US") {
        return { lat: data.lat, lng: data.lon };
      }
      return null;
    } catch (e) {
      console.error("[GEO] IP Resolve Failure:", e);
      return null;
    }
  }

  /**
   * Resolve Latitude/Longitude from a text location (Zip, Area, City).
   * Primary engine for Profile and Search telemetry.
   */
  static async geocode(query: string): Promise<{ lat: number; lng: number; label?: string } | null> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!query || !token) {
      console.warn("[GEO] Missing query or MAPBOX_TOKEN", { query, hasToken: !!token });
      return null;
    }

    try {
      const safeQuery = String(query).trim();

      // 1. Zippopotam Fast-Path for 5-digit US Zipcodes (Extremely Reliable)
      if (/^\d{5}$/.test(safeQuery)) {
        try {
          const zipRes = await fetch(`http://api.zippopotam.us/us/${safeQuery}`);
          if (zipRes.ok) {
            const zipData = await zipRes.json();
            if (zipData.places && zipData.places.length > 0) {
              const place = zipData.places[0];
              return { 
                lat: parseFloat(place.latitude), 
                lng: parseFloat(place.longitude),
                label: `${place["place name"]}, ${place["state"]} ${safeQuery}`
              };
            }
          }
        } catch (ze) {
          console.warn("[GEO] Zippopotam resolution failed, falling back to Mapbox.", ze);
        }
      }

      // 2. Mapbox Fallback (For cities, areas, or failed zips)
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(safeQuery)}.json`;
      const url = `${endpoint}?access_token=${token}&limit=1&country=US&types=postcode,place,locality`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { 
          lat, 
          lng,
          label: data.features[0].place_name 
        };
      }
      return null;
    } catch (e) {
      console.error("[GEO] Geocode Failure:", e);
      return null;
    }
  }
}
