
import '../css/style.css';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { scene, camera, renderer, composer, canvas, ssaoPass, bloomPass } from './scene.js';
import { CameraController } from './controls.js';
import { loadSkeletonModel } from './builder.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import * as UI from './ui.js';
import { checkQuizAnswer } from './quiz.js';
import { getURLParams, loadPrefs } from './persistence.js';
import { addMeasurePoint } from './measure.js';
import { initAnnotations, restoreAnnotations, updateAnnotationLabels } from './annotations.js';
import { toggleClipPlane, updateClipValue, resetSection } from './crosssection.js';

const controls = new CameraController(camera, canvas);
window.appControls = controls;
export { controls };

// Expose all UI functions + extra helpers to window for HTML onclick handlers
Object.assign(window, UI);
Object.assign(window, { toggleClipPlane, updateClipValue, resetSection });

const raycaster = new THREE.Raycaster();
const mouse    = new THREE.Vector2();

// ─── Mouse move — hover highlighting ─────────────────────────────────────────

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits  = raycaster.intersectObjects(state.boneAllMeshes, false);
  const hit   = hits.length ? hits[0].object : null;
  const hitId = hit ? hit.userData.boneId : null;
  const selId = state.selectedBone ? state.selectedBone.userData.boneId : null;
  const prevId = state.hoveredBone ? state.hoveredBone.userData.boneId : null;

  if (hit && hitId !== selId) {
    if (prevId && prevId !== hitId && prevId !== selId) {
      (state.boneMeshGroups[prevId] || [state.hoveredBone]).forEach(m =>
        m.material.color.setHex(state.isXRay ? 0x999999 : 0xeae2d2)
      );
    }
    state.hoveredBone = hit;
    (state.boneMeshGroups[hitId] || [hit]).forEach(m => m.material.color.setHex(0xfcd34d));

    const data = ANATOMY_DB.find(b => b.id === hitId);
    if (data) {
      document.getElementById('tooltip-name').textContent = data.name;
      document.getElementById('tooltip-latin').textContent = data.latinName;
      document.getElementById('tooltip-cat').textContent = data.category;
      document.getElementById('tooltip-desc').textContent = data.description;
      const tt = document.getElementById('tooltip');
      tt.style.display = 'block';
      const tx = (e.clientX + 270 > window.innerWidth) ? e.clientX - 260 : e.clientX + 15;
      tt.style.left = tx + 'px';
      tt.style.top  = e.clientY + 'px';
    }
    canvas.style.cursor = 'pointer';
  } else {
    if (prevId && prevId !== selId) {
      (state.boneMeshGroups[prevId] || [state.hoveredBone]).forEach(m =>
        m.material.color.setHex(state.isXRay ? 0x999999 : 0xeae2d2)
      );
    }
    state.hoveredBone = null;
    document.getElementById('tooltip').style.display = 'none';
    canvas.style.cursor = hit ? 'pointer' : 'default';
  }
});

// ─── Click handler ────────────────────────────────────────────────────────────

canvas.addEventListener('click', e => {
  // Re-raycast at click time for accurate hit point
  const rect = canvas.getBoundingClientRect();
  const mx = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
  const my = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
  const hits = raycaster.intersectObjects(state.boneAllMeshes, false);

  // Measure mode — capture 3D hit point
  if (state.isMeasuring) {
    if (hits.length) addMeasurePoint(hits[0].point);
    return;
  }

  // Annotate mode — show form at click
  if (state.isAnnotating) {
    if (hits.length) {
      UI.showAnnotationForm(e.clientX, e.clientY, hits[0].object.userData.boneId, hits[0].point);
    }
    return;
  }

  // Normal selection
  if (state.hoveredBone) {
    if (state.currentMode === 'quiz') checkQuizAnswer(state.hoveredBone.userData.boneId);
    else UI.selectBone(state.hoveredBone.userData.boneId);
  } else {
    UI.deselectAll();
  }
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  switch (e.key) {
    case 'Escape':
      if (state.isPresentationMode) { UI.togglePresentation(); break; }
      UI.deselectAll();
      UI.closeAllSidebars();
      UI.cancelAnnotationForm?.();
      document.getElementById('search-results').style.display = 'none';
      break;
    case 'i':
    case 'I':
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') UI.toggleIsolation();
      break;
    case '/':
      if (document.activeElement?.id !== 'search-input') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      break;
  }
});

// ─── FPS performance guard ────────────────────────────────────────────────────

let fpsFrames = 0, fpsLast = 0, performanceCapped = false;

function checkFPS(time) {
  fpsFrames++;
  if (fpsLast === 0) { fpsLast = time; return; }
  const elapsed = time - fpsLast;
  if (elapsed < 2000) return;
  const fps = fpsFrames / (elapsed / 1000);
  fpsFrames = 0; fpsLast = time;
  if (!performanceCapped && window.innerWidth <= 1024 && fps < 30) {
    ssaoPass.enabled  = false;
    bloomPass.enabled = false;
    performanceCapped = true;
    console.log(`OsteoVis: Performance mode — SSAO/Bloom disabled (${fps.toFixed(1)} fps)`);
  }
}

// ─── Startup state restore ────────────────────────────────────────────────────

function applyStartupState() {
  initAnnotations();
  restoreAnnotations();

  const params = getURLParams();
  const prefs  = loadPrefs();

  // Restore quiz score display
  document.getElementById('quiz-score').textContent = prefs.quizScore || 0;
  document.getElementById('quiz-total').textContent = prefs.quizTotal || 0;

  const mode = params.mode || prefs.mode || 'normal';
  if (mode !== 'normal') UI.setMode(mode);

  const system = params.system || null;
  if (system) {
    if (state.currentMode !== 'learn') UI.setMode('learn');
    UI.applySystem(system);
  }

  const view = params.view || prefs.view || null;
  if (view && view !== 'front') UI.setCameraView(view);

  const boneId = params.bone || prefs.bone || null;
  if (boneId && state.boneMeshes[boneId]) {
    setTimeout(() => { if (state.boneMeshes[boneId]) UI.selectBone(boneId); }, 300);
  }

  UI.updateStats();
}

// ─── Animation loop ───────────────────────────────────────────────────────────

const tempV = new THREE.Vector3();
function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  controls.update();
  checkFPS(time);

  if (state.isRotating && state.modelGroup) state.modelGroup.rotation.y += 0.005;

  updateAnnotationLabels(camera);

  if (state.labelsOn || state.selectedBone) {
    for (let id in state.labels) {
      const mesh = state.boneMeshes[id];
      const div  = state.labels[id];
      if (!mesh || (!state.labelsOn && mesh !== state.selectedBone)) { div.style.display = 'none'; continue; }
      tempV.copy(mesh.position).project(camera);
      if (tempV.z > 1.0) { div.style.display = 'none'; continue; }
      const dist = camera.position.distanceTo(mesh.position);
      if (dist > 6.0 && mesh !== state.selectedBone) { div.style.display = 'none'; continue; }
      const x = (tempV.x * .5 + .5) * window.innerWidth;
      const y = (tempV.y * -.5 + .5) * window.innerHeight;
      div.style.display = 'block';
      div.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 10}px) scale(${Math.max(0.6, 1 - dist / 12)})`;
    }
  } else {
    for (let id in state.labels) state.labels[id].style.display = 'none';
  }

  composer.render();
}

// ─── Initialize ───────────────────────────────────────────────────────────────

loadSkeletonModel()
  .then(applyStartupState)
  .catch(() => console.warn('Awaiting GLB file.'));

UI.buildBoneList();
window.dispatchEvent(new Event('resize'));
animate();
