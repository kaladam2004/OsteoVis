
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

export const canvas = document.getElementById('three-canvas');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 4.5);

const ambientLight = new THREE.AmbientLight(0x405060, 0.8);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x112233, 0.4);
scene.add(hemiLight);
const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
mainLight.position.set(5, 8, 6);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.bias = -0.0005;
scene.add(mainLight);
const fillLight = new THREE.DirectionalLight(0x88bbff, 0.6);
fillLight.position.set(-6, 2, 4);
scene.add(fillLight);
const rimLight = new THREE.SpotLight(0xffffff, 2.5, 0, Math.PI/4, 0.5, 1);
rimLight.position.set(0, 6, -8);
rimLight.lookAt(0,0,0);
scene.add(rimLight);

export const renderScene = new RenderPass(scene, camera);
export const ssaoPass = new SSAOPass(scene, camera, canvas.clientWidth, canvas.clientHeight);
ssaoPass.kernelRadius = 16;
ssaoPass.minDistance = 0.005;
ssaoPass.maxDistance = 0.1;
export const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.5, 0.85);
bloomPass.threshold = 0.5;
export const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(ssaoPass);
composer.addPass(bloomPass);

window.addEventListener('resize', () => {
  const w = document.getElementById('canvas-wrap').clientWidth;
  const h = document.getElementById('canvas-wrap').clientHeight;
  if(w===0 || h===0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  ssaoPass.setSize(w, h);
});
