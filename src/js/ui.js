
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { state } from './state.js';
import { ANATOMY_DB, BONE_CLINICAL_DATA } from './data.js';
import { MUSCLE_DB, MUSCLE_CATEGORIES } from './muscles_data.js';
import { camera, renderer, composer } from './scene.js';
import { setQuizLevel, nextQuizQuestion, stopQuizTimer, showFinalScore, restartQuiz, toggleQuizTimer } from './quiz.js';
import { setLayer as _setLayerBase } from './layers.js';
import { savePrefs, updateURL } from './persistence.js';
import { clearMeasure as _clearMeasure } from './measure.js';
import { createAnnotation, deleteAnnotation as _deleteAnnotation } from './annotations.js';
// No import from main.js — circular import removed; controls accessed via window.appControls

// ─── Sidebar helpers ──────────────────────────────────────────────────────────

export function toggleSidebar(side) {
  const el = document.getElementById(`sidebar-${side}`);
  el.classList.toggle('open');
  document.getElementById('overlay').style.display = el.classList.contains('open') ? 'block' : 'none';
}
export function closeAllSidebars() {
  document.getElementById('sidebar-left').classList.remove('open');
  document.getElementById('panel-right').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
}

// ─── Mode switching ───────────────────────────────────────────────────────────

export function setMode(mode) {
  stopQuizTimer();
  state.currentMode = mode;

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-mode-${mode}`)?.classList.add('active');

  document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`mnav-${mode}`)?.classList.add('active');

  // Hide all right-panel content sections
  document.getElementById('bone-detail').style.display = 'none';
  document.getElementById('quiz-panel').style.display = 'none';
  document.getElementById('quiz-final').style.display = 'none';
  document.getElementById('systems-panel')?.classList.remove('visible');

  // Hide annotation panel if not annotating
  if (!state.isAnnotating) {
    document.getElementById('annotation-panel').style.display = 'none';
    document.getElementById('bone-detail').style.display = mode !== 'quiz' ? 'block' : 'none';
  }

  if (mode === 'quiz') {
    deselectAll();
    document.getElementById('quiz-panel').style.display = 'flex';
    document.getElementById('bone-detail').style.display = 'none';
    nextQuizQuestion();
  } else if (mode === 'explode') {
    resetMats();
    if (!state.isExploded) toggleExplode();
  } else if (mode === 'learn') {
    resetMats();
    if (state.isExploded) toggleExplode();
    document.getElementById('systems-panel')?.classList.add('visible');
    applySystem('axial');
  } else {
    // normal
    resetMats();
    if (state.isExploded) toggleExplode();
    document.getElementById('visible-count').textContent =
      Object.keys(state.boneMeshes).filter(id => !id.startsWith('unmapped_')).length || 206;
  }

  savePrefs({ mode });
  updateURL({ mode: mode !== 'normal' ? mode : null });
}

// ─── Material helpers ─────────────────────────────────────────────────────────

export function resetMats() {
  // Clear isolation state
  state.isIsolated = false;
  document.getElementById('btn-isolate')?.classList.remove('active');
  document.getElementById('btn-isolate')?.setAttribute('aria-pressed', 'false');

  // Don't touch material if X-ray is active — toggleXRay manages that state
  if (state.isXRay) { _applyXRay(); return; }
  state.boneAllMeshes.forEach(m => {
    m.material.color.setHex(0xeae2d2);
    m.material.emissiveIntensity = 0;
    m.material.transparent = false;
    m.material.opacity = 1.0;
  });
  if (state.selectedBone) {
    const selId = state.selectedBone.userData.boneId;
    (state.boneMeshGroups[selId] || [state.selectedBone]).forEach(m => {
      m.material.color.setHex(0xf97316);
      m.material.emissive.setHex(0xf97316);
      m.material.emissiveIntensity = 0.6;
    });
  }
}

export function applyTeacherMode(id) {
  state.boneAllMeshes.forEach(m => {
    if (m.userData.boneId !== id) {
      m.material.transparent = true;
      m.material.opacity = 0.08;
    }
  });
}

// ─── X-Ray mode ───────────────────────────────────────────────────────────────

function _applyXRay() {
  const anatomyMeshes = [...state.boneAllMeshes, ...state.muscleAllMeshes];
  anatomyMeshes.forEach(m => {
    m.material.transparent = true;
    m.material.opacity = m.userData.muscleId ? 0.16 : 0.22;
    m.material.color.setHex(m.userData.muscleId ? 0xb91c1c : 0x999999);
    m.material.emissiveIntensity = 0;
  });
  if (state.selectedBone) {
    const selId = state.selectedBone.userData.boneId;
    (state.boneMeshGroups[selId] || [state.selectedBone]).forEach(m => {
      m.material.opacity = 0.95;
      m.material.color.setHex(0xf97316);
      m.material.emissive.setHex(0xf97316);
      m.material.emissiveIntensity = 0.5;
    });
  }
}

export function toggleXRay() {
  state.isXRay = !state.isXRay;
  const btn = document.getElementById('btn-xray');
  btn?.classList.toggle('active', state.isXRay);
  btn?.setAttribute('aria-pressed', String(state.isXRay));
  if (state.isXRay) {
    _applyXRay();
  } else {
    state.boneAllMeshes.forEach(m => {
      m.material.transparent = false;
      m.material.opacity = 1.0;
      m.material.color.setHex(0xeae2d2);
      m.material.emissiveIntensity = 0;
    });
    if (state.selectedBone) {
      const selId = state.selectedBone.userData.boneId;
      (state.boneMeshGroups[selId] || [state.selectedBone]).forEach(m => {
        m.material.color.setHex(0xf97316);
        m.material.emissive.setHex(0xf97316);
        m.material.emissiveIntensity = 0.6;
      });
    }
    state.muscleAllMeshes.forEach(m => {
      m.material.transparent = true;
      m.material.opacity = state.muscleOpacity;
      m.material.color.setHex(0xc0392b);
      m.material.emissiveIntensity = 0;
    });
  }
}

// ─── Cross-Section toggle ─────────────────────────────────────────────────────

export function toggleSection() {
  state.isSection = !state.isSection;
  const btn = document.getElementById('btn-section');
  btn?.classList.toggle('active', state.isSection);
  btn?.setAttribute('aria-pressed', String(state.isSection));
  const panel = document.getElementById('cross-section-panel');
  if (panel) panel.style.display = state.isSection ? 'flex' : 'none';
  if (!state.isSection) window.resetSection?.();
}

// ─── Bone Isolation Mode ──────────────────────────────────────────────────────

export function toggleIsolation() {
  if (!state.selectedBone && !state.isIsolated) return;
  state.isIsolated = !state.isIsolated;
  const btn = document.getElementById('btn-isolate');
  btn?.classList.toggle('active', state.isIsolated);
  btn?.setAttribute('aria-pressed', String(state.isIsolated));
  const detailBtn = document.getElementById('btn-isolate-detail');
  if (detailBtn) detailBtn.textContent = state.isIsolated ? '🔬 Show All' : '🔬 Isolate Bone';
  if (state.isIsolated && state.selectedBone) {
    applyTeacherMode(state.selectedBone.userData.boneId);
  } else {
    state.isIsolated = false;
    resetMats();
  }
}

// ─── Teacher / Presentation Mode ─────────────────────────────────────────────

function _updatePresentationOverlay() {
  const name  = document.getElementById('pres-name');
  const latin = document.getElementById('pres-latin');
  const desc  = document.getElementById('pres-desc');
  if (!name) return;
  if (state.selectedBone) {
    const id   = state.selectedBone.userData.boneId;
    const data = ANATOMY_DB.find(b => b.id === id);
    if (data) {
      name.textContent  = data.name;
      latin.textContent = data.latinName;
      desc.textContent  = data.description;
      return;
    }
  }
  name.textContent  = 'OsteoVis';
  latin.textContent = 'Click any bone to begin';
  desc.textContent  = '';
}

export function togglePresentation() {
  state.isPresentationMode = !state.isPresentationMode;
  document.body.classList.toggle('presentation-mode', state.isPresentationMode);
  const btn     = document.getElementById('btn-presentation');
  const overlay = document.getElementById('presentation-overlay');
  btn?.classList.toggle('active', state.isPresentationMode);
  btn?.setAttribute('aria-pressed', String(state.isPresentationMode));
  if (overlay) overlay.style.display = state.isPresentationMode ? 'flex' : 'none';
  if (state.isPresentationMode) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    _updatePresentationOverlay();
  } else {
    if (document.fullscreenElement) document.exitFullscreen?.();
  }
  // Trigger canvas resize after sidebars hide/show
  setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
}

// ─── Statistics Dashboard ─────────────────────────────────────────────────────

export function updateStats() {
  const mapped  = Object.keys(state.boneMeshes).filter(id => !id.startsWith('unmapped_')).length;
  const selName = state.selectedBone
    ? (ANATOMY_DB.find(b => b.id === state.selectedBone.userData.boneId)?.name || '—')
    : '—';
  const quizS   = parseInt(document.getElementById('quiz-score')?.textContent || '0');
  const quizT   = parseInt(document.getElementById('quiz-total')?.textContent || '0');
  const quizPct = quizT > 0 ? `${Math.round((quizS / quizT) * 100)}%` : '—';
  const annCount = Object.keys(state.annotations).length;

  const sd = id => document.getElementById(id);
  if (sd('sd-in-model'))    sd('sd-in-model').textContent    = mapped || '—';
  if (sd('sd-selected'))    sd('sd-selected').textContent    = selName.length > 14 ? selName.slice(0, 11) + '…' : selName;
  if (sd('sd-quiz'))        sd('sd-quiz').textContent        = quizPct;
  if (sd('sd-annotations')) sd('sd-annotations').textContent = annCount;
}

// ─── Measurement tool ─────────────────────────────────────────────────────────

export function toggleMeasure() {
  state.isMeasuring = !state.isMeasuring;
  // Measurement and annotate are mutually exclusive
  if (state.isMeasuring && state.isAnnotating) {
    state.isAnnotating = false;
    const annotateBtn = document.getElementById('btn-annotate');
    annotateBtn?.classList.remove('active');
    annotateBtn?.setAttribute('aria-pressed', 'false');
    document.getElementById('annotation-panel').style.display = 'none';
    if (state.currentMode !== 'quiz') document.getElementById('bone-detail').style.display = 'block';
  }
  // Pause auto-rotate so measurement lines don't drift
  if (state.isMeasuring && state.isRotating) {
    state.isRotating = false;
    const rb = document.getElementById('btn-rotate');
    rb?.classList.remove('active');
    rb?.setAttribute('aria-pressed', 'false');
  }
  const btn = document.getElementById('btn-measure');
  btn?.classList.toggle('active', state.isMeasuring);
  btn?.setAttribute('aria-pressed', String(state.isMeasuring));
  const overlay = document.getElementById('measure-overlay');
  if (overlay) overlay.style.display = state.isMeasuring ? 'flex' : 'none';
  if (!state.isMeasuring) _clearMeasure();
}

export function clearMeasure() { _clearMeasure(); }

// ─── Annotation tool ──────────────────────────────────────────────────────────

export function toggleAnnotate() {
  state.isAnnotating = !state.isAnnotating;
  if (state.isAnnotating && state.isMeasuring) {
    state.isMeasuring = false;
    const measureBtn = document.getElementById('btn-measure');
    measureBtn?.classList.remove('active');
    measureBtn?.setAttribute('aria-pressed', 'false');
    document.getElementById('measure-overlay').style.display = 'none';
    _clearMeasure();
  }
  const btn = document.getElementById('btn-annotate');
  btn?.classList.toggle('active', state.isAnnotating);
  btn?.setAttribute('aria-pressed', String(state.isAnnotating));
  const panel  = document.getElementById('annotation-panel');
  const detail = document.getElementById('bone-detail');
  if (state.isAnnotating) {
    if (panel)  panel.style.display  = 'block';
    if (detail) detail.style.display = 'none';
  } else {
    if (panel)  panel.style.display  = 'none';
    if (detail && state.currentMode !== 'quiz') detail.style.display = 'block';
  }
}

let _pendingBoneId = null, _pendingWorldPos = null;

export function showAnnotationForm(screenX, screenY, boneId, worldPos) {
  _pendingBoneId  = boneId;
  _pendingWorldPos = worldPos;
  const form = document.getElementById('annotation-form');
  if (!form) return;
  const x = Math.min(screenX + 12, window.innerWidth  - 290);
  const y = Math.min(screenY + 12, window.innerHeight - 180);
  form.style.left = x + 'px';
  form.style.top  = y + 'px';
  form.style.display = 'block';
  document.getElementById('ann-title-input').value = '';
  document.getElementById('ann-note-input').value  = '';
  setTimeout(() => document.getElementById('ann-title-input').focus(), 50);
}

export function saveAnnotationForm() {
  const title = document.getElementById('ann-title-input').value.trim();
  if (!title) { document.getElementById('ann-title-input').focus(); return; }
  const note = document.getElementById('ann-note-input').value.trim();
  createAnnotation(_pendingBoneId, _pendingWorldPos, title, note);
  cancelAnnotationForm();
}

export function cancelAnnotationForm() {
  document.getElementById('annotation-form').style.display = 'none';
  _pendingBoneId   = null;
  _pendingWorldPos = null;
}

export function deleteAnnotation(id) { _deleteAnnotation(id); }

// ─── Systems mode ─────────────────────────────────────────────────────────────

const SYSTEMS = {
  axial:        ['skull', 'vertebral', 'thorax'],
  appendicular: ['upper', 'hand', 'lower', 'foot', 'pelvis'],
  skull:        ['skull'],
  spine:        ['vertebral'],
  thorax:       ['thorax'],
  upper:        ['upper', 'hand'],
  lower:        ['lower', 'foot'],
};

export function applySystem(systemKey) {
  const cats = SYSTEMS[systemKey] || [];
  const uniqueIds = new Set();
  state.boneAllMeshes.forEach(m => {
    const data = ANATOMY_DB.find(b => b.id === m.userData.boneId);
    const inSystem = data && cats.includes(data.cat);
    m.material.transparent = !inSystem;
    m.material.opacity = inSystem ? 1.0 : 0.07;
    m.material.color.setHex(inSystem ? 0xeae2d2 : 0x607080);
    m.material.emissiveIntensity = 0;
    if (inSystem && data) uniqueIds.add(data.id);
  });
  if (state.selectedBone) {
    const selId   = state.selectedBone.userData.boneId;
    const selData = ANATOMY_DB.find(b => b.id === selId);
    if (selData && cats.includes(selData.cat)) {
      (state.boneMeshGroups[selId] || [state.selectedBone]).forEach(m => {
        m.material.color.setHex(0xf97316);
        m.material.emissive.setHex(0xf97316);
        m.material.emissiveIntensity = 0.6;
      });
    }
  }
  document.getElementById('visible-count').textContent = uniqueIds.size;
  document.querySelectorAll('.sys-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.sys-btn[data-system="${systemKey}"]`)?.classList.add('active');
  updateURL({ system: systemKey });
}

