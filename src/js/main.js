
import '../css/style.css';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { scene, camera, renderer, composer, canvas, ssaoPass, bloomPass } from './scene.js';
import { CameraController } from './controls.js';
import { loadSkeletonModel } from './builder.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import { MUSCLE_DB } from './muscles_data.js';
import * as UI from './ui.js';
import { checkQuizAnswer } from './quiz.js';
import { getURLParams, loadPrefs } from './persistence.js';
import { addMeasurePoint } from './measure.js';
import { toggleClipPlane, updateClipValue, resetSection } from './crosssection.js';
import { tryLoadMuscleModel } from './muscle_loader.js';
import { tryLoadNerveModel } from './nerve_loader.js';
import { tryLoadCardioModel } from './cardio_loader.js';
import { t, tObj } from './i18n.js';
import { NERVE_DB } from './nerve_data.js';
import { CARDIO_DB } from './cardio_data.js';

const controls = new CameraController(camera, canvas);
window.appControls = controls;
export { controls };

// Expose all UI functions + extra helpers to window for HTML onclick handlers
Object.assign(window, UI);
Object.assign(window, { toggleClipPlane, updateClipValue, resetSection });

const raycaster = new THREE.Raycaster();
const mouse    = new THREE.Vector2();

function getVisibleAnatomyMeshes() {
  const meshes = [...state.boneAllMeshes];
  if (state.muscleModelLoaded && state.muscleGroup?.visible) {
    meshes.push(...state.muscleAllMeshes);
  }
  if (state.nerveModelLoaded && state.nerveGroup?.visible) {
    meshes.push(...state.nerveAllMeshes);
  }
  if (state.cardioModelLoaded && state.cardioGroup?.visible) {
    meshes.push(...state.cardioAllMeshes);
  }
  return meshes;
}

// ─── Mouse move — hover highlighting ─────────────────────────────────────────

