/**
 * OpenStreetMap Nominatim Reverse Geocoding & Browser Geolocation Engine
 * 
 * Data: (c) OpenStreetMap contributors, ODbL 1.0
 * Terms & Attribution: https://www.openstreetmap.org/copyright
 * No external API key required. Operates directly on the client.
 */

const geocodeCache = new Map();

/**
 * Capture high-precision coordinates using native Browser Geolocation API
 * @param {Object} options - Geolocation position options
 * @returns {Promise<{ lat: number, lng: number, accuracy: number }>}
 */
export async function getBrowserCoordinates(options = {}) {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0)
        });
      },
      (error) => {
        let message = 'Unable to acquire location coordinates';
        if (error.code === 1) {
          message = 'Location access permission was denied. Please allow location access in your browser settings.';
        } else if (error.code === 2) {
          message = 'Location position is currently unavailable. Please check your device GPS.';
        } else if (error.code === 3) {
          message = 'Location request timed out. Please try again.';
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

/**
 * Reverse geocode latitude/longitude coordinates to a street-level address
 * using OpenStreetMap Nominatim API (Zoom level 18 for building/doorstep level)
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Structured address object with OSM attribution
 */
export async function reverseGeocodeNominatim(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Valid numeric latitude and longitude coordinates are required');
  }

  // Cache key rounded to ~11 meters to prevent duplicate queries
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nominatim service responded with status ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || '';
    const houseNumber = addr.house_number || addr.building || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdivision || '';
    const city = addr.city || addr.town || addr.village || addr.municipality || 'Salem';
    const district = addr.state_district || addr.county || 'Salem District';
    const state = addr.state || 'Tamil Nadu';
    const pincode = addr.postcode || '';

    // Build short street/locality label
    const shortLabelParts = [road, suburb, city].filter(Boolean);
    const shortLabel = shortLabelParts.length > 0 ? shortLabelParts.join(', ') : `${city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    const result = {
      lat,
      lng,
      road,
      houseNumber,
      suburb,
      city,
      district,
      state,
      pincode,
      shortLabel,
      displayName: data.display_name || shortLabel,
      osmId: data.osm_id || null,
      osmType: data.osm_type || null,
      licence: data.licence || 'Data (c) OpenStreetMap contributors, ODbL 1.0',
      attributionText: 'Location data (c) OpenStreetMap contributors',
      attributionUrl: 'https://www.openstreetmap.org/copyright'
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('OpenStreetMap Nominatim reverse geocode note:', err.message);

    // Clean fallback result
    const fallback = {
      lat,
      lng,
      road: '',
      houseNumber: '',
      suburb: '',
      city: 'Salem',
      district: 'Salem District',
      state: 'Tamil Nadu',
      pincode: '636016',
      shortLabel: `Salem (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      displayName: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Salem, Tamil Nadu`,
      licence: 'Data (c) OpenStreetMap contributors, ODbL 1.0',
      attributionText: 'Location data (c) OpenStreetMap contributors',
      attributionUrl: 'https://www.openstreetmap.org/copyright'
    };
    return fallback;
  }
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinate pairs
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates two-wheeler travel time in Salem traffic (assumes average 25 km/h in city roads)
 */
export function estimateTransitTimeMins(distanceKm, averageSpeedKmh = 25) {
  if (!distanceKm || distanceKm <= 0.1) return 2;
  const timeHours = distanceKm / averageSpeedKmh;
  const mins = Math.ceil(timeHours * 60) + 3; // +3 minutes traffic/junction buffer
  return Math.max(mins, 3);
}
