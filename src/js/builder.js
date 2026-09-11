import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getDracoLoader } from './draco_setup.js';
import { scene } from './scene.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';

const boneMat = new THREE.MeshPhysicalMaterial({
  color: 0xEFEAE1,
  roughness: 0.5,
  metalness: 0.1,
  clearcoat: 0.1,
  clearcoatRoughness: 0.5,
});
// Bones that the heuristic segmenter names generically — map to best ANATOMY_DB id
const HEURISTIC_OVERRIDE = {
  'skull':            'frontal',
  'spine':            'c7',
  'pelvis':           'ilium_r',
  'ribs':             'rib_r1',
  'lowerlimbleft':    'femur_l',
  'lowerlimbright':   'femur_r',
  'upperlimbleft':    'humerus_l',
  'upperlimbright':   'humerus_r',
  'scapula':          'scapula_r',
  'clavicle':         'clavicle_r',
  'sternum':          'sternum_body',
};
// Vertebra IDs sorted cervical → lumbar for Y-position assignment
const SPINE_IDS = [
  'c6','c7',
  't1','t2','t3','t4','t5','t6','t7','t8','t9','t10','t11','t12',
  'l1','l2','l3','l4','l5',
];

function mapBoneName(meshName) {
  const name = meshName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct heuristic override (exact key match)
  if (HEURISTIC_OVERRIDE[name]) return HEURISTIC_OVERRIDE[name];

  // 2. Numbered heuristic variants: "skull1", "pelvisr2", etc.
  for (const [key, val] of Object.entries(HEURISTIC_OVERRIDE)) {
    if (name.startsWith(key) && /^\d+$/.test(name.slice(key.length))) return val;
  }

  // 3. Exact ANATOMY_DB id match (prevents rib_r1 matching rib_r10)
  for (const b of ANATOMY_DB) {
    const id = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (name === id) return b.id;
  }

  // 4. Substring / contains match (fallback)
  for (const b of ANATOMY_DB) {
    const id    = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbName  = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbLatin = b.latinName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (name.includes(id) || id.includes(name) || name.includes(dbName) || name.includes(dbLatin)) {
      return b.id;
    }
  }
  return null;
}

function createLabel(id, mesh) {
  const data = ANATOMY_DB.find(b => b.id === id);
  if (!data) return;
  const div = document.createElement('div');
  div.className = 'bone-label';
  div.textContent = data.name;
  div.style.display = 'none';
  document.getElementById('canvas-wrap').appendChild(div);
  state.labels[id] = div;
}

function showFallbackUI() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
  const fallback = document.createElement('div');
  fallback.id = 'fallback-msg';
  fallback.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:500;backdrop-filter:blur(10px);background:rgba(10,10,12,0.8)';
  fallback.innerHTML = `
    <div style="background:rgba(20,20,25,0.95);padding:40px;border-radius:12px;border:1px solid var(--accent);text-align:center;max-width:500px;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      <h2 style="color:var(--accent);margin-bottom:15px;font-size:24px">Model Not Found</h2>
      <p style="color:var(--text);line-height:1.6;margin-bottom:20px;font-size:16px">
        Please place <strong>human-skeleton-separated-final.glb</strong> in <code style="color:var(--accent2)">public/models/</code>
      </p>
      <div style="font-size:50px">💀</div>
    </div>`;
  document.getElementById('canvas-wrap').appendChild(fallback);
}