let hoveredMuscleMesh = null;

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // ── Muscle hover (muscles panel active + model loaded) ───────────────────
  if (state.activePanel === 'muscles' && state.muscleModelLoaded && state.muscleAllMeshes.length) {
    const mHits = raycaster.intersectObjects(state.muscleAllMeshes, false);
    const mHit  = mHits.length ? mHits[0].object : null;
    const mId   = mHit ? mHit.userData.muscleId : null;
    const selMId = state.selectedMuscleMesh ? state.selectedMuscleMesh.userData.muscleId : null;

    // Restore previously hovered muscle
    if (hoveredMuscleMesh && hoveredMuscleMesh !== state.selectedMuscleMesh) {
      const prevMId = hoveredMuscleMesh.userData.muscleId;
      (state.muscleMeshGroups[prevMId] || [hoveredMuscleMesh]).forEach(m => {
        m.material.color.setHex(0xc0392b);
        m.material.emissive.setHex(0x000000);
        m.material.emissiveIntensity = 0;
      });
    }

    if (mHit && mId !== selMId) {
      hoveredMuscleMesh = mHit;
      (state.muscleMeshGroups[mId] || [mHit]).forEach(m => {
        m.material.color.setHex(0xfbbf24);
        m.material.emissiveIntensity = 0.2;
      });
      const muscleData = MUSCLE_DB.find(m => m.id === mId);
      if (muscleData) {
        document.getElementById('tooltip-name').textContent  = tObj(muscleData.name) || muscleData.name;
        document.getElementById('tooltip-latin').textContent = muscleData.latinName;
        document.getElementById('tooltip-cat').textContent   = tObj(muscleData.category) || muscleData.category;
        document.getElementById('tooltip-desc').textContent  = tObj(muscleData.function) || muscleData.function || '';
        const tt = document.getElementById('tooltip');
        tt.style.display = 'block';
        const tx = (e.clientX + 270 > window.innerWidth) ? e.clientX - 260 : e.clientX + 15;
        tt.style.left = tx + 'px';
        tt.style.top  = e.clientY + 'px';
      }
      canvas.style.cursor = 'pointer';
    } else if (!mHit) {
      hoveredMuscleMesh = null;
      document.getElementById('tooltip').style.display = 'none';
      canvas.style.cursor = 'default';
    }
    return; // Don't fall through to bone hover when in muscles panel
  }

  // ── Bone hover ────────────────────────────────────────────────────────────
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
      document.getElementById('tooltip-name').textContent = tObj(data.name) || data.name;
      document.getElementById('tooltip-latin').textContent = data.latinName;
      document.getElementById('tooltip-cat').textContent = tObj(data.category) || data.category;
      document.getElementById('tooltip-desc').textContent = tObj(data.description) || data.description;
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
  const rect = canvas.getBoundingClientRect();
  const mx = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
  const my = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);

  const anatomyHits = raycaster.intersectObjects(getVisibleAnatomyMeshes(), false);

  // Measure mode — capture 3D hit point on any visible anatomy layer
  if (state.isMeasuring) {
    if (anatomyHits.length) addMeasurePoint(anatomyHits[0].point);
    return;
  }

  // Annotate mode — show form at click on any visible anatomy layer
  if (state.isAnnotating) {
    if (anatomyHits.length) {
      const hit = anatomyHits[0].object;
      const targetId = hit.userData.boneId || hit.userData.muscleId || hit.name || 'anatomy';
      UI.showAnnotationForm(e.clientX, e.clientY, targetId, anatomyHits[0].point);
    }
    return;
  }

  // ── Nerve click (nerves panel + model loaded) ─────────────────────────────────────────
  if (state.activePanel === 'nerves' && state.nerveModelLoaded && state.nerveAllMeshes.length) {
    const nHits = raycaster.intersectObjects(state.nerveAllMeshes, false);
    if (nHits.length) {
      const nerveId = nHits[0].object.userData.nerveId;
      if (nerveId && !nerveId.startsWith('unmapped_')) UI.selectNerve(nerveId);
    } else {
      UI.deselectNerve();
    }
    return;
  }

  // ── Cardio click (cardio panel + model loaded) ────────────────────────────────
  if (state.activePanel === 'cardio' && state.cardioModelLoaded && state.cardioAllMeshes.length) {
    const cHits = raycaster.intersectObjects(state.cardioAllMeshes, false);
    if (cHits.length) {
      const cardioId = cHits[0].object.userData.cardioId;
      if (cardioId && !cardioId.startsWith('unmapped_')) UI.selectCardio(cardioId);
    } else {
      UI.deselectCardio();
    }
    return;
  }

  // ── Muscle click (muscles panel + model loaded) ──────────────────────────────────────
  if (state.activePanel === 'muscles' && state.muscleModelLoaded && state.muscleAllMeshes.length) {
    const mHits = raycaster.intersectObjects(state.muscleAllMeshes, false);
    if (mHits.length) {
      const muscleId = mHits[0].object.userData.muscleId;
      if (muscleId && !muscleId.startsWith('unmapped_')) UI.selectMuscle(muscleId);
    } else {
      UI.deselectMuscle();
    }
    return;
  }

  const hits = raycaster.intersectObjects(state.boneAllMeshes, false);

  // Normal bone selection
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

// Signal immediately that muscles will load so the UI shows "Loading…"
// even if the user clicks 💪 Muscles before the skeleton finishes loading.
state.muscleModelLoading = true;

// Manual retry for when the user sees the error overlay.
window.retryMuscleLoad = async function() {
  if (state.muscleModelLoaded || state.muscleModelLoading) return;
  state.muscleModelLoading = true;
  UI.switchPanel('muscles');  // re-enter to show loading overlay
  await tryLoadMuscleModel();
};

// When muscle model finishes loading, refresh the panel if already open.
window.addEventListener('muscles-ready', () => {
  if (state.activePanel === 'muscles') UI.switchPanel('muscles');
});
window.addEventListener('muscles-load-failed', (e) => {
  if (state.activePanel === 'muscles') UI.switchPanel('muscles', e.detail);
});

loadSkeletonModel()
  .then(applyStartupState)
  .then(() => tryLoadMuscleModel())
  .catch(err => console.warn('OsteoVis init error:', err));

UI.buildBoneList();
window.dispatchEvent(new Event('resize'));
animate();
