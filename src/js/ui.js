
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import { camera, scene, renderer } from './scene.js';
import { setQuizLevel, nextQuizQuestion, checkQuizAnswer } from './quiz.js';
import { controls } from './main.js'; // imported lazily

export function toggleSidebar(side) {
  document.getElementById(`sidebar-${side}`).classList.toggle('open');
  document.getElementById('overlay').style.display = document.getElementById(`sidebar-${side}`).classList.contains('open') ? 'block' : 'none';
}
export function closeAllSidebars() {
  document.getElementById('sidebar-left').classList.remove('open');
  document.getElementById('panel-right').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
}

export function setMode(mode) {
  state.currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-mode-${mode}`)?.classList.add('active');
  document.getElementById('bone-detail').style.display = mode === 'quiz' ? 'none' : 'block';
  document.getElementById('quiz-panel').style.display = mode === 'quiz' ? 'flex' : 'none';
  if(mode === 'quiz') { deselectAll(); nextQuizQuestion(); }
  else if(mode === 'explode') { if(!state.isExploded) toggleExplode(); }
  else { resetMats(); if(state.isExploded) toggleExplode(); }
}

export function resetMats() {
  Object.values(state.boneMeshes).forEach(m => {
    m.material.color.setHex(0xeae2d2);
    m.material.emissiveIntensity = 0;
    m.material.transparent = false;
    m.material.opacity = 1.0;
  });
  if(state.selectedBone) {
    state.selectedBone.material.color.setHex(0xf97316);
    state.selectedBone.material.emissive.setHex(0xf97316);
    state.selectedBone.material.emissiveIntensity = 0.6;
  }
}

export function applyTeacherMode(id) {
  Object.values(state.boneMeshes).forEach(m => {
    if(m.userData.boneId !== id) {
      m.material.transparent = true;
      m.material.opacity = 0.1;
    }
  });
}

export function toggleExplode() {
  state.isExploded = !state.isExploded;
  const targets = {};
  Object.keys(state.boneMeshes).forEach(id => {
    const base = state.boneBasePositions[id];
    if (state.isExploded) {
      const data = ANATOMY_DB.find(b => b.id === id);
      const mag = { skull:0.4, vertebral:0.2, thorax:0.3, upper:0.5, pelvis:0.35, lower:0.6, hand:0.7, foot:0.7 }[data?.cat||'other'];
      targets[id] = base.clone().add(base.clone().normalize().multiplyScalar(mag||0.2));
    } else {
      targets[id] = base.clone();
    }
    new TWEEN.Tween(state.boneMeshes[id].position).to(targets[id], 1000).easing(TWEEN.Easing.Cubic.Out).start();
  });
}

export function selectBone(id) {
  if (state.selectedBone) {
    state.selectedBone.material.color.setHex(0xeae2d2);
    state.selectedBone.material.emissiveIntensity = 0;
    if(state.labels[state.selectedBone.userData.boneId]) state.labels[state.selectedBone.userData.boneId].classList.remove('selected');
  }
  state.selectedBone = state.boneMeshes[id];
  if (!state.selectedBone) return;
  
  state.selectedBone.material.color.setHex(0xf97316);
  state.selectedBone.material.emissive.setHex(0xf97316);
  state.selectedBone.material.emissiveIntensity = 0.6;
  if(state.labels[id]) state.labels[id].classList.add('selected');
  
  const data = ANATOMY_DB.find(b => b.id === id);
  if(data) {
    document.getElementById('bone-detail').innerHTML = `
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
        <div class="detail-label">🏷️ Category</div>
        <div class="detail-text" style="color:var(--accent2);text-transform:uppercase">${data.category}</div>
      </div>
      <button class="action-btn" onclick="window.applyTeacherMode('${id}')">👨‍🏫 Isolate (Teacher Mode)</button>
      <button class="action-btn" onclick="window.resetMats()" style="background:rgba(255,255,255,0.05);color:var(--text)">🔄 Show All Bones</button>
    `;
  }
  
  const pos = state.selectedBone.position.clone();
  new TWEEN.Tween(window.appControls.target).to({x:pos.x, y:pos.y, z:pos.z}, 800).easing(TWEEN.Easing.Cubic.Out).start();
  
  if(window.innerWidth <= 1024) toggleSidebar('right');
}

export function deselectAll() {
  if (state.selectedBone) {
    state.selectedBone.material.color.setHex(0xeae2d2);
    state.selectedBone.material.emissiveIntensity = 0;
    if(state.labels[state.selectedBone.userData.boneId]) state.labels[state.selectedBone.userData.boneId].classList.remove('selected');
    state.selectedBone = null;
  }
  resetMats();
  document.getElementById('bone-detail').innerHTML = '<div class="detail-placeholder"><span class="icon">🔬</span>Select any structure to view<br>anatomical details</div>';
}

export function buildBoneList(filter='all') {
  const list = document.getElementById('bone-list');
  list.innerHTML = '';
  const items = filter === 'all' ? ANATOMY_DB : ANATOMY_DB.filter(b => b.cat === filter);
  items.forEach(b => {
    const div = document.createElement('div');
    div.className = 'bone-list-item';
    div.innerHTML = `<span class="bone-dot"></span><div><span>${b.name}</span><span class="bone-latin">${b.latinName}</span></div>`;
    div.onclick = () => { selectBone(b.id); if(window.innerWidth<=1024) closeAllSidebars(); };
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
  q = q.toLowerCase();
  const res = document.getElementById('search-results');
  if(!q) { res.style.display = 'none'; return; }
  const matches = ANATOMY_DB.filter(b => b.name.toLowerCase().includes(q) || b.latinName.toLowerCase().includes(q));
  res.innerHTML = matches.map(b => `<div class="search-result-item" onclick="window.selectBone('${b.id}');document.getElementById('search-results').style.display='none'">${b.name} <span class="search-result-latin">${b.latinName}</span></div>`).join('');
  res.style.display = matches.length ? 'block' : 'none';
}

export function setCameraView(view) {
  const dist = 4.5;
  let targetPos = new THREE.Vector3(0, 0, dist);
  if (view === 'back') targetPos.set(0, 0, -dist);
  if (view === 'left') targetPos.set(-dist, 0, 0);
  if (view === 'right') targetPos.set(dist, 0, 0);
  if (view === 'top') targetPos.set(0, dist, 0);
  
  new TWEEN.Tween(window.appControls.spherical).to({
    radius: dist,
    phi: view === 'top' ? 0.1 : Math.PI / 2,
    theta: view === 'front' ? 0 : view === 'back' ? Math.PI : view === 'left' ? -Math.PI/2 : Math.PI/2
  }, 1000).easing(TWEEN.Easing.Cubic.Out).start();
  new TWEEN.Tween(window.appControls.target).to({x:0, y:0, z:0}, 1000).easing(TWEEN.Easing.Cubic.Out).start();
}

export function resetCamera() { setCameraView('front'); }

export function takeScreenshot() {
  renderer.render(scene, camera);
  const dataURL = document.getElementById('three-canvas').toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'OsteoVis_Screenshot.png';
  a.click();
}

export function toggleLabels() {
  state.labelsOn = !state.labelsOn;
  document.getElementById('btn-labels').classList.toggle('active', state.labelsOn);
}

export function toggleRotate() {
  state.isRotating = !state.isRotating;
  document.getElementById('btn-rotate').classList.toggle('active', state.isRotating);
}
