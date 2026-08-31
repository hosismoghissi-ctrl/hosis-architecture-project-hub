import * as THREE from 'three';
import { MercatorCoordinate, type CustomLayerInterface, type Map as MapLibreMap } from 'maplibre-gl';
import { INTRO } from './config';

// Schematic landmark silhouettes, not photogrammetry or surveyed building models.
export function landmarkLayer(): CustomLayerInterface {
  let renderer: THREE.WebGLRenderer;
  let map: MapLibreMap;
  const camera = new THREE.Camera();
  const tower = new THREE.Scene();
  const project = new THREE.Scene();
  const steel = new THREE.MeshStandardMaterial({ color: '#b6c9d3', roughness: .65, metalness: .4 });
  const glass = new THREE.MeshStandardMaterial({ color: '#5f9fb4', emissive: '#153e55', metalness: .5, roughness: .3 });
  const light = new THREE.MeshBasicMaterial({ color: '#b4eeff' });

  function cylinder(top: number, bottom: number, height: number, y: number, material: THREE.Material, segments = 32) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
    mesh.position.y = y;
    tower.add(mesh);
  }
  cylinder(5, 16, 330, 165, steel, 12);
  cylinder(24, 8, 14, 329, steel);
  cylinder(24, 24, 15, 343.5, glass);
  cylinder(14, 25, 13, 357.5, steel);
  cylinder(24.6, 24.6, 1.8, 351, light);
  cylinder(2.5, 5, 96, 408, steel);
  cylinder(7.5, 7.5, 7, 449, glass);
  cylinder(.4, 2.3, 97, 502, steel, 12);

  const projectMesh = new THREE.Mesh(new THREE.BoxGeometry(26, 92, 32), glass);
  projectMesh.position.y = 46;
  project.add(projectMesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(projectMesh.geometry), new THREE.LineBasicMaterial({ color: '#a5edff' }));
  edges.position.copy(projectMesh.position);
  project.add(edges);
  const halo = new THREE.Mesh(new THREE.RingGeometry(27, 29, 64), new THREE.MeshBasicMaterial({ color: '#83dfff', transparent: true, opacity: .8, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 1;
  project.add(halo);
  for (const scene of [tower, project]) {
    scene.add(new THREE.AmbientLight('#c0ddf6', 2.8));
    const sun = new THREE.DirectionalLight('#fff4df', 3);
    sun.position.set(-100, 300, 100);
    scene.add(sun);
  }

  function matrixFor(coordinates: [number, number]) {
    const merc = MercatorCoordinate.fromLngLat(coordinates, 0);
    const scale = merc.meterInMercatorCoordinateUnits();
    return new THREE.Matrix4().makeTranslation(merc.x, merc.y, merc.z)
      .multiply(new THREE.Matrix4().makeScale(scale, -scale, scale))
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  }
  return {
    id: 'hosis-landmarks', type: 'custom', renderingMode: '3d',
    onAdd(m, gl) {
      map = m;
      renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl as WebGL2RenderingContext });
      renderer.autoClear = false;
    },
    render(_gl, args) {
      if (map.getZoom() < 13 || args.defaultProjectionData.projectionTransition > 0) return;
      const base = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      for (const [scene, coords] of [[tower, INTRO.cnTower], [project, INTRO.destination.coordinates]] as const) {
        camera.projectionMatrix.copy(base).multiply(matrixFor(coords));
        renderer.resetState();
        renderer.render(scene, camera);
      }
      // Map's camera loop drives rendering; do not start another endless loop.
    },
    onRemove() {
      for (const scene of [tower, project]) scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) object.geometry.dispose();
      });
      steel.dispose(); glass.dispose(); light.dispose();
      (edges.material as THREE.Material).dispose();
      (halo.material as THREE.Material).dispose();
      renderer?.dispose();
    },
  };
}
