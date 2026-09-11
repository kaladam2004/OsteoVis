import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getDracoLoader } from './draco_setup.js';
import { scene } from './scene.js';
import { state } from './state.js';
import { MUSCLE_DB } from './muscles_data.js';
import { clipConfig } from './crosssection.js';

const MUSCLE_GLB_PATH = '/models/muscular.glb';

function createMuscleMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x9b1b1b,       // deeper red
    roughness: 0.6,
    metalness: 0.05,
    clearcoat: 0.5,        // wet look
    clearcoatRoughness: 0.3,
    sheen: 0.8,
    sheenColor: 0xd84b4b,
    transparent: true,
    opacity: state.muscleOpacity,
    depthWrite: true,      // needed for proper physical rendering
    side: THREE.DoubleSide,
  });
}

function mapMuscleName(meshName) {
  const name = meshName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const m of MUSCLE_DB) {
    const id     = m.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mName  = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mLatin = m.latinName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (name === id || name.includes(id) || id.includes(name)) return m.id;
    if (name.includes(mName) || mName.includes(name)) return m.id;
    if (mLatin.length > 5 && (name.includes(mLatin) || mLatin.includes(name))) return m.id;
  }
  return null;
}

export async function tryLoadMuscleModel() {
  // muscleModelLoading is already set true by main.js before calling this.
  const loader = new GLTFLoader();
  loader.setDRACOLoader(getDracoLoader());

  // Step 1: pre-check the file is reachable via fetch (gives clear HTTP errors)
  let arrayBuffer;
  try {
    const response = await fetch(MUSCLE_GLB_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} — ${MUSCLE_GLB_PATH}`);
    }
    arrayBuffer = await response.arrayBuffer();
  } catch (err) {
    state.muscleModelLoaded  = false;
    state.muscleModelLoading = false;
    const msg = err.message || String(err);
    console.warn('OsteoVis Muscles: fetch failed —', msg);
    window.dispatchEvent(new CustomEvent('muscles-load-failed', { detail: { reason: msg } }));
    return false;
  }

  // Step 2: parse the ArrayBuffer with GLTFLoader.parse() so we avoid URL-resolution edge cases
  let gltf;
  try {
    gltf = await new Promise((resolve, reject) => {
      loader.parse(arrayBuffer, '', resolve, reject);
    });
  } catch (err) {
    state.muscleModelLoaded  = false;
    state.muscleModelLoading = false;
    const msg = err.message || String(err);
    console.warn('OsteoVis Muscles: GLTFLoader.parse failed —', msg);
    window.dispatchEvent(new CustomEvent('muscles-load-failed', { detail: { reason: `Parse error: ${msg}` } }));
    return false;
  }

  // Step 3: process the scene
  try {
    state.muscleGroup = new THREE.Group();
    state.muscleGroup.scale.setScalar(state.skeletonNormScale || 1);
    state.muscleGroup.position.y = state.skeletonNormOffset   || 0;
    state.muscleGroup.visible = false;
    scene.add(state.muscleGroup);

    let meshCount = 0, mapped = 0, unmapped = 0;

    // Two-pass traversal: collect first, then reparent (avoids traverse corruption).
    const collectedMeshes = [];
    gltf.scene.traverse(child => {
      if (child.isMesh) collectedMeshes.push(child);
    });

    for (const child of collectedMeshes) {
      meshCount++;
      child.geometry.computeVertexNormals();
      child.material = createMuscleMat();
      child.material.clippingPlanes = Object.values(clipConfig).filter(c => c.active).map(c => c.plane);
      if (state.isXRay) {
        child.material.opacity = 0.16;
        child.material.color.setHex(0xb91c1c);
      }
      child.castShadow = false;
      child.receiveShadow = false;

      const muscleId = mapMuscleName(child.name);
      child.userData.muscleId = muscleId || `unmapped_${meshCount}`;

      state.muscleAllMeshes.push(child);
      if (muscleId) {
        mapped++;
        if (!state.muscleMeshGroups[muscleId]) state.muscleMeshGroups[muscleId] = [];
        state.muscleMeshGroups[muscleId].push(child);
        if (!state.muscleMeshes[muscleId]) state.muscleMeshes[muscleId] = child;
      } else {
        unmapped++;
      }
      state.muscleGroup.add(child);
    }

    if (meshCount === 0) throw new Error('GLB parsed but contained 0 meshes (empty scene)');

    state.muscleModelLoaded  = true;
    state.muscleModelLoading = false;

    console.log(
      `OsteoVis Muscles ✓ | meshes: ${meshCount} | mapped: ${mapped} | ` +
      `unmapped: ${unmapped} | scale: ${(state.skeletonNormScale || 1).toFixed(4)}`
    );

    window.dispatchEvent(new CustomEvent('muscles-ready'));
    return true;

  } catch (err) {
    state.muscleModelLoaded  = false;
    state.muscleModelLoading = false;
    const msg = err.message || String(err);
    console.error('OsteoVis Muscles: processing error —', msg);
    window.dispatchEvent(new CustomEvent('muscles-load-failed', { detail: { reason: `Processing error: ${msg}` } }));
    return false;
  }
}
