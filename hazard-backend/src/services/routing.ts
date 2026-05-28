// src/services/routing.ts
import axios from 'axios';
import { db } from '../config/database';
import { env } from '../config/env';
import { haversineKm } from '../utils/nickname';

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteResult {
  safeRoute: GeoJSONLineString | null;
  fastestRoute: GeoJSONLineString | null;
  safeDistance: number;       // km
  fastestDistance: number;    // km
  safeDuration: number;       // seconds
  fastestDuration: number;    // seconds
  hazardsOnFastest: ActiveHazard[];
  hazardsOnSafe: ActiveHazard[];
}

interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];  // [lng, lat]
}

interface ActiveHazard {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string | null;
}

/**
 * Decode a polyline encoded string (used by OSRM) into [lng, lat] pairs.
 */
function decodePolyline(encoded: string, precision = 5): [number, number][] {
  const factor = Math.pow(10, precision);
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lng / factor, lat / factor]);
  }
  return coords;
}

/**
 * Fetch a route from OSRM and return the decoded geometry with metadata.
 */
async function fetchOsrmRoute(
  start: Coordinate,
  end: Coordinate,
  exclude: string = ''
): Promise<{ geometry: GeoJSONLineString; distance: number; duration: number } | null> {
  const url =
    `${env.OSRM_BASE_URL}/route/v1/foot/` +
    `${start.lng},${start.lat};${end.lng},${end.lat}` +
    `?overview=full&geometries=polyline`;

  try {
    const { data } = await axios.get(url, { timeout: 8000 });
    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    const coords = decodePolyline(route.geometry);
    return {
      geometry: { type: 'LineString', coordinates: coords },
      distance: route.distance / 1000, // metres → km
      duration: route.duration,         // seconds
    };
  } catch {
    return null;
  }
}

/**
 * Check which active hazards are within HAZARD_AVOIDANCE_RADIUS_METERS of any
 * point on the given route geometry.
 */
async function findHazardsNearRoute(
  coords: [number, number][],
  radiusKm: number
): Promise<ActiveHazard[]> {
  const now = new Date();
  const hazards = await db.hazardReport.findMany({
    where: { isActive: true, expiresAt: { gt: now } },
    select: { id: true, category: true, latitude: true, longitude: true, description: true },
  });

  const nearby: ActiveHazard[] = [];
  for (const hazard of hazards) {
    const onRoute = coords.some(([lng, lat]) =>
      haversineKm(lat, lng, hazard.latitude, hazard.longitude) <= radiusKm
    );
    if (onRoute) nearby.push({ ...hazard, category: hazard.category.toString() });
  }
  return nearby;
}

/**
 * Main entry point: returns both a safe route (avoiding hazard zones) and the
 * fastest raw route, together with hazard warnings for each.
 *
 * Strategy for "safe" route:
 *   1. Fetch the fastest route from OSRM.
 *   2. Identify hazards near that route.
 *   3. If there are hazards, build a set of "via waypoints" that steer clear
 *      by offsetting the route slightly (simple bearing-based nudge).
 *      For a production system, use OSRM's `exclude` areas or Mapbox avoid polygons.
 *   4. Return both routes with hazard lists attached.
 */
export async function calculateRoutes(
  start: Coordinate,
  end: Coordinate
): Promise<RouteResult> {
  const radiusKm = env.HAZARD_AVOIDANCE_RADIUS_METERS / 1000;

  // 1. Fastest route (no adjustments)
  const fastest = await fetchOsrmRoute(start, end);

  const result: RouteResult = {
    safeRoute: null,
    fastestRoute: fastest?.geometry ?? null,
    safeDistance: 0,
    fastestDistance: fastest?.distance ?? 0,
    safeDuration: 0,
    fastestDuration: fastest?.duration ?? 0,
    hazardsOnFastest: [],
    hazardsOnSafe: [],
  };

  if (fastest) {
    result.hazardsOnFastest = await findHazardsNearRoute(
      fastest.geometry.coordinates,
      radiusKm
    );
  }

  // 2. If there are no hazards on the fastest route, it IS the safe route.
  if (!result.hazardsOnFastest.length) {
    result.safeRoute = result.fastestRoute;
    result.safeDistance = result.fastestDistance;
    result.safeDuration = result.fastestDuration;
    result.hazardsOnSafe = [];
    return result;
  }

  // 3. Build an alternate via-point that steers around hazard centroids.
  //    This is a heuristic: compute the centroid of hazard cluster and
  //    add a perpendicular offset waypoint between start and end.
  const hazardCentroidLat =
    result.hazardsOnFastest.reduce((s, h) => s + h.latitude, 0) /
    result.hazardsOnFastest.length;
  const hazardCentroidLng =
    result.hazardsOnFastest.reduce((s, h) => s + h.longitude, 0) /
    result.hazardsOnFastest.length;

  // Perpendicular offset (push waypoint ~200 m away from hazard centroid)
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const dLat = midLat - hazardCentroidLat;
  const dLng = midLng - hazardCentroidLng;
  const dist = Math.sqrt(dLat ** 2 + dLng ** 2) || 0.001;
  const offsetDeg = (env.HAZARD_AVOIDANCE_RADIUS_METERS * 2) / 111_320;
  const viaPoint: Coordinate = {
    lat: midLat + (dLat / dist) * offsetDeg,
    lng: midLng + (dLng / dist) * offsetDeg,
  };

  // Fetch a two-leg route through the via point
  const [leg1, leg2] = await Promise.all([
    fetchOsrmRoute(start, viaPoint),
    fetchOsrmRoute(viaPoint, end),
  ]);

  if (leg1 && leg2) {
    const safeCoords: [number, number][] = [
      ...leg1.geometry.coordinates,
      ...leg2.geometry.coordinates,
    ];
    result.safeRoute = { type: 'LineString', coordinates: safeCoords };
    result.safeDistance = leg1.distance + leg2.distance;
    result.safeDuration = leg1.duration + leg2.duration;
    result.hazardsOnSafe = await findHazardsNearRoute(safeCoords, radiusKm);
  } else {
    // Fallback: return the fastest route as safe if detour fails
    result.safeRoute = result.fastestRoute;
    result.safeDistance = result.fastestDistance;
    result.safeDuration = result.fastestDuration;
    result.hazardsOnSafe = result.hazardsOnFastest;
  }

  return result;
}
