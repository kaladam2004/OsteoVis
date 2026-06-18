import * as THREE from 'three';
import { scene } from './scene.js';

// 1.8 Three.js units = ~170 cm human skeleton → 1 unit ≈ 94.4 cm
const SCALE_CM = 94.4;

export const measureGroup = new THREE.Group();
scene.add(measureGroup);

const _pts = [];

export function addMeasurePoint(worldPos) {
  // After 3 points, auto-reset and start a new measurement
  if (_pts.length >= 3) clearMeasure();

  _pts.push(worldPos.clone());

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 8, 8),
    new THREE.MeshBasicMaterial({ color: _pts.length === 1 ? 0xfcd34d : 0xf97316, depthTest: false })
  );
  dot.position.copy(worldPos);
  dot.renderOrder = 999;
  measureGroup.add(dot);

  if (_pts.length >= 2) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      _pts[_pts.length - 2], _pts[_pts.length - 1],
    ]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00e5ff, depthTest: false }));
    line.renderOrder = 998;
    measureGroup.add(line);

    const d12 = (_pts[0].distanceTo(_pts[1]) * SCALE_CM).toFixed(1);

    if (_pts.length === 2) {
      _setDisplay(`📏 ${d12} cm`, '', 'Click a 3rd point to measure angle');
    } else {
      const v1 = new THREE.Vector3().subVectors(_pts[0], _pts[1]).normalize();
      const v2 = new THREE.Vector3().subVectors(_pts[2], _pts[1]).normalize();
      const ang = (Math.acos(Math.max(-1, Math.min(1, v1.dot(v2)))) * (180 / Math.PI)).toFixed(1);
      const d23 = (_pts[1].distanceTo(_pts[2]) * SCALE_CM).toFixed(1);
      _setDisplay(`📏 ${d12} + ${d23} cm`, `📐 Angle: ${ang}°`, 'Click Clear to reset');
    }
  } else {
    _setDisplay('', '', 'Click 2nd point for distance');
  }
}

export function clearMeasure() {
  measureGroup.children.slice().forEach(c => {
    c.geometry?.dispose();
    c.material?.dispose();
    measureGroup.remove(c);
  });
  _pts.length = 0;
  _setDisplay('', '', 'Click a bone to place first point');
}

function _setDisplay(dist, angle, hint) {
  const d = document.getElementById('meas-dist');
  const a = document.getElementById('meas-angle');
  const h = document.getElementById('meas-hint');
  if (d) d.textContent = dist;
  if (a) { a.textContent = angle; a.style.display = angle ? 'block' : 'none'; }
  if (h) h.textContent = hint;
}