// ─── Explode mode ─────────────────────────────────────────────────────────────

export function toggleExplode() {
  state.isExploded = !state.isExploded;
  const bodyCenter = new THREE.Vector3();
  const primaries  = Object.values(state.boneBasePositions);
  primaries.forEach(p => bodyCenter.add(p));
  if (primaries.length) bodyCenter.divideScalar(primaries.length);
  const EXPLODE_MAG = { skull:0.4, vertebral:0.2, thorax:0.3, upper:0.5, pelvis:0.35, lower:0.6, hand:0.7, foot:0.7 };
  Object.keys(state.boneMeshGroups).forEach(id => {
    const base = state.boneBasePositions[id];
    if (!base) return;
    const data = ANATOMY_DB.find(b => b.id === id);
    const mag  = EXPLODE_MAG[data?.cat] || 0.2;
    let targetBase;
    if (state.isExploded) {
      const dir = new THREE.Vector3().subVectors(base, bodyCenter);
      if (dir.length() < 0.001) dir.set(0, 1, 0);
      dir.normalize();
      targetBase = base.clone().add(dir.multiplyScalar(mag));
    } else {
      targetBase = base.clone();
    }
    const delta = new THREE.Vector3().subVectors(targetBase, base);
    state.boneMeshGroups[id].forEach(mesh => {
      const fragTarget = mesh.userData.origPosition.clone().add(delta);
      new TWEEN.Tween(mesh.position)
        .to({ x: fragTarget.x, y: fragTarget.y, z: fragTarget.z }, 1000)
        .easing(TWEEN.Easing.Cubic.Out).start();
    });
  });
}

