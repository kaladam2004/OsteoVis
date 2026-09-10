import * as THREE from 'three';
import { state } from './state.js';
import { MUSCLE_DB } from './muscles_data.js';

// Build a single procedural muscle tube between origin → insertion bone positions.
// Positions come from state.boneBasePositions (modelGroup local space).

function getBoneLocalPos(boneId) {
  const base = state.boneBasePositions[boneId];
  if (base) return base.clone();
  // Fallback: read current mesh position (also in modelGroup local space)
  const mesh = state.boneMeshes[boneId];
  if (mesh) return mesh.position.clone();
  return null;
}

function avgPositions(ids) {
  const pts = ids.map(id => getBoneLocalPos(id)).filter(Boolean);
  if (!pts.length) return null;
  const v = new THREE.Vector3();
  pts.forEach(p => v.add(p));
  return v.divideScalar(pts.length);
}

// Build a slightly-bulging tube (like a muscle belly) between two 3D points.
function makeTube(start, end, radiusScale = 1) {
  const len = start.distanceTo(end);
  if (len < 0.02) return null;

  const mid = start.clone().add(end).multiplyScalar(0.5);

  // Belly offset: push the midpoint outward perpendicular to muscle axis
  const axis = end.clone().sub(start).normalize();
  // Pick a perpendicular direction (avoid parallel)
  const worldUp = Math.abs(axis.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const perp = new THREE.Vector3().crossVectors(axis, worldUp).normalize();
  mid.addScaledVector(perp, len * 0.08);

  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  const radius = Math.max(0.007, Math.min(0.038, len * 0.09)) * radiusScale;

  return new THREE.TubeGeometry(curve, 14, radius, 7, false);
}

function makeMuscleMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xb91c1c,
    roughness: 0.70,
    metalness: 0.0,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
}

// Per-muscle radius scale overrides for prominent muscles
const RADIUS_SCALE = {
  gluteus_maximus: 2.2, trapezius: 2.0, latissimus_dorsi: 2.0,
  pectoralis_major: 1.8, quadratus_lumborum: 1.6, erector_spinae: 1.8,
  rectus_abdominis: 1.4, external_oblique: 1.4, internal_oblique: 1.3,
  transversus_abdominis: 1.2, gluteus_medius: 1.6, gluteus_minimus: 1.3,
  biceps_femoris: 1.5, semitendinosus: 1.3, semimembranosus: 1.3,
  rectus_femoris: 1.6, vastus_lateralis: 1.6, vastus_medialis: 1.4,
  gastrocnemius: 1.5, soleus: 1.4, deltoid: 1.6,
  pectoralis_minor: 1.1, serratus_anterior: 1.1,
  biceps_brachii: 1.4, triceps_brachii: 1.5,
  sternocleidomastoid: 1.2, adductor_longus: 1.3, sartorius: 1.0,
  iliopsoas: 1.5, psoas_major: 1.4, tibialis_anterior: 1.2,
};

export function buildProceduralMuscles() {
  if (state.muscleModelLoaded) return;

  state.muscleGroup = new THREE.Group();
  state.muscleGroup.visible = false;

  let built = 0;
  let skipped = 0;

  MUSCLE_DB.forEach(muscle => {
    const orig = avgPositions(muscle.originBones || []);
    const ins  = avgPositions(muscle.insertionBones || []);

    if (!orig || !ins) { skipped++; return; }

    const rs  = RADIUS_SCALE[muscle.id] ?? 1.0;
    const geo = makeTube(orig, ins, rs);
    if (!geo) { skipped++; return; }

    const mat  = makeMuscleMaterial();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.muscleId = muscle.id;
    mesh.castShadow    = false;
    mesh.receiveShadow = false;

    state.muscleGroup.add(mesh);
    state.muscleAllMeshes.push(mesh);

    if (!state.muscleMeshGroups[muscle.id]) state.muscleMeshGroups[muscle.id] = [];
    state.muscleMeshGroups[muscle.id].push(mesh);
    if (!state.muscleMeshes[muscle.id]) state.muscleMeshes[muscle.id] = mesh;

    built++;
  });

  // Parent under modelGroup so muscles follow auto-rotate, explode, etc.
  if (state.modelGroup) {
    state.modelGroup.add(state.muscleGroup);
  }

  state.muscleModelLoaded = true;

  console.log(
    `OsteoVis Muscles: procedural 3D built from bone positions | ` +
    `built: ${built} | skipped (no bone refs): ${skipped}`
  );
}
