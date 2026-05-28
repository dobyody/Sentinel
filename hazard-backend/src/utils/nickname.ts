// src/utils/nickname.ts

const ADJECTIVES = [
  'Silent', 'Wandering', 'Brave', 'Quiet', 'Hidden',
  'Swift', 'Vigilant', 'Unknown', 'Masked', 'Shadowed',
  'Roaming', 'Alert', 'Watchful', 'Nimble', 'Unseen',
];

const NOUNS = [
  'Citizen', 'Guardian', 'Scout', 'Watcher', 'Reporter',
  'Observer', 'Sentinel', 'Lookout', 'Ranger', 'Patrol',
  'Agent', 'Witness', 'Tracker', 'Pilot', 'Navigator',
];

/**
 * Generate a random anonymous nickname like "Silent Watcher #3847"
 */
export function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000–9999
  return `${adj} ${noun} #${number}`;
}

/**
 * Convert metres to degrees of latitude (approximate, for bounding-box queries).
 */
export function metersToDegrees(meters: number): number {
  return meters / 111_320;
}

/**
 * Haversine distance between two lat/lng points, returned in kilometres.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