export function loadSkeletonModel() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(getDracoLoader());

    const onProgress = (xhr) => {
      if (xhr.lengthComputable) {
        const bar = document.getElementById('loading-bar');
        if (bar) bar.style.width = ((xhr.loaded / xhr.total) * 100) + '%';
      }
    };

    loader.load('/models/skeleton.glb', (gltf) => {
      const model = gltf.scene;
      const meshes = [];
      model.traverse(child => { if (child.isMesh && child.visible) meshes.push(child); });

      // ── Step 1: Pre-assign Spine meshes by Y position (highest = cervical) ──
      const spineMeshes = meshes.filter(c => /^spine/i.test(c.name));
      spineMeshes.sort((a, b) => b.position.y - a.position.y);
      const spineAssign = new Map();
      spineMeshes.forEach((mesh, i) => {
        if (i < SPINE_IDS.length) spineAssign.set(mesh.uuid, SPINE_IDS[i]);
      });

      // ── Step 2: Build modelGroup ──
      const modelGroup = new THREE.Group();
      scene.add(modelGroup);
      state.modelGroup = modelGroup;

      meshes.forEach(child => {
        modelGroup.add(child);
        child.material = boneMat.clone();
        child.castShadow = true;
        child.receiveShadow = true;

        // Resolve bone ID
        let finalId;
        if (spineAssign.has(child.uuid)) {
          finalId = spineAssign.get(child.uuid);
        } else {
          const mapped = mapBoneName(child.name);
          finalId = mapped || ('unmapped_' + child.uuid);
        }

        child.userData.boneId = finalId;

        // Track every mesh for raycasting
        state.boneAllMeshes.push(child);

        // Group fragments by bone ID for material operations
        if (!state.boneMeshGroups[finalId]) state.boneMeshGroups[finalId] = [];
        state.boneMeshGroups[finalId].push(child);

        // Only store FIRST mesh per ID as "primary" (for labels / zoom / detail)
        if (!state.boneMeshes[finalId]) {
          state.boneMeshes[finalId] = child;
          state.boneBasePositions[finalId] = child.position.clone();
          state.boneBaseScales[finalId]    = child.scale.clone();
          state.boneBaseQuaternions[finalId] = child.quaternion.clone();
        }

        // Per-mesh original transform stored in userData (used by explode reset)
        child.userData.origPosition   = child.position.clone();
        child.userData.origScale      = child.scale.clone();
        child.userData.origQuaternion = child.quaternion.clone();

        // Label only for the primary mesh to avoid duplicates
        if (!state.labels[finalId]) createLabel(finalId, child);
      });

      // ── Step 3: Scale and center ──
      const box = new THREE.Box3().setFromObject(modelGroup);
      const size = box.getSize(new THREE.Vector3());
      if (size.y > 0) {
        state.skeletonNormScale = 1.8 / size.y;
        modelGroup.scale.setScalar(state.skeletonNormScale);
        modelGroup.updateMatrixWorld(true);
      }
      const newBox = new THREE.Box3().setFromObject(modelGroup);
      modelGroup.position.y += -newBox.min.y - 0.9;
      state.skeletonNormOffset = modelGroup.position.y;
      modelGroup.updateMatrixWorld(true);

      // ── Step 4: Re-read local transforms AFTER scaling ──
      meshes.forEach(c => {
        const id = c.userData.boneId;
        // Always keep per-mesh originals accurate
        c.userData.origPosition.copy(c.position);
        c.userData.origScale.copy(c.scale);
        c.userData.origQuaternion.copy(c.quaternion);
        // Update primary mesh base positions
        if (state.boneMeshes[id] === c) {
          state.boneBasePositions[id].copy(c.position);
          state.boneBaseQuaternions[id].copy(c.quaternion);
          state.boneBaseScales[id].copy(c.scale);
        }
      });

      // ── Step 5: Console mapping report ──
      const mappedIds   = Object.keys(state.boneMeshes).filter(id => !id.startsWith('unmapped_'));
      const unmappedIds = Object.keys(state.boneMeshes).filter(id =>  id.startsWith('unmapped_'));
      const unmappedNames = unmappedIds.map(id => state.boneMeshes[id].name);
      console.group('%cOsteoVis — Bone Mapping Report', 'color:#3b82f6;font-weight:bold');
      console.log(`✅ Mapped unique bones : ${mappedIds.length}`);
      console.log(`❌ Unmapped unique meshes: ${unmappedIds.length}`);
      console.log(`📦 Total mesh fragments: ${state.boneAllMeshes.length}`);
      if (unmappedNames.length) console.log('Unmapped mesh names:', unmappedNames);
      console.groupEnd();

      // Update stats bar
      document.getElementById('total-bones').textContent  = mappedIds.length;
      document.getElementById('visible-count').textContent = mappedIds.length;

      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.opacity = 0;
        setTimeout(() => loading.style.display = 'none', 500);
      }
      resolve();

    }, onProgress, (error) => {
      console.error('Failed to load GLB:', error);
      showFallbackUI();
      reject(error);
    });
  });
}
