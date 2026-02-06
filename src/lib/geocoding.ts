import { City } from './constants';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Reverse geocode coordinates to get city name
export async function reverseGeocode(lat: number, lng: number): Promise<City | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'IftarTimer/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data: NominatimResult = await response.json();
    const address = data.address;

    const cityName =
      address?.city || address?.town || address?.village || 'Unknown';
    const country = address?.country || '';

    // Get timezone from coordinates using browser API or fallback
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      name: cityName,
      country,
      lat,
      lng,
      timezone,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Search for cities by name
export async function searchCities(query: string): Promise<City[]> {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'IftarTimer/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const results: NominatimResult[] = await response.json();

    return results.map((result) => ({
      name:
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        result.display_name.split(',')[0],
      country: result.address?.country || '',
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Approximation
    }));
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
}

// Get timezone for coordinates using a timezone API
export async function getTimezone(lat: number, lng: number): Promise<string> {
  try {
    // Use browser's timezone as fallback - for accurate timezone,
    // you'd need a timezone API or use a library like geo-tz
    // For now, we'll use the browser's timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}
