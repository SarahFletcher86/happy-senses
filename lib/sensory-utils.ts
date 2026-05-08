export function getDisplaySensoryValue(value: number | null): number | null {
  if (value === null) return null;
  return Math.max(1, Math.min(5, 6 - value));
}

export function getSensoryLevelLabel(value: number | null): string {
  const displayValue = getDisplaySensoryValue(value);
  if (displayValue === null) return 'Unknown';
  if (displayValue >= 5) return 'Very accommodating';
  if (displayValue >= 4) return 'Calm';
  if (displayValue === 3) return 'Mixed';
  if (displayValue >= 2) return 'More stimulating';
  return 'Most challenging';
}

export function getNoiseDescription(value: number | null): string {
  const displayValue = getDisplaySensoryValue(value);
  if (displayValue === null) return 'Noise level unknown';
  if (displayValue >= 5) return 'Usually very quiet with gentle sound levels.';
  if (displayValue >= 4) return 'Often calm enough for an easier visit.';
  if (displayValue === 3) return 'Noise levels can vary throughout the day.';
  if (displayValue >= 2) return 'Expect a busier sound environment at times.';
  return 'Likely to be loud or echoing.';
}

export function getLightDescription(value: number | null): string {
  const displayValue = getDisplaySensoryValue(value);
  if (displayValue === null) return 'Lighting details unknown';
  if (displayValue >= 5) return 'Lighting is usually calm and low-stimulation.';
  if (displayValue >= 4) return 'Lighting tends to feel soft and manageable.';
  if (displayValue === 3) return 'Lighting can feel typical or mixed.';
  if (displayValue >= 2) return 'Lighting may be bright for some visitors.';
  return 'Lighting is likely intense or overstimulating.';
}

export function getCrowdDescription(value: number | null): string {
  const displayValue = getDisplaySensoryValue(value);
  if (displayValue === null) return 'Crowd level unknown';
  if (displayValue >= 5) return 'Often spacious with room to move comfortably.';
  if (displayValue >= 4) return 'Usually feels calm with lighter foot traffic.';
  if (displayValue === 3) return 'Crowds may depend on the time of day.';
  if (displayValue >= 2) return 'Can get busy and harder to regulate in.';
  return 'Likely to feel crowded or high-traffic.';
}