// ─── Bone detail HTML builder ─────────────────────────────────────────────────

function buildDetailHTML(data) {
  const extra   = BONE_CLINICAL_DATA[data.id] || {};
  const NA      = '<span class="data-na">Not added yet</span>';
  const artList = extra.articulations
    ? `<ul>${extra.articulations.map(a => `<li>${a}</li>`).join('')}</ul>` : NA;
  const muscList = extra.muscleAttachments
    ? `<ul>${extra.muscleAttachments.map(m => `<li>${m}</li>`).join('')}</ul>` : NA;
  return `
    <div class="detail-card">
      <h3>${data.name}</h3>
      <div class="latin">${data.latinName}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">📖 Description</div>
      <div class="detail-text">${data.description}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">⚡ Function</div>
      <div class="detail-text">${data.fn}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🔗 Articulations</div>
      <div class="detail-text">${artList}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">💪 Muscle Attachments</div>
      <div class="detail-text">${muscList}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🏥 Clinical Note</div>
      <div class="detail-text">${extra.clinicalNote || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🦴 Ossification</div>
      <div class="detail-text">${extra.ossification || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🏷️ Category</div>
      <div class="detail-text" style="color:var(--accent2);text-transform:uppercase">${data.category}</div>
    </div>
    <button class="action-btn" id="btn-isolate-detail" onclick="window.toggleIsolation()">🔬 Isolate Bone</button>
    <button class="action-btn" onclick="window.resetMats()" style="background:rgba(255,255,255,0.05);color:var(--text)">🔄 Show All Bones</button>
  `;
}

