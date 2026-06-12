import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';

// Premium Medical Bone Material
const boneMat = new THREE.MeshPhysicalMaterial({
  color: 0xE8DEC7,
  roughness: 0.65,
  metalness: 0.05,
  clearcoat: 0.2,
  clearcoatRoughness: 0.5,
});

const shaderModifier = (shader) => {
  shader.vertexShader = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0);
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
  ` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    vec3 transformed = vec3( position );
    float n1 = snoise(position * 50.0) * 0.005;
    float n2 = snoise(position * 120.0) * 0.002;
    transformed += objectNormal * (n1 + n2);
    `
  );
};
boneMat.onBeforeCompile = shaderModifier;

function mapBoneName(meshName) {
  const name = meshName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for(const b of ANATOMY_DB) {
     const dbName = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
     const dbLatin = b.latinName.toLowerCase().replace(/[^a-z0-9]/g, '');
     const id = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
     if (name.includes(id) || id.includes(name) || name.includes(dbName) || name.includes(dbLatin)) {
        return b.id;
     }
  }
  return null;
}

function createLabel(id, mesh) {
  const data = ANATOMY_DB.find(b=>b.id===id);
  if(!data) return;
  const div = document.createElement('div');
  div.className = 'bone-label';
  div.textContent = data.name;
  div.style.display = 'none';
  document.getElementById('canvas-wrap').appendChild(div);
  state.labels[id] = div;
}

function showFallbackUI() {
  const loading = document.getElementById('loading');
  if(loading) loading.style.display = 'none';
  
  const fallback = document.createElement('div');
  fallback.id = 'fallback-msg';
  fallback.style.position = 'absolute';
  fallback.style.inset = '0';
  fallback.style.display = 'flex';
  fallback.style.alignItems = 'center';
  fallback.style.justifyContent = 'center';
  fallback.style.zIndex = '500';
  fallback.style.backdropFilter = 'blur(10px)';
  fallback.style.backgroundColor = 'rgba(10,10,12,0.8)';
  fallback.innerHTML = `
    <div style="background:rgba(20,20,25,0.95); padding:40px; border-radius:12px; border:1px solid var(--accent); text-align:center; max-width:500px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
      <h2 style="color:var(--accent); margin-bottom:15px; font-size:24px;">Model Not Found</h2>
      <p style="color:var(--text); line-height:1.6; margin-bottom:20px; font-size:16px;">
        Separated skeleton model not found.<br><br>
        Please place your separated <strong>human-skeleton-separated-final.glb</strong> file in the <code style="color:var(--accent2)">public/models/</code> directory.
      </p>
      <div style="font-size:50px;">💀</div>
    </div>
  `;
  document.getElementById('canvas-wrap').appendChild(fallback);
}

export function loadSkeletonModel() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('/models/human-skeleton-separated-final.glb', (gltf) => {
       const model = gltf.scene;
       const meshes = [];
       
       model.traverse((child) => {
         if (child.isMesh && child.visible) {
            meshes.push(child);
         }
       });
       
       const modelGroup = new THREE.Group();
       scene.add(modelGroup);

       meshes.forEach((child) => {
          modelGroup.add(child);
          child.material = boneMat.clone();
          child.castShadow = true;
          child.receiveShadow = true;
          
          const mappedId = mapBoneName(child.name);
          const finalId = mappedId ? mappedId : ('unmapped_' + child.uuid);
          
          child.userData.boneId = finalId;
          state.boneMeshes[finalId] = child;
          state.boneBasePositions[finalId] = child.position.clone();
          state.boneBaseScales[finalId] = child.scale.clone();
          state.boneBaseQuaternions[finalId] = child.quaternion.clone();
          
          if(mappedId) createLabel(mappedId, child);
       });
       
       // Center and Scale
       const box = new THREE.Box3().setFromObject(modelGroup);
       const size = box.getSize(new THREE.Vector3());
       if(size.y > 0) {
          const scale = 1.8 / size.y;
          modelGroup.scale.setScalar(scale);
          modelGroup.updateMatrixWorld(true);
       }
       
       const newBox = new THREE.Box3().setFromObject(modelGroup);
       const offset = -newBox.min.y - 0.9;
       modelGroup.position.y += offset;
       modelGroup.updateMatrixWorld(true);
       
       // Re-read world positions into base positions
       meshes.forEach(c => {
          const worldPos = new THREE.Vector3();
          c.getWorldPosition(worldPos);
          // Wait, for zoom-forward we use parent.worldToLocal, so we should keep the LOCAL transform!
          // Actually, our zoom-forward uses `targetLocal = mesh.parent.worldToLocal(targetWorld)`.
          // We MUST store local transforms to restore them on Reset.
          state.boneBasePositions[c.userData.boneId].copy(c.position);
          state.boneBaseQuaternions[c.userData.boneId].copy(c.quaternion);
          state.boneBaseScales[c.userData.boneId].copy(c.scale);
       });
       
       const loading = document.getElementById('loading');
       if(loading) {
         loading.style.opacity = 0;
         setTimeout(() => loading.style.display = 'none', 500);
       }
       
       resolve();
    }, undefined, (error) => {
       console.error("Failed to load GLB:", error);
       showFallbackUI();
       reject(error);
    });
  });
}
