
import * as THREE from 'three';
import { state } from './state.js';

// One plane per anatomical axis.
// THREE.Plane(normal, c): keeps fragments where dot(normal, pos) + c >= 0
// normal=(1,0,0), c=2 → keeps x >= -2 (full model). c=0 → keeps right half.
export const clipConfig = {
  sagittal:   { plane: new THREE.Plane(new THREE.Vector3(1, 0, 0), 100), active: false },
  transverse: { plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 100), active: false },
  coronal:    { plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 100), active: false },
};

function _getActivePlanes() {
  return Object.values(clipConfig).filter(c => c.active).map(c => c.plane);
}

function _apply() {
  if (!state.boneAllMeshes.length) return;
  const planes = _getActivePlanes();
  state.boneAllMeshes.forEach(m => {
    m.material.clippingPlanes = planes;
    m.material.needsUpdate = true;
  });
}

// isActive: boolean from checkbox
export function toggleClipPlane(axis, isActive) {
  if (!clipConfig[axis]) return;
  clipConfig[axis].active = !!isActive;
  const sl = document.getElementById(`clip-${axis}-slider`);
  if (sl) sl.disabled = !isActive;
  _apply();
}

// sliderVal 0–100 → constant (v-50)/25 → range -2 to +2
// +2 = plane beyond model (no clip); 0 = center cut; -2 = clip everything
export function updateClipValue(axis, sliderVal) {
  if (!clipConfig[axis]) return;
  clipConfig[axis].plane.constant = (parseFloat(sliderVal) - 50) / 25;
  if (clipConfig[axis].active) _apply();
  const pct = document.getElementById(`clip-${axis}-pct`);
  if (pct) pct.textContent = Math.round(sliderVal) + '%';
}

export function resetSection() {
  Object.entries(clipConfig).forEach(([axis, cfg]) => {
    cfg.active = false;
    cfg.plane.constant = 100;
    const cb = document.getElementById(`clip-${axis}-active`);
    const sl = document.getElementById(`clip-${axis}-slider`);
    const pct = document.getElementById(`clip-${axis}-pct`);
    if (cb)  cb.checked = false;
    if (sl)  { sl.value = '100'; sl.disabled = true; }
    if (pct) pct.textContent = '100%';
  });
  _apply();
}
