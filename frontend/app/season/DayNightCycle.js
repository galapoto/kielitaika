/**
 * Simple helper for time-of-day driven tints/brightness.
 */
export function getDayNightState(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 10)
    return { phase: 'dawn', brightness: 0.42, tint: 'rgba(217,196,255,0.12)', stars: true };
  if (hour >= 10 && hour < 17)
    return { phase: 'day', brightness: 0.5, tint: 'rgba(255,255,255,0)', stars: false };
  if (hour >= 17 && hour < 21)
    return { phase: 'twilight', brightness: 0.38, tint: 'rgba(120,180,255,0.14)', stars: true };
  return { phase: 'night', brightness: 0.32, tint: 'rgba(40,70,120,0.18)', stars: true };
}
