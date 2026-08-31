import { Map, setWorkerUrl, type StyleSpecification, type ExpressionSpecification } from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { INTRO, cameraAt } from './config';
import { landmarkLayer } from './landmarks';

// Bundle MapLibre 6's module worker, including its shared imports, for subpath hosting.
setWorkerUrl(mapWorkerUrl);

const cities = [
  ['Toronto', -79.3832, 43.6532], ['Montréal', -73.5673, 45.5019],
  ['Vancouver', -123.1207, 49.2827], ['New York', -74.006, 40.7128],
  ['London', -.1276, 51.5072], ['Paris', 2.3522, 48.8566],
  ['Tokyo', 139.6917, 35.6895], ['Sydney', 151.2093, -33.8688],
];

export async function createMapScene(container: HTMLDivElement, signal: AbortSignal) {
  const response = await fetch(INTRO.styleUrl, { signal });
  if (!response.ok) throw new Error('Map style unavailable');
  const style: StyleSpecification = await response.json();
  style.layers = style.layers.filter(layer => layer.type !== 'symbol' && layer.type !== 'fill-extrusion');
  for (const layer of style.layers) {
    if (layer.type === 'background') layer.paint = { 'background-color': '#101e2b' };
    if (layer.id.includes('water') && layer.type === 'fill') layer.paint = { ...layer.paint, 'fill-color': '#06111e' };
    if (layer.type === 'raster') layer.paint = { ...layer.paint, 'raster-opacity': .12, 'raster-saturation': -1 };
    if (layer.type === 'line' && layer.id.includes('road')) layer.paint = { ...layer.paint, 'line-color': '#52758c', 'line-opacity': .42 };
    if (layer.type === 'fill' && /park|landcover|landuse/.test(layer.id)) layer.paint = { ...layer.paint, 'fill-color': '#182c36' };
  }
  const map = new Map({
    container, style, ...cameraAt(0, innerWidth < 640),
    interactive: false, attributionControl: { compact: true },
    canvasContextAttributes: { antialias: innerWidth > 640 },
    maxPitch: 70, renderWorldCopies: false,
  });
  let ready = false;
  const aborted = () => map.remove();
  signal.addEventListener('abort', aborted, { once: true });

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => { if (!ready) reject(new Error('Map loading timeout')); }, 10000);
    map.once('load', () => { ready = true; clearTimeout(timeout); resolve(); });
    signal.addEventListener('abort', () => { clearTimeout(timeout); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    map.on('error', event => {
      if (!ready && /WebGL|context|style/i.test(event.error.message)) { clearTimeout(timeout); reject(event.error); }
    });
  });
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  map.setProjection({ type: 'globe' });
  map.setLight({ anchor: 'viewport', color: '#b9d4ea', intensity: .65, position: [1.4, 200, 35] });

  map.addSource('hosis-cities', { type: 'geojson', data: {
    type: 'FeatureCollection', features: cities.map(([name, lng, lat], i) => ({
      type: 'Feature', id: i, properties: { name, order: i }, geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
    })),
  } });
  map.addLayer({ id: 'city-halos', type: 'circle', source: 'hosis-cities', maxzoom: 11, paint: {
    'circle-radius': 14, 'circle-color': '#80d8ff', 'circle-blur': 1, 'circle-opacity': .45,
  } });
  map.addLayer({ id: 'city-points', type: 'circle', source: 'hosis-cities', maxzoom: 11, paint: {
    'circle-radius': 2.4, 'circle-color': '#c4f4ff', 'circle-stroke-color': '#81c4e6', 'circle-stroke-width': 1,
  } });
  map.addSource('hosis-buildings', { type: 'vector', url: 'https://tiles.openfreemap.org/planet' });
  map.addLayer({ id: 'hosis-buildings', source: 'hosis-buildings', 'source-layer': 'building',
    type: 'fill-extrusion', minzoom: 13, filter: ['!=', ['get', 'hide_3d'], true], paint: {
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-color': '#2c4658', 'fill-extrusion-opacity': .97, 'fill-extrusion-vertical-gradient': true,
    },
  });
  map.addSource('hosis-route', { type: 'geojson', lineMetrics: true, data: { type: 'Feature', properties: {}, geometry: {
    type: 'LineString', coordinates: [[-79.3871,43.6426],[-79.3845,43.646],[-79.3805,43.6515],[-79.3861,43.662],INTRO.destination.coordinates],
  } } });
  map.addLayer({ id: 'hosis-route-glow', type: 'line', source: 'hosis-route', minzoom: 12, paint: { 'line-color': '#71d1fc', 'line-width': 8, 'line-blur': 7, 'line-opacity': .3 } });
  map.addLayer({ id: 'hosis-route', type: 'line', source: 'hosis-route', minzoom: 12, paint: { 'line-color': '#b2e8ff', 'line-width': 1.2, 'line-opacity': .8 } });
  map.addLayer(landmarkLayer());
  let lastLightStep = -1;

  return {
    map,
    update(time: number) {
      map.jumpTo(cameraAt(time, innerWidth < 640));
      const step = Math.floor(time / 160);
      if (step !== lastLightStep) {
        lastLightStep = step;
        const brightness = .35 + .35 * Math.sin(time / 800);
        map.setPaintProperty('city-halos', 'circle-opacity', brightness);
        const threshold = Math.max(65, 350 - Math.max(0, time - 6200) / 15);
        map.setPaintProperty('hosis-buildings', 'fill-extrusion-color', [
          'case', ['>', ['coalesce', ['get', 'render_height'], 0], threshold], '#c4ad80', '#2d4b60',
        ] as ExpressionSpecification);
        map.setPaintProperty('hosis-route', 'line-gradient', ['step', ['line-progress'], '#b2e8ff', Math.max(.001, Math.min(.999, (time - 6500) / 4200)), 'rgba(100,180,220,0)']);
      }
    },
    remove() { signal.removeEventListener('abort', aborted); map.remove(); },
  };
}