// ─── Bone selection ───────────────────────────────────────────────────────────

export function selectBone(id) {
  if (state.selectedBone) {
    const prevId = state.selectedBone.userData.boneId;
    (state.boneMeshGroups[prevId] || [state.selectedBone]).forEach(m => {
      m.material.color.setHex(state.isXRay ? 0x999999 : 0xeae2d2);
      m.material.emissiveIntensity = 0;
      if (state.isXRay) { m.material.transparent = true; m.material.opacity = 0.22; }
    });
    if (state.labels[prevId]) state.labels[prevId].classList.remove('selected');
    new TWEEN.Tween(state.selectedBone.position)
      .to(state.boneBasePositions[prevId], 400).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(state.selectedBone.scale)
      .to(state.boneBaseScales[prevId], 400).easing(TWEEN.Easing.Quadratic.Out).start();
  }

  state.selectedBone = state.boneMeshes[id];
  if (!state.selectedBone) return;

  document.querySelectorAll('.bone-list-item.selected').forEach(el => el.classList.remove('selected'));
  const listItem = document.querySelector(`.bone-list-item[data-bone-id="${id}"]`);
  if (listItem) { listItem.classList.add('selected'); listItem.scrollIntoView({ block: 'nearest' }); }

  (state.boneMeshGroups[id] || [state.selectedBone]).forEach(m => {
    m.material.color.setHex(0xf97316);
    m.material.emissive.setHex(0xf97316);
    m.material.emissiveIntensity = 0.6;
    if (state.isXRay) { m.material.transparent = true; m.material.opacity = 0.95; }
  });
  if (state.labels[id]) state.labels[id].classList.add('selected');

  const data = ANATOMY_DB.find(b => b.id === id);
  if (data && !state.isAnnotating) document.getElementById('bone-detail').innerHTML = buildDetailHTML(data);

  const worldPos = new THREE.Vector3();
  state.selectedBone.getWorldPosition(worldPos);
  new TWEEN.Tween(window.appControls.target)
    .to({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, 800)
    .easing(TWEEN.Easing.Cubic.Out).start();

  const camWorld    = camera.position.clone();
  const dirWorld    = new THREE.Vector3().subVectors(camWorld, worldPos).normalize();
  state.selectedBone.geometry.computeBoundingBox();
  const sz = new THREE.Vector3();
  state.selectedBone.geometry.boundingBox.getSize(sz);
  const maxDim     = Math.max(sz.x, sz.y, sz.z) * state.selectedBone.parent.scale.x;
  const forwardDist = Math.max(0.12, Math.min(0.35, maxDim * 0.8));
  const targetWorldPos = worldPos.clone().add(dirWorld.multiplyScalar(forwardDist));
  const targetLocalPos = state.selectedBone.parent.worldToLocal(targetWorldPos);

  new TWEEN.Tween(state.selectedBone.position)
    .to({ x: targetLocalPos.x, y: targetLocalPos.y, z: targetLocalPos.z }, 600)
    .easing(TWEEN.Easing.Cubic.Out).start();
  const baseScale = state.boneBaseScales[id];
  new TWEEN.Tween(state.selectedBone.scale)
    .to({ x: baseScale.x * 1.15, y: baseScale.y * 1.15, z: baseScale.z * 1.15 }, 600)
    .easing(TWEEN.Easing.Cubic.Out).start();

  savePrefs({ bone: id });
  updateURL({ bone: id });

  // Re-apply isolation to new bone if active
  if (state.isIsolated) applyTeacherMode(id);

  _updatePresentationOverlay();
  updateStats();

  if (window.innerWidth <= 1024 && !state.isAnnotating) toggleSidebar('right');
}

export function deselectAll() {
  document.querySelectorAll('.bone-list-item.selected').forEach(el => el.classList.remove('selected'));
  if (state.selectedBone) {
    const prevId = state.selectedBone.userData.boneId;
    (state.boneMeshGroups[prevId] || [state.selectedBone]).forEach(m => {
      m.material.color.setHex(state.isXRay ? 0x999999 : 0xeae2d2);
      m.material.emissiveIntensity = 0;
      if (state.isXRay) { m.material.transparent = true; m.material.opacity = 0.22; }
    });
    if (state.labels[prevId]) state.labels[prevId].classList.remove('selected');
    new TWEEN.Tween(state.selectedBone.position)
      .to(state.boneBasePositions[prevId], 400).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(state.selectedBone.scale)
      .to(state.boneBaseScales[prevId], 400).easing(TWEEN.Easing.Quadratic.Out).start();
    state.selectedBone = null;
  }
  // Clear isolation before resetMats so it doesn't recurse
  if (state.isIsolated) {
    state.isIsolated = false;
    document.getElementById('btn-isolate')?.classList.remove('active');
    document.getElementById('btn-isolate')?.setAttribute('aria-pressed', 'false');
  }
  if (!state.isXRay) resetMats();
  document.getElementById('bone-detail').innerHTML =
    '<div class="detail-placeholder"><span class="icon">🔬</span>Select any structure to view<br>anatomical details</div>';
  savePrefs({ bone: null });
  updateURL({ bone: null });
  _updatePresentationOverlay();
  updateStats();
}

// ─── Bone list / search / filter ──────────────────────────────────────────────

export function buildBoneList(filter = 'all') {
  const list = document.getElementById('bone-list');
  list.innerHTML = '';
  const items = filter === 'all' ? ANATOMY_DB : ANATOMY_DB.filter(b => b.cat === filter);
  const selectedId = state.selectedBone ? state.selectedBone.userData.boneId : null;
  items.forEach(b => {
    const div = document.createElement('div');
    div.className = 'bone-list-item';
    div.dataset.boneId = b.id;
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `${b.name} — ${b.latinName}`);
    if (b.id === selectedId) div.classList.add('selected');
    div.innerHTML = `<span class="bone-dot"></span><div><span>${b.name}</span><span class="bone-latin">${b.latinName}</span></div>`;
    div.addEventListener('click', () => { selectBone(b.id); if (window.innerWidth <= 1024) closeAllSidebars(); });
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectBone(b.id);
        if (window.innerWidth <= 1024) closeAllSidebars();
      }
    });
    list.appendChild(div);
  });
}

