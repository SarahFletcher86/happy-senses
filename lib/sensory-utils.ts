/**
 * Happy Senses - Pure Utility Functions
 * These functions don't have Node.js dependencies and can be used in client components
 */

/**
 * Get sensory level label for display
 */
export function getSensoryLevelLabel(value: number | null): string {
  if (value === null) return 'Unknown';
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value === 3) return 'Moderate';
  if (value <= 4) return 'High';
  return 'Very High';
}

/**
 * Get sensory level description for noise
 */
export function getNoiseDescription(value: number | null): string {
  if (value === null) return 'Noise level unknown';
  if (value <= 1) return 'Very quiet - minimal sound';
  if (value <= 2) return 'Quiet - calm environment';
  if (value === 3) return 'Moderate - typical noise levels';
  if (value <= 4) return 'Busy - noticeable noise';
  return 'Loud - high noise environment';
}

/**
 * Get sensory level description for light
 */
export function getLightDescription(value: number | null): string {
  if (value === null) return 'Lighting unknown';
  if (value <= 1) return 'Dim lighting - low stimulation';
  if (value <= 2) return 'Soft lighting - comfortable';
  if (value === 3) return 'Moderate lighting - standard';
  if (value <= 4) return 'Bright lighting - well-lit';
  return 'Very bright - high illumination';
}

/**
 * Get sensory level description for crowd
 */
export function getCrowdDescription(value: number | null): string {
  if (value === null) return 'Crowd level unknown';
  if (value <= 1) return 'Usually empty';
  if (value <= 2) return 'Light crowds';
  if (value === 3) return 'Moderate crowds';
  if (value <= 4) return 'Often crowded';
  return 'Very crowded - high traffic';
}

/**
 * Compute the overall sensory score for a venue (0-100)
 * Lower sensory burden = higher score
 */
export function computeOverallScore(venue: {
  sens_noise_1to5: number | null;
  sens_light_1to5: number | null;
  sens_crowd_1to5: number | null;
  sens_quiet_room: boolean | null;
  sens_headphones: boolean | null;
  sens_staff_trained: boolean | null;
  sens_certification: string | undefined;
  near_water: boolean | null;
  fenced: boolean | null;
}): number {
  // Base score from sensory scales (lower is better, so invert)
  const noise = venue.sens_noise_1to5 ?? 3;
  const light = venue.sens_light_1to5 ?? 3;
  const crowd = venue.sens_crowd_1to5 ?? 3;
  
  // Average of 1-5 scales, inverted to 0-4, then scaled to 0-60
  const sensoryAvg = (noise + light + crowd) / 3;
  const baseScore = ((5 - sensoryAvg) / 4) * 60;
  
  // Bonuses
  let bonus = 0;
  if (venue.sens_quiet_room === true) bonus += 10;
  if (venue.sens_headphones === true) bonus += 8;
  if (venue.sens_staff_trained === true) bonus += 12;
  if (venue.sens_certification) bonus += 10;
  
  // Penalties
  let penalty = 0;
  if (venue.near_water === true && venue.fenced !== true) penalty -= 10;
  if (venue.near_water === true && venue.fenced === true) penalty -= 3;
  
  // Final score bounded 0-100
  const score = Math.round(baseScore + bonus + penalty);
  return Math.max(0, Math.min(100, score));
}
