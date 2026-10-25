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
 * Calculates geodesic distance in kilometers between two coordinates using Haversine formula
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
 * Finds the nearest recognized Salem locality and its distance in km
 */
export function findNearestSalemLocality(lat, lng) {
  let closest = SALEM_LOCALITIES[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < SALEM_LOCALITIES.length; i++) {
    const loc = SALEM_LOCALITIES[i];
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return {
    ...closest,
    distanceKm: minDistance
  };
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
 * Reverse geocodes coordinates with dual providers and Salem locality snapping
 */
export async function reverseGeocodeCoords(lat, lng) {
  const nearestSalem = findNearestSalemLocality(lat, lng);
  let resolvedCity = '';
  let resolvedDistrict = '';
  let resolvedSuburb = '';
  let resolvedState = 'Tamil Nadu';
  let resolvedPincode = '';
  let fullDisplay = '';

  // 1. Primary: BigDataCloud Client Reverse Geocode API (CORS friendly, fast, accurate city/taluk)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      resolvedCity = data.city || data.locality || '';
      resolvedState = data.principalSubdivision || 'Tamil Nadu';
      resolvedPincode = data.postcode || '';

      if (data.localityInfo && Array.isArray(data.localityInfo.administrative)) {
        const adminList = data.localityInfo.administrative;
        const distObj = adminList.find(a => /district/i.test(a.description || a.name || ''));
        if (distObj) resolvedDistrict = distObj.name;
        const talukObj = adminList.find(a => /taluk/i.test(a.name || ''));
        if (talukObj) resolvedSuburb = talukObj.name.replace(/taluk/i, '').trim();
      }
    }
  } catch (err) {
    // BigDataCloud fallback - continue to Nominatim
  }

  // 2. Secondary: OpenStreetMap Nominatim with zoom 16 (neighborhood level)
  if (!resolvedCity || !resolvedSuburb) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (nomRes.ok) {
        const data = await nomRes.json();
        const addr = data.address || {};
        if (!resolvedCity) {
          resolvedCity = addr.city || addr.town || addr.village || addr.municipality || '';
        }
        if (!resolvedDistrict) {
          resolvedDistrict = addr.state_district || addr.county || resolvedCity;
        }
        if (!resolvedSuburb) {
          resolvedSuburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
        }
        if (!resolvedPincode) {
          resolvedPincode = addr.postcode || '';
        }
        fullDisplay = data.display_name || '';
      }
    } catch (err) {
      // Nominatim timeout or error handled by fallbacks below
    }
  }

  // 3. Boundary & Salem Service Eligibility Evaluation
  const boundary = verifySalemBoundary({
    lat,
    lng,
    pincode: resolvedPincode,
    city: resolvedCity,
    district: resolvedDistrict
  });

  // 4. Locality Name Resolution & Snapping
  let finalLocality = '';
  let finalPincode = resolvedPincode;

  if (boundary.isSalem) {
    // If within 6 km of a recognized Salem locality hub, snap to official locality name
    if (nearestSalem.distanceKm <= 6.0) {
      finalLocality = nearestSalem.name;
      if (!finalPincode || !finalPincode.startsWith('636')) {
        finalPincode = nearestSalem.pin;
      }
    } else if (resolvedSuburb) {
      finalLocality = resolvedSuburb;
      if (!finalPincode) finalPincode = '636016';
    } else {
      finalLocality = 'Fairlands';
      finalPincode = '636016';
    }
    resolvedCity = 'Salem';
    resolvedDistrict = 'Salem District';
  } else {
    finalLocality = resolvedSuburb || resolvedCity || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  const localityDisplay = boundary.isSalem ? `${finalLocality}, Salem` : finalLocality;
  const addressLine = fullDisplay || `${localityDisplay}${finalPincode ? ' - ' + finalPincode : ''}, ${resolvedState}`;

  return {
    lat,
    lng,
    city: resolvedCity || (boundary.isSalem ? 'Salem' : 'Outside Salem'),
    district: resolvedDistrict || (boundary.isSalem ? 'Salem District' : 'Outside Salem'),
    state: resolvedState,
    pincode: finalPincode,
    localityName: finalLocality,
    localityDisplay,
    fullAddress: addressLine,
    nearestSalemLocality: nearestSalem,
    suggestedSalemLocality: {
      name: 'Fairlands',
      pin: '636016',
      lat: 11.6738,
      lng: 78.1460,
      display: 'Fairlands, Salem'
    },
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
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}