export function filterCategory(cat, btn) {
  state.currentFilter = cat;
  document.querySelectorAll('.section-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildBoneList(cat);
}

export function doSearch(q) {
  const res = document.getElementById('search-results');
  if (!q) { res.style.display = 'none'; return; }
  const lq = q.toLowerCase();

  if (state.activePanel === 'muscles') {
    const matches = MUSCLE_DB.filter(m =>
      m.name.toLowerCase().includes(lq) || m.latinName.toLowerCase().includes(lq) ||
      m.function?.toLowerCase().includes(lq) || m.innervation?.toLowerCase().includes(lq)
    );
    res.innerHTML = matches.map(m =>
      `<div class="search-result-item" role="button" tabindex="0" onclick="window.selectMuscle('${m.id}');document.getElementById('search-results').style.display='none'">${m.name} <span class="search-result-latin">${m.latinName}</span></div>`
    ).join('');
    res.style.display = matches.length ? 'block' : 'none';
  } else {
    const matches = ANATOMY_DB.filter(b =>
      b.name.toLowerCase().includes(lq) || b.latinName.toLowerCase().includes(lq)
    );
    res.innerHTML = matches.map(b =>
      `<div class="search-result-item" role="button" tabindex="0" onclick="window.selectBone('${b.id}');document.getElementById('search-results').style.display='none'">${b.name} <span class="search-result-latin">${b.latinName}</span></div>`
    ).join('');
    res.style.display = matches.length ? 'block' : 'none';
  }
}

// ─── Camera controls ──────────────────────────────────────────────────────────

export function setCameraView(view) {
  const presets = {
    front:     { radius: 4.5, phi: Math.PI / 2,       theta: 0 },
    back:      { radius: 4.5, phi: Math.PI / 2,       theta: Math.PI },
    left:      { radius: 4.5, phi: Math.PI / 2,       theta: -Math.PI / 2 },
    right:     { radius: 4.5, phi: Math.PI / 2,       theta: Math.PI / 2 },
    top:       { radius: 4.5, phi: 0.1,               theta: 0 },
    bottom:    { radius: 4.5, phi: Math.PI - 0.1,     theta: 0 },
    isometric: { radius: 5.5, phi: Math.PI / 4,       theta: Math.PI / 4 },
  };
  const preset = presets[view] || presets.front;
  new TWEEN.Tween(window.appControls.spherical)
    .to(preset, 1000).easing(TWEEN.Easing.Cubic.Out).start();
  new TWEEN.Tween(window.appControls.target)
    .to({ x: 0, y: 0, z: 0 }, 1000).easing(TWEEN.Easing.Cubic.Out).start();
  savePrefs({ view });
  updateURL({ view: view !== 'front' ? view : null });
}
export function resetCamera() { setCameraView('front'); }

// ─── Screenshot ───────────────────────────────────────────────────────────────

export function toggleScreenshotMenu() {
  const menu = document.getElementById('screenshot-menu');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  if (isOpen) {
    const close = e => {
      if (!e.target.closest('#screenshot-wrap')) {
        menu.classList.remove('open');
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 10);
  }
}

export function takeScreenshot(transparent = false) {
  const cnv = document.getElementById('three-canvas');
  const prevAlpha = renderer.getClearAlpha();
  if (transparent) renderer.setClearColor(0x000000, 0);
  composer.render();
  const dataURL = cnv.toDataURL('image/png');
  if (transparent) renderer.setClearAlpha(prevAlpha);
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = transparent ? 'OsteoVis_Transparent.png' : 'OsteoVis_Screenshot.png';
  a.click();
  document.getElementById('screenshot-menu')?.classList.remove('open');
}

export function toggleLabels() {
  state.labelsOn = !state.labelsOn;
  const btn = document.getElementById('btn-labels');
  btn.classList.toggle('active', state.labelsOn);
  btn.setAttribute('aria-pressed', String(state.labelsOn));
}

export function toggleRotate() {
  state.isRotating = !state.isRotating;
  const btn = document.getElementById('btn-rotate');
  btn.classList.toggle('active', state.isRotating);
  btn.setAttribute('aria-pressed', String(state.isRotating));
}

// ─── Muscular System ─────────────────────────────────────────────────────────

// ── Display Mode: skeleton | muscles | combined ───────────────────────────────
export function setDisplayMode(mode) {
  if (!state.muscleModelLoaded && mode !== 'skeleton') return;

  state.displayMode = mode;

  const showBones   = mode === 'skeleton' || mode === 'combined';
  const showMuscles = mode === 'muscles'  || mode === 'combined';

  // Skeleton visibility — iterate individual meshes so nothing else is affected
  state.skeletonVisible = showBones;
  state.boneAllMeshes.forEach(m => { m.visible = showBones; });

  // Muscle group visibility — independent top-level group
  if (state.muscleGroup) state.muscleGroup.visible = showMuscles;

  // Button states
  document.querySelectorAll('.display-mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-dm-${mode}`)?.classList.add('active');

  // Opacity panel only useful in combined mode
  const opPanel = document.getElementById('layer-opacity-panel');
  if (opPanel) opPanel.style.display = mode === 'combined' ? 'flex' : 'none';
}

export function switchPanel(panel, eventDetail) {
  if (panel === 'muscles' && !state.muscleModelLoaded) {
    if (state.muscleModelLoading) {
      _showMuscleLoadingOverlay();
    } else {
      _showMuscleMissingOverlay(eventDetail?.reason);
    }
    return;
  }

  state.activePanel = panel;

  const boneSection    = document.getElementById('bone-panel-section');
  const muscleSection  = document.getElementById('muscle-panel-section');
  const muscleTabs     = document.getElementById('muscle-category-tabs');
  const swBones        = document.getElementById('sw-bones');
  const swMuscles      = document.getElementById('sw-muscles');

  if (panel === 'muscles') {
    boneSection?.classList.add('hidden-panel');
    muscleSection?.classList.remove('hidden-panel');
    if (muscleTabs) muscleTabs.style.display = 'flex';
    swBones?.classList.remove('active');
    swMuscles?.classList.add('active');
    document.querySelector('.layer-btn[data-layer="muscles"]')?.classList.add('active');
    document.querySelector('.layer-btn[data-layer="skeleton"]')?.classList.remove('active');
    document.getElementById('search-input').placeholder = 'Search muscles…';
    // Ensure list is visible (loading/missing overlays may have hidden it)
    const list    = document.getElementById('muscle-list');
    const missing = document.getElementById('muscle-missing-state');
    if (list)    list.style.display = '';
    if (missing) missing.style.display = 'none';
    // Default to combined view when entering muscles panel
    setDisplayMode('combined');
    buildMuscleList('all');
  } else {
    muscleSection?.classList.add('hidden-panel');
    boneSection?.classList.remove('hidden-panel');
    if (muscleTabs) muscleTabs.style.display = 'none';
    swMuscles?.classList.remove('active');
    swBones?.classList.add('active');
    document.querySelector('.layer-btn[data-layer="skeleton"]')?.classList.add('active');
    document.querySelector('.layer-btn[data-layer="muscles"]')?.classList.remove('active');
    document.getElementById('search-input').placeholder = 'Search anatomy database…';
    // Back to skeleton-only view
    setDisplayMode('skeleton');
    _clearMuscleHighlights();
    _clearMuscleMeshHighlight();
    const md = document.getElementById('muscle-detail');
    const bd = document.getElementById('bone-detail');
    if (md) md.style.display = 'none';
    if (bd && state.currentMode !== 'quiz' && !state.isAnnotating) bd.style.display = 'block';
    const ms = document.getElementById('muscle-missing-state');
    if (ms) {
      ms.style.display = 'none';
      const title  = ms.querySelector('.mmissing-title');
      const body   = ms.querySelector('.mmissing-body');
      const errDiv = ms.querySelector('.mmissing-error');
      const path   = ms.querySelector('.mmissing-path');
      const hint   = ms.querySelector('.mmissing-hint');
      if (title)  title.textContent = 'Real 3D Muscle Model Not Found';
      if (body)   body.textContent  = 'To enable the Muscular System, add a real human anatomy GLB file:';
      if (errDiv) { errDiv.textContent = ''; errDiv.style.display = 'none'; }
      if (path)   path.style.display = '';
      if (hint)   hint.style.display = '';
    }
  }
}

function _showMuscleLoadingOverlay() {
  const boneSection   = document.getElementById('bone-panel-section');
  const muscleSection = document.getElementById('muscle-panel-section');
  const muscleTabs    = document.getElementById('muscle-category-tabs');
  const swBones       = document.getElementById('sw-bones');
  const swMuscles     = document.getElementById('sw-muscles');
  const list          = document.getElementById('muscle-list');
  const missing       = document.getElementById('muscle-missing-state');

  boneSection?.classList.add('hidden-panel');
  muscleSection?.classList.remove('hidden-panel');
  if (muscleTabs) muscleTabs.style.display = 'none';
  swBones?.classList.remove('active');
  swMuscles?.classList.add('active');
  if (list)    list.style.display = 'none';
  if (missing) {
    missing.style.display = 'flex';
    const title = missing.querySelector('.mmissing-title');
    const body  = missing.querySelector('.mmissing-body');
    const path  = missing.querySelector('.mmissing-path');
    const hint  = missing.querySelector('.mmissing-hint');
    if (title) title.textContent = 'Loading Muscular System…';
    if (body)  body.textContent  = 'Downloading 3D muscle model, please wait.';
    if (path)  path.style.display = 'none';
    if (hint)  hint.style.display = 'none';
  }
}

function _showMuscleMissingOverlay(reason) {
  const muscleSection = document.getElementById('muscle-panel-section');
  const boneSection   = document.getElementById('bone-panel-section');
  const muscleTabs    = document.getElementById('muscle-category-tabs');
  const swBones       = document.getElementById('sw-bones');
  const swMuscles     = document.getElementById('sw-muscles');

  if (!muscleSection) return;

  boneSection?.classList.add('hidden-panel');
  muscleSection?.classList.remove('hidden-panel');
  if (muscleTabs) muscleTabs.style.display = 'none';
  swBones?.classList.remove('active');
  swMuscles?.classList.add('active');

  const list = document.getElementById('muscle-list');
  if (list) list.style.display = 'none';

  const missing = document.getElementById('muscle-missing-state');
  if (missing) {
    missing.style.display = 'flex';
    const title  = missing.querySelector('.mmissing-title');
    const body   = missing.querySelector('.mmissing-body');
    const errDiv = missing.querySelector('.mmissing-error');
    const path   = missing.querySelector('.mmissing-path');
    const hint   = missing.querySelector('.mmissing-hint');
    if (title) title.textContent = 'Muscle Model Failed to Load';
    if (body)  body.textContent  = 'The file exists but could not be loaded:';
    if (errDiv && reason) { errDiv.textContent = reason; errDiv.style.display = 'block'; }
    if (path)  path.style.display = 'none';
    if (hint)  hint.style.display = 'none';
  }

  document.querySelector('.layer-btn[data-layer="muscles"]')?.classList.remove('active');
  document.querySelector('.layer-btn[data-layer="skeleton"]')?.classList.remove('active');

  console.warn('OsteoVis Muscles: load failed —', reason || 'unknown reason');
}

function _clearMuscleHighlights() {
  state.muscleHighlightedBones.forEach(boneId => {
    const meshes = state.boneMeshGroups[boneId];
    if (!meshes) return;
    meshes.forEach(m => {
      if (state.isXRay) {
        m.material.color.setHex(0x999999);
        m.material.transparent = true;
        m.material.opacity = 0.22;
      } else {
        m.material.color.setHex(0xeae2d2);
        m.material.transparent = false;
        m.material.opacity = 1.0;
      }
      m.material.emissiveIntensity = 0;
    });
  });
  state.muscleHighlightedBones = [];
}

function buildMuscleDetailHTML(muscle) {
  const NA = '<span class="data-na">Not specified</span>';
  return `
    <div class="detail-card muscle-card">
      <div class="muscle-badge">💪 Muscle</div>
      <h3>${muscle.name}</h3>
      <div class="latin">${muscle.latinName}</div>
      <span class="detail-cat-tag">${muscle.category}</span>
    </div>
    <div class="detail-section">
      <div class="detail-label">📍 Origin</div>
      <div class="detail-text">${muscle.origin || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">📌 Insertion</div>
      <div class="detail-text">${muscle.insertion || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">⚡ Function</div>
      <div class="detail-text">${muscle.function || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🧠 Innervation</div>
      <div class="detail-text">${muscle.innervation || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🩸 Blood Supply</div>
      <div class="detail-text">${muscle.bloodSupply || NA}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">🏥 Clinical Notes</div>
      <div class="detail-text">${muscle.clinicalNotes || NA}</div>
    </div>
    <div id="muscle-bone-highlight-info" class="detail-section" style="display:none">
      <div class="detail-label">🦴 Highlighted on Skeleton</div>
      <div class="detail-text" id="muscle-highlight-text"></div>
    </div>
  `;
}

function _clearMuscleMeshHighlight() {
  if (state.selectedMuscleMesh) {
    const prev = state.selectedMuscleMesh;
    (state.muscleMeshGroups[prev.userData.muscleId] || [prev]).forEach(m => {
      m.material.color.setHex(0xc0392b);   // match createMuscleMat base color
      m.material.emissive.setHex(0x000000);
      m.material.emissiveIntensity = 0;
    });
    state.selectedMuscleMesh = null;
  }
}

export function selectMuscle(id) {
  const muscle = MUSCLE_DB.find(m => m.id === id);
  if (!muscle) return;

  state.selectedMuscle = muscle;

  // Deselect any bone
  if (state.selectedBone) deselectAll();

  // ── 3D muscle mesh highlight (when model is loaded) ────────────────────────
  _clearMuscleMeshHighlight();
  _clearMuscleHighlights();

  if (state.muscleModelLoaded) {
    const primaryMesh = state.muscleMeshes[id];
    if (primaryMesh) {
      state.selectedMuscleMesh = primaryMesh;
      (state.muscleMeshGroups[id] || [primaryMesh]).forEach(m => {
        m.material.color.setHex(0xfbbf24);   // bright amber highlight on 3D muscle
        m.material.emissive.setHex(0xfbbf24);
        m.material.emissiveIntensity = 0.5;
      });
    }
  }

  // ── Bone attachment highlights (always — additional context) ───────────────
  const toHighlight = [...new Set([...(muscle.originBones || []), ...(muscle.insertionBones || [])])];
  const highlightedNames = [];

  toHighlight.forEach(boneId => {
    const meshes = state.boneMeshGroups[boneId];
    if (!meshes) return;
    state.muscleHighlightedBones.push(boneId);
    const col = state.muscleModelLoaded ? 0xe879f9 : 0xdc2626; // purple when 3D loaded, red otherwise
    meshes.forEach(m => {
      m.material.color.setHex(col);
      m.material.emissive.setHex(col);
      m.material.emissiveIntensity = 0.35;
      m.material.transparent = false;
      m.material.opacity = 1.0;
    });
    const boneData = ANATOMY_DB.find(b => b.id === boneId);
    if (boneData) highlightedNames.push(boneData.name);
  });

  // ── Right panel ─────────────────────────────────────────────────────────────
  const md = document.getElementById('muscle-detail');
  const bd = document.getElementById('bone-detail');
  if (md) { md.innerHTML = buildMuscleDetailHTML(muscle); md.style.display = 'block'; }
  if (bd) bd.style.display = 'none';

  if (highlightedNames.length) {
    const infoDiv = document.getElementById('muscle-bone-highlight-info');
    const textDiv = document.getElementById('muscle-highlight-text');
    if (infoDiv) infoDiv.style.display = 'block';
    if (textDiv) textDiv.textContent = highlightedNames.join(', ');
  }

  // ── List selection ───────────────────────────────────────────────────────────
  document.querySelectorAll('.muscle-list-item.selected').forEach(el => el.classList.remove('selected'));
  const item = document.querySelector(`.muscle-list-item[data-muscle-id="${id}"]`);
  if (item) { item.classList.add('selected'); item.scrollIntoView({ block: 'nearest' }); }

  if (window.innerWidth <= 1024) toggleSidebar('right');
}

export function deselectMuscle() {
  if (!state.selectedMuscle) return;
  state.selectedMuscle = null;
  _clearMuscleHighlights();
  _clearMuscleMeshHighlight();
  document.querySelectorAll('.muscle-list-item.selected').forEach(el => el.classList.remove('selected'));
  const md = document.getElementById('muscle-detail');
  const bd = document.getElementById('bone-detail');
  if (md) { md.style.display = 'none'; md.innerHTML = ''; }
  if (bd && state.activePanel === 'bones') bd.style.display = 'block';
}

export function setMuscleOpacity(val) {
  const opacity = parseFloat(val);
  state.muscleOpacity = opacity;
  state.muscleAllMeshes.forEach(m => {
    m.material.opacity = opacity;
    m.material.transparent = opacity < 1.0;
  });
  const lbl = document.getElementById('muscle-opacity-label');
  if (lbl) lbl.textContent = Math.round(opacity * 100) + '%';
}

export function setSkeletonOpacityLevel(val) {
  const opacity = parseFloat(val);
  state.skeletonOpacity = opacity;
  state.boneAllMeshes.forEach(m => {
    m.material.opacity    = opacity;
    m.material.transparent = opacity < 1.0;
  });
  const lbl = document.getElementById('skeleton-opacity-label');
  if (lbl) lbl.textContent = Math.round(opacity * 100) + '%';
}

export function buildMuscleList(filter = 'all') {
  state.muscleFilter = filter;
  const list = document.getElementById('muscle-list');
  if (!list) return;
  list.innerHTML = '';
  const items = filter === 'all' ? MUSCLE_DB : MUSCLE_DB.filter(m => m.category === filter);
  const selId  = state.selectedMuscle ? state.selectedMuscle.id : null;
  items.forEach(m => {
    const div = document.createElement('div');
    div.className = 'muscle-list-item bone-list-item';
    div.dataset.muscleId = m.id;
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `${m.name} — ${m.latinName}`);
    if (m.id === selId) div.classList.add('selected');
    div.innerHTML = `<span class="muscle-dot"></span><div><span>${m.name}</span><span class="bone-latin">${m.latinName}</span></div>`;
    div.addEventListener('click', () => { selectMuscle(m.id); if (window.innerWidth <= 1024) closeAllSidebars(); });
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMuscle(m.id); }
    });
    list.appendChild(div);
  });
}

