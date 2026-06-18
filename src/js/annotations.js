import * as THREE from 'three';
import { state } from './state.js';

const STORAGE_KEY = 'osteovis_annotations';
let _annoGroup = null;

export function initAnnotations() {
  if (!state.modelGroup) return;
  _annoGroup = new THREE.Group();
  state.modelGroup.add(_annoGroup);
}

function _load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}
function _persist(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

export function restoreAnnotations() {
  if (!_annoGroup) return;
  const data = _load();
  Object.values(data).forEach(ann => _createPin(ann));
  _refreshList();
}

export function createAnnotation(boneId, worldPos, title, note) {
  if (!_annoGroup || !state.modelGroup) return;
  const id = 'ann_' + Date.now();
  const localPos = state.modelGroup.worldToLocal(worldPos.clone()).toArray();
  const ann = { id, boneId, localPos, title, note: note || '' };
  const stored = _load();
  stored[id] = ann;
  _persist(stored);
  state.annotations[id] = ann;
  _createPin(ann);
  _refreshList();
  window.updateStats?.();
}

export function deleteAnnotation(id) {
  const mesh = state.annotationMeshes[id];
  if (mesh) {
    mesh.geometry?.dispose();
    mesh.material?.dispose();
    _annoGroup?.remove(mesh);
  }
  state.annotationLabels[id]?.remove();
  delete state.annotationMeshes[id];
  delete state.annotationLabels[id];
  delete state.annotations[id];
  const stored = _load();
  delete stored[id];
  _persist(stored);
  _refreshList();
  window.updateStats?.();
}

function _createPin(ann) {
  if (!_annoGroup) return;

  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xef4444, depthTest: false })
  );
  pin.renderOrder = 999;
  const lp = new THREE.Vector3(...ann.localPos);
  pin.position.copy(lp);
  pin.userData.annId = ann.id;
  _annoGroup.add(pin);
  state.annotationMeshes[ann.id] = pin;
  state.annotations[ann.id] = ann;

  const div = document.createElement('div');
  div.className = 'ann-label';
  div.dataset.annId = ann.id;
  div.innerHTML = `<span class="ann-pin-icon">📌</span><span class="ann-label-title">${ann.title}</span>`;
  div.style.display = 'none';
  document.getElementById('canvas-wrap')?.appendChild(div);
  state.annotationLabels[ann.id] = div;
}

export function updateAnnotationLabels(camera) {
  if (!state.modelGroup) return;
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  const tv = new THREE.Vector3();
  Object.entries(state.annotationMeshes).forEach(([id, mesh]) => {
    const div = state.annotationLabels[id];
    if (!div) return;
    mesh.getWorldPosition(tv);
    tv.project(camera);
    if (tv.z > 1) { div.style.display = 'none'; return; }
    const x = (tv.x * 0.5 + 0.5) * W;
    const y = (tv.y * -0.5 + 0.5) * H;
    div.style.display = 'flex';
    div.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 14}px)`;
  });
}

function _refreshList() {
  const list = document.getElementById('annotation-list');
  if (!list) return;
  const anns = Object.values(state.annotations);
  if (!anns.length) {
    list.innerHTML = '<div class="ann-empty">No annotations yet.<br>Enable 📌 mode and click any bone.</div>';
    return;
  }
  list.innerHTML = anns.map(a => `
    <div class="ann-card">
      <div class="ann-card-head">
        <span class="ann-card-title">📌 ${a.title}</span>
        <button class="ann-del-btn" onclick="window.deleteAnnotation('${a.id}')" aria-label="Delete annotation">✕</button>
      </div>
      ${a.note ? `<div class="ann-card-note">${a.note}</div>` : ''}
      <div class="ann-card-bone">${a.boneId}</div>
    </div>
  `).join('');
}
