// Salem Geolocation & Boundary Utilities
// Center point: Salem District Hub (11.6643 N, 78.1460 E)
export const SALEM_CENTER = {
  lat: 11.6643,
  lng: 78.1460,
  maxRadiusKm: 38.0 // Encompasses Salem City, Suramangalam, Hasthampatti, Ammapet, Omalur, Attur
};

export const SALEM_LOCALITIES = [
  { name: 'Fairlands', pin: '636016', lat: 11.6738, lng: 78.1460 },
  { name: 'Hasthampatti', pin: '636007', lat: 11.6780, lng: 78.1630 },
  { name: 'Alagapuram', pin: '636004', lat: 11.6795, lng: 78.1380 },
  { name: 'Suramangalam / Junction', pin: '636005', lat: 11.6720, lng: 78.1150 },
  { name: 'Meyyanur', pin: '636004', lat: 11.6660, lng: 78.1340 },
  { name: 'Ammapet', pin: '636003', lat: 11.6540, lng: 78.1750 },
  { name: 'Shevapet', pin: '636002', lat: 11.6480, lng: 78.1420 },
  { name: 'Gugai', pin: '636006', lat: 11.6390, lng: 78.1520 },
  { name: 'Kondalampatti', pin: '636010', lat: 11.6180, lng: 78.1330 },
  { name: 'Kannankurichi (Yercaud Foothills)', pin: '636008', lat: 11.7100, lng: 78.1820 },
  { name: 'Gorimedu', pin: '636008', lat: 11.7050, lng: 78.1640 },
  { name: 'Steel Plant Area', pin: '636013', lat: 11.6420, lng: 78.0750 }
];

/**
 * Calculates geodesic distance in kilometers between two coordinates
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((6371 * c).toFixed(1));
}

/**
 * Checks whether a given coordinate, pincode, or place is inside Salem service zone
 */
export function verifySalemBoundary({ lat, lng, pincode, city, district }) {
  const distanceKm = (lat && lng)
    ? calculateDistanceKm(lat, lng, SALEM_CENTER.lat, SALEM_CENTER.lng)
    : null;

  const isPinSalem = pincode ? String(pincode).trim().startsWith('636') : false;
  const isCitySalem = (city && /salem/i.test(city)) || (district && /salem/i.test(district));
  const isDistanceWithinSalem = distanceKm !== null && distanceKm <= SALEM_CENTER.maxRadiusKm;

  const isSalem = Boolean(isDistanceWithinSalem || isPinSalem || isCitySalem);

  return {
    isSalem,
    distanceKmFromCenter: distanceKm,
    isPinSalem,
    isCitySalem
  };
}

/**
 * Reverse geocodes coordinates using OpenStreetMap Nominatim with fallback
 */
export async function reverseGeocodeCoords(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Unknown Area';
      const district = addr.state_district || addr.county || city;
      const suburb = addr.suburb || addr.neighbourhood || addr.road || '';
      const state = addr.state || 'Tamil Nadu';
      const pincode = addr.postcode || '';

      const boundary = verifySalemBoundary({ lat, lng, pincode, city, district });

      const localityName = suburb ? `${suburb}, ${city}` : city;
      const fullDisplay = data.display_name || `${localityName}, ${state}`;

      return {
        lat,
        lng,
        city,
        district,
        state,
        pincode,
        localityName,
        fullAddress: fullDisplay,
        ...boundary
      };
    }
  } catch (e) {
    console.warn('Reverse geocode lookup error or timeout:', e);
  }

  // Fallback boundary check purely based on distance to Salem Center
  const boundary = verifySalemBoundary({ lat, lng });
  return {
    lat,
    lng,
    city: boundary.isSalem ? 'Salem' : 'Outside Salem',
    district: boundary.isSalem ? 'Salem District' : 'Outside Salem Region',
    state: 'Tamil Nadu',
    pincode: boundary.isSalem ? '636016' : '',
    localityName: boundary.isSalem ? 'Salem Area' : `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    fullAddress: `GPS Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    ...boundary
  };
}

/**
 * Gets high accuracy browser GPS coordinates and parses Salem service eligibility
 */
export async function getLiveAccurateLocation() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const geocoded = await reverseGeocodeCoords(latitude, longitude);
          resolve({
            ...geocoded,
            accuracyMeters: Math.round(accuracy)
          });
        } catch (err) {
          reject(err);
        }
      },
      (err) => {
        let msg = 'Unable to retrieve location';
        if (err.code === 1) msg = 'Location access was denied';
        else if (err.code === 2) msg = 'Location position unavailable';
        else if (err.code === 3) msg = 'Location request timed out';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
    );
  });
}