export function filterMuscleCategory(cat, btn) {
  document.querySelectorAll('.muscle-cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildMuscleList(cat);
}

export function doMuscleSearch(q) {
  if (!q) { buildMuscleList(state.muscleFilter); return; }
  q = q.toLowerCase();
  const list = document.getElementById('muscle-list');
  if (!list) return;
  list.innerHTML = '';
  const matches = MUSCLE_DB.filter(m =>
    m.name.toLowerCase().includes(q) || m.latinName.toLowerCase().includes(q) ||
    m.function?.toLowerCase().includes(q) || m.innervation?.toLowerCase().includes(q)
  );
  matches.forEach(m => {
    const div = document.createElement('div');
    div.className = 'muscle-list-item bone-list-item';
    div.dataset.muscleId = m.id;
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.innerHTML = `<span class="muscle-dot"></span><div><span>${m.name}</span><span class="bone-latin">${m.latinName}</span></div>`;
    div.addEventListener('click', () => selectMuscle(m.id));
    list.appendChild(div);
  });
}

export function toggleSkeletonVisibility() {
  // Cycle through display modes: skeleton → combined → muscles → skeleton
  if (state.displayMode === 'skeleton')  setDisplayMode('combined');
  else if (state.displayMode === 'combined') setDisplayMode('muscles');
  else setDisplayMode('skeleton');
}

// Override setLayer to handle skeleton/muscles panel switching
function _setLayerWrapped(layerKey) {
  if (layerKey === 'muscles') {
    switchPanel('muscles');
  } else if (layerKey === 'skeleton') {
    switchPanel('bones');
  } else {
    _setLayerBase(layerKey);
  }
}

// Re-export everything needed on window via main.js Object.assign(window, UI)
export { setQuizLevel, nextQuizQuestion, showFinalScore, restartQuiz, toggleQuizTimer };
export { _setLayerWrapped as setLayer };
