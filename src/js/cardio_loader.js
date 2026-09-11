// cardio_loader.js — Loads human-cardiovascular-system.glb and maps meshes to CARDIO_DB
// Model: Human Atlas / BodyParts3D (CC BY-SA 2.1 Japan)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getDracoLoader } from './draco_setup.js';
import { state } from './state.js';
import { scene } from './scene.js';
import { CARDIO_DB } from './cardio_data.js';

// Strip BodyParts3D suffixes: ".j.001", ".r.001", ".l.001", ".001", etc.
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\.(j|r|l|g)\.\d+$/i, '')
    .replace(/\.\d+$/i, '')
    .trim();
}

// Find which CARDIO_DB entry best matches a mesh name
function matchCardioId(meshName) {
  const norm = normalizeName(meshName);
  for (const entry of CARDIO_DB) {
    for (const kw of entry.meshKeywords) {
      if (norm.includes(kw.toLowerCase())) {
        return entry.id;
      }
    }
  }
  return null;
}

// Determine mesh color from name — arteries red, veins blue, heart dark red
function buildCardioMaterial(meshName) {
  const norm = normalizeName(meshName);
  let color = 0xcc2222; // default: artery red

  if (
    norm.includes('vein') || norm.includes('venous') || norm.includes('sinus') ||
    norm.includes('brachiocephalic vein') || norm.includes('jugular') ||
    norm.includes('vena')
  ) {
    color = 0x1a3fa6; // dark blue for veins
  } else if (
    norm.includes('heart') || norm.includes('ventricle') || norm.includes('atrium') ||
    norm.includes('valvular') || norm.includes('papillary') || norm.includes('atrioventricular')
  ) {
    color = 0xc0392b; // deep red for heart chambers
  } else if (norm.includes('aorta') || norm.includes('aortic')) {
    color = 0xe74c3c; // bright red for aorta
  }

  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.08,
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: state.cardioOpacity || 1.0,
    side: THREE.DoubleSide,
  });
}

export function tryLoadCardioModel() {
  if (state.cardioModelLoaded || state.cardioModelLoading) return;
  state.cardioModelLoading = true;

  const ms = document.getElementById('cardio-missing-state');
  if (ms) ms.style.display = 'none';

  const loader = new GLTFLoader();
  loader.setDRACOLoader(getDracoLoader());
  loader.load(
    '/models/cardiovascular.glb',
    (gltf) => {
      state.cardioModelLoaded = true;
      state.cardioModelLoading = false;

      const cardioGroup = new THREE.Group();
      cardioGroup.name = 'CardiovascularSystem';

      gltf.scene.traverse((child) => {
        if (!child.isMesh) return;

        const cardioId = matchCardioId(child.name);
        child.userData.cardioId = cardioId || ('unmapped_' + child.name);
        child.material = buildCardioMaterial(child.name);

        state.cardioAllMeshes.push(child);

        if (cardioId) {
          if (!state.cardioMeshes[cardioId]) state.cardioMeshes[cardioId] = child;
          if (!state.cardioMeshGroups[cardioId]) state.cardioMeshGroups[cardioId] = [];
          state.cardioMeshGroups[cardioId].push(child);
        }
      });

      cardioGroup.add(gltf.scene);
      state.cardioGroup = cardioGroup;

      const box = new THREE.Box3().setFromObject(cardioGroup);
      const size = box.getSize(new THREE.Vector3());
      if (size.y > 0) {
        cardioGroup.scale.setScalar(1.8 / size.y);
        cardioGroup.updateMatrixWorld(true);
      }
      const newBox = new THREE.Box3().setFromObject(cardioGroup);
      cardioGroup.position.y += -newBox.min.y - 0.9;
      cardioGroup.updateMatrixWorld(true);

      scene.add(cardioGroup);
      cardioGroup.visible = state.cardioVisible;

      if (ms) ms.style.display = 'none';

      // If user is already on the cardio panel, refresh the list
      if (state.activePanel === 'cardio' && typeof window.buildCardioList === 'function') {
        window.buildCardioList('all');
        const cardioList = document.getElementById('cardio-list');
        if (cardioList) cardioList.style.display = '';
      }

      console.log(`[OsteoVis] Cardiovascular system loaded: ${state.cardioAllMeshes.length} meshes, ${Object.keys(state.cardioMeshGroups).length} mapped structures`);
    },
    undefined,
    (error) => {
      state.cardioModelLoading = false;
      state.cardioModelMissing = true;
      console.warn('[OsteoVis] Cardiovascular model not found:', error.message);
      if (ms) {
        ms.style.display = 'flex';
        const errDiv = ms.querySelector('.mmissing-error');
        if (errDiv) { errDiv.textContent = error.message; errDiv.style.display = 'block'; }
      }
    }
  );
}
