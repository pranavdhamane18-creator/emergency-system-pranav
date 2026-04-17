/**
 * Fetch a driving route between two points using the public OSRM API.
 * @param {Object} start {lat, lng}
 * @param {Object} end {lat, lng}
 * @returns {Promise<Array>} Array of [lat, lng] coordinates representing the route geometry.
 */
export async function fetchOSRMRoute(start, end) {
  try {
    // OSRM expects coordinates in lng,lat format
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM Route not found');
    }
    
    // GeoJSON geometries are [lng, lat], Leaflet uses [lat, lng]
    const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
    
    return coordinates;
  } catch (error) {
    console.error("Error fetching route:", error);
    // Fallback: Just return a straight line if API fails
    return [start, end];
  }
}
