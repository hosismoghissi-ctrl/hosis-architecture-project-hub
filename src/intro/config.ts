export const INTRO = {
  sessionKey: 'hosis-cinematic-seen-v1',
  duration: 12000,
  styleUrl: 'https://tiles.openfreemap.org/styles/dark',
  destination: {
    label: '88 Charles Street, Toronto',
    // Artistic demo anchor, not a geocoded address or a surveyed building.
    coordinates: [-79.3852, 43.6694] as [number, number],
    subtitle: 'Demonstration location',
  },
  cnTower: [-79.3871, 43.6426] as [number, number],
};

export type Shot = { at: number; center: [number, number]; zoom: number; pitch: number; bearing: number };
export const SHOTS: Shot[] = [
  { at: 0, center: [-30, 22], zoom: 0.3, pitch: 0, bearing: 0 },
  { at: 2200, center: [-93, 47], zoom: 2.2, pitch: 0, bearing: -8 },
  { at: 4200, center: [-79.55, 44.02], zoom: 7.0, pitch: 12, bearing: -12 },
  { at: 6400, center: [-79.388, 43.647], zoom: 14.4, pitch: 58, bearing: -24 },
  { at: 8500, center: [-79.385, 43.649], zoom: 15.4, pitch: 64, bearing: 0 },
  { at: 11000, center: INTRO.destination.coordinates, zoom: 17.1, pitch: 59, bearing: 24 },
  { at: 12000, center: INTRO.destination.coordinates, zoom: 17.2, pitch: 59, bearing: 28 },
];

export function cameraAt(time: number, mobile: boolean) {
  const t = Math.max(0, Math.min(INTRO.duration, time));
  const end = SHOTS.findIndex(shot => shot.at >= t);
  const b = SHOTS[Math.max(1, end < 0 ? SHOTS.length - 1 : end)];
  const a = SHOTS[Math.max(0, (end < 0 ? SHOTS.length - 1 : end) - 1)];
  const fraction = Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at)));
  const ease = fraction * fraction * (3 - 2 * fraction);
  const mix = (x: number, y: number) => x + (y - x) * ease;
  return {
    center: [mix(a.center[0], b.center[0]), mix(a.center[1], b.center[1])] as [number, number],
    zoom: mix(a.zoom, b.zoom) - (mobile ? 0.55 : 0),
    pitch: mix(a.pitch, b.pitch), bearing: mix(a.bearing, b.bearing),
  };
}

export function stageAt(time: number) {
  return time < 2200 ? 0 : time < 4200 ? 1 : time < 8500 ? 2 : 3;
}
