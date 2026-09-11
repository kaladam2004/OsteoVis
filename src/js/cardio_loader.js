import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { state } from './state.js';
import { scene } from './scene.js';
import { CARDIO_DB } from './cardio_data.js';

export function tryLoadCardioModel() {
  if (state.cardioModelLoaded || state.cardioModelLoading) return;
  state.cardioModelLoading = true;

  const ms = document.getElementById('cardio-missing-state');
  if (ms) ms.style.display = 'none';

  const loader = new GLTFLoader();
  loader.load(
    '/models/human-cardiovascular-system.glb',
    (gltf) => {
      state.cardioModelLoaded = true;
      state.cardioModelLoading = false;
      const model = gltf.scene;
      
      const cardioGroup = new THREE.Group();
      cardioGroup.name = "CardioSystem";
      
      model.traverse((child) => {
        if (child.isMesh) {
          const name = child.name.toLowerCase();
          
          let cardioId = null;
          // Exact match
          if (CARDIO_DB.find(c => c.id === name)) cardioId = name;
          // Or fuzzy match from DB
          else if (CARDIO_DB.find(c => name.includes(c.id.replace('cardio_', '')))) {
            cardioId = CARDIO_DB.find(c => name.includes(c.id.replace('cardio_', ''))).id;
          } else {
            cardioId = 'unmapped_' + name;
          }

          child.userData.cardioId = cardioId;
          child.userData.originalColor = child.material.color ? child.material.color.clone() : new THREE.Color(0xaa0000);

          // Standardize material if needed
          if (child.material) {
            let colorHex = 0xaa0000; // Red for arteries/heart
            if (name.includes('vein') || name.includes('vena') || name.includes('jugular')) colorHex = 0x0000aa; // Blue for veins

            const newMat = new THREE.MeshPhysicalMaterial({
              color: colorHex,
              metalness: 0.1,
              roughness: 0.3,
              clearcoat: 0.5,
              clearcoatRoughness: 0.2,
              transparent: true,
              opacity: state.cardioOpacity || 1.0,
              side: THREE.DoubleSide
            });
            child.material = newMat;
          }

          state.cardioAllMeshes.push(child);
          if (cardioId && !cardioId.startsWith('unmapped_')) {
            state.cardioMeshes[cardioId] = child;
            if (!state.cardioMeshGroups[cardioId]) state.cardioMeshGroups[cardioId] = [];
            state.cardioMeshGroups[cardioId].push(child);
          }
        }
      });

      cardioGroup.add(model);
      state.cardioGroup = cardioGroup;
      
      scene.add(cardioGroup);
      cardioGroup.visible = state.cardioVisible;
      
      // Ensure UI catches up
      if (state.activePanel === 'cardio') {
        // UI is available via window since main.js spreads it
        if (typeof window.switchPanel === 'function') window.switchPanel('cardio');
      }
    },
    (xhr) => {
      // Progress
    },
    (error) => {
      state.cardioModelLoading = false;
      state.cardioModelLoaded = false;
      const ms = document.getElementById('cardio-missing-state');
      if (ms) {
        ms.style.display = 'flex';
        const errDiv = ms.querySelector('.mmissing-error');
        if (errDiv) {
          errDiv.textContent = error.message || 'Failed to load model';
          errDiv.style.display = 'block';
        }
      }
      if (state.activePanel === 'cardio' && typeof window.switchPanel === 'function') {
        window.switchPanel('cardio');
      }
    }
  );
}
