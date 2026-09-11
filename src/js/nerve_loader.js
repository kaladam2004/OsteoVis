// nerve_loader.js — Loads human-nervous-system.glb and maps meshes to NERVE_DB
// Model: Human Atlas / BodyParts3D (CC BY-SA 2.1 Japan)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { state } from './state.js';
import { scene } from './scene.js';
import { NERVE_DB } from './nerve_data.js';

// Strip BodyParts3D suffixes: ".j.001", ".r.001", ".l.001", ".001", etc.
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\.(j|r|l|g)\.\d+$/i, '')
    .replace(/\.\d+$/i, '')
    .trim();
}

// Find which NERVE_DB entry best matches a mesh name
function matchNerveId(meshName) {
  const norm = normalizeName(meshName);
  for (const entry of NERVE_DB) {
    for (const kw of entry.meshKeywords) {
      if (norm.includes(kw.toLowerCase())) {
        return entry.id;
      }
    }
  }
  return null;
}

// Materials for nerve visualization
function buildNerveMaterial(meshName) {
  const norm = normalizeName(meshName);
  let color = 0xd4a017; // gold for nerves

  if (norm.includes('brain') || norm.includes('cerebr') || norm.includes('cerebel') || norm.includes('brainstem')) {
    color = 0xf3c99e; // pinkish-beige for brain tissue
  } else if (norm.includes('spinal cord') || norm.includes('spinal dura') || norm.includes('meninges')) {
    color = 0xf0e0b0; // pale yellow for cord
  } else if (norm.includes('nerve') || norm.includes('olfactory') || norm.includes('optic') || norm.includes('vagus')) {
    color = 0xffe066; // bright yellow for nerves
  }

  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.05,
    roughness: 0.5,
    clearcoat: 0.3,
    transparent: true,
    opacity: state.nerveOpacity || 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

export function tryLoadNerveModel() {
  if (state.nerveModelLoaded || state.nerveModelLoading) return;
  state.nerveModelLoading = true;

  // Hide missing state if shown
  const ms = document.getElementById('nerve-missing-state');
  if (ms) ms.style.display = 'none';

  const loader = new GLTFLoader();
  loader.load(
    '/models/human-nervous-system.glb',
    (gltf) => {
      state.nerveModelLoaded = true;
      state.nerveModelLoading = false;

      const nerveGroup = new THREE.Group();
      nerveGroup.name = 'NervousSystem';

      gltf.scene.traverse((child) => {
        if (!child.isMesh) return;

        const nerveId = matchNerveId(child.name);
        child.userData.nerveId = nerveId || ('unmapped_' + child.name);
        child.material = buildNerveMaterial(child.name);

        state.nerveAllMeshes.push(child);

        if (nerveId) {
          if (!state.nerveMeshes[nerveId]) state.nerveMeshes[nerveId] = child;
          if (!state.nerveMeshGroups[nerveId]) state.nerveMeshGroups[nerveId] = [];
          state.nerveMeshGroups[nerveId].push(child);
        }
      });

      nerveGroup.add(gltf.scene);
      state.nerveGroup = nerveGroup;

      scene.add(nerveGroup);
      nerveGroup.visible = state.nerveVisible;

      // Remove missing-state overlay
      if (ms) ms.style.display = 'none';

      // If user is already on the nerves panel, refresh the list
      if (state.activePanel === 'nerves' && typeof window.buildNerveList === 'function') {
        window.buildNerveList('all');
        const nerveList = document.getElementById('nerve-list');
        if (nerveList) nerveList.style.display = '';
      }

      console.log(`[OsteoVis] Nervous system loaded: ${state.nerveAllMeshes.length} meshes, ${Object.keys(state.nerveMeshGroups).length} mapped structures`);
    },
    undefined,
    (error) => {
      state.nerveModelLoading = false;
      state.nerveModelMissing = true;
      console.warn('[OsteoVis] Nervous system model not found:', error.message);
      if (ms) ms.style.display = 'flex';
    }
  );
}
