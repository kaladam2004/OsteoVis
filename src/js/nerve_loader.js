import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { state } from './state.js';
import { NERVE_DB } from './nerve_data.js';
import { clipConfig } from './crosssection.js';

const NERVE_GLB_PATH = '/models/human-nervous-system.glb';

function createNerveMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xd4a017,       // golden-yellow nerve tissue
    roughness: 0.5,
    metalness: 0.0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: state.nerveOpacity,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

function mapNerveName(meshName) {
  const name = meshName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const n of NERVE_DB) {
    const id    = n.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nName = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nLat  = n.latinName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (name === id || name.includes(id) || id.includes(name)) return n.id;
    if (name.includes(nName) || nName.includes(name)) return n.id;
    if (name.includes(nLat) || nLat.includes(name)) return n.id;
  }
  return null;
}

export function tryLoadNerveModel() {
  if (state.nerveModelLoaded || state.nerveModelLoading) return;
  state.nerveModelLoading = true;

  const loader = new GLTFLoader();
  loader.load(
    NERVE_GLB_PATH,
    (gltf) => {
      const group = new THREE.Group();
      group.name  = 'nerveGroup';

      gltf.scene.traverse(child => {
        if (!child.isMesh) return;
        const nerveId = mapNerveName(child.name);
        const mat = createNerveMat();

        if (clipConfig.enabled) {
          mat.clippingPlanes = [clipConfig.plane];
          mat.clipShadows    = true;
        }

        child.material = mat;
        child.userData.nerveId = nerveId || ('unmapped_' + child.name);
        child.castShadow    = true;
        child.receiveShadow = true;

        state.nerveAllMeshes.push(child);
        if (nerveId) {
          state.nerveMeshes[nerveId]   = child;
          state.nerveMeshGroups[nerveId] = (state.nerveMeshGroups[nerveId] || []);
          state.nerveMeshGroups[nerveId].push(child);
        }
        group.add(child.clone ? child : child);
      });

      gltf.scene.traverse(child => {
        if (!child.isMesh) return;
        group.add(child);
      });

      state.nerveGroup = group;
      scene.add(group);
      group.visible = state.nerveVisible;

      state.nerveModelLoaded  = true;
      state.nerveModelLoading = false;

      document.dispatchEvent(new CustomEvent('nerve-model-loaded'));
      console.log('[OsteoVis] Nervous system model loaded ✓');
    },
    undefined,
    (err) => {
      console.warn('[OsteoVis] Nervous system GLB not found:', NERVE_GLB_PATH);
      state.nerveModelLoading = false;
      state.nerveModelMissing = true;
      document.dispatchEvent(new CustomEvent('nerve-model-missing'));
    }
  );
}
