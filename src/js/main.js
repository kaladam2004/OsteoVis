
import '../css/style.css';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { scene, camera, renderer, composer, canvas } from './scene.js';
import { CameraController } from './controls.js';
import { loadSkeletonModel } from './builder.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import * as UI from './ui.js';
import { checkQuizAnswer } from './quiz.js';

const controls = new CameraController(camera, canvas);
window.appControls = controls;
export { controls };

// Expose UI functions to global window for inline onclick handlers in HTML
Object.assign(window, UI);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(Object.values(state.boneMeshes), false);
  const hit = hits.length ? hits[0].object : null;

  if (hit && hit !== state.selectedBone) {
    if(state.hoveredBone && state.hoveredBone !== hit && state.hoveredBone !== state.selectedBone) state.hoveredBone.material.color.setHex(0xeae2d2);
    state.hoveredBone = hit;
    hit.material.color.setHex(0xfcd34d);
    const data = ANATOMY_DB.find(b => b.id === hit.userData.boneId);
    if(data) {
      document.getElementById('tooltip-name').textContent = data.name;
      document.getElementById('tooltip-latin').textContent = data.latinName;
      document.getElementById('tooltip-cat').textContent = data.category;
      document.getElementById('tooltip-desc').textContent = data.description;
      const tt = document.getElementById('tooltip');
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 15) + 'px';
      tt.style.top = e.clientY + 'px';
    }
    canvas.style.cursor = 'pointer';
  } else {
    if(state.hoveredBone && state.hoveredBone !== state.selectedBone) state.hoveredBone.material.color.setHex(0xeae2d2);
    state.hoveredBone = null;
    document.getElementById('tooltip').style.display = 'none';
    canvas.style.cursor = 'default';
  }
});

canvas.addEventListener('click', e => {
  if(state.hoveredBone) {
    if(state.currentMode === 'quiz' && window.quizTarget) checkQuizAnswer(state.hoveredBone.userData.boneId);
    else UI.selectBone(state.hoveredBone.userData.boneId);
  } else {
    UI.deselectAll();
  }
});

const tempV = new THREE.Vector3();
function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  controls.update();
  
  if(state.isRotating) scene.rotation.y += 0.005;

  if(state.labelsOn || state.selectedBone) {
    for(let id in state.labels) {
      const mesh = state.boneMeshes[id];
      const div = state.labels[id];
      if(!mesh || (!state.labelsOn && mesh !== state.selectedBone)) { div.style.display = 'none'; continue; }
      
      tempV.copy(mesh.position).project(camera);
      if(tempV.z > 1.0) { div.style.display = 'none'; continue; }
      
      const dist = camera.position.distanceTo(mesh.position);
      if(dist > 6.0 && mesh !== state.selectedBone) { div.style.display = 'none'; continue; }
      
      const x = (tempV.x * .5 + .5) * window.innerWidth;
      const y = (tempV.y * -.5 + .5) * window.innerHeight;
      
      div.style.display = 'block';
      div.style.transform = `translate(-50%, -100%) translate(${x}px, ${y-10}px) scale(${Math.max(0.6, 1 - dist/12)})`;
    }
  } else {
    for(let id in state.labels) state.labels[id].style.display = 'none';
  }

  composer.render();
}

// Initialize
loadSkeletonModel().catch(e => console.warn('Awaiting user to place GLB file.'));
UI.buildBoneList();
window.dispatchEvent(new Event('resize'));
animate();
