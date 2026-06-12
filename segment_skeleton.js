import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;
global.Blob = dom.window.Blob;
global.FileReader = dom.window.FileReader;
global.URL = { createObjectURL: () => 'blob:dummy' };

const loader = new GLTFLoader();
const data = fs.readFileSync('public/models/human-skeleton.glb').buffer;

loader.parse(data, '', (gltf) => {
    console.log('Loaded GLTF');
    const model = gltf.scene;
    
    let origMesh = null;
    model.traverse((c) => {
        if (c.isMesh && !origMesh) origMesh = c;
    });
    
    if(!origMesh) {
        console.error("No mesh found");
        process.exit(1);
    }
    
    const geometry = origMesh.geometry;
    const index = geometry.index.array;
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
    const vertexCount = positions.length / 3;
    
    const parent = new Int32Array(vertexCount);
    for(let i=0; i<vertexCount; i++) parent[i] = i;
    
    function find(i) {
        let root = i;
        while(root !== parent[root]) root = parent[root];
        let curr = i;
        while(curr !== root) {
            let nxt = parent[curr];
            parent[curr] = root;
            curr = nxt;
        }
        return root;
    }
    function union(i, j) {
        let rootI = find(i);
        let rootJ = find(j);
        if(rootI !== rootJ) parent[rootI] = rootJ;
    }
    
    // Union by edge
    for(let i=0; i<index.length; i+=3) {
        union(index[i], index[i+1]);
        union(index[i+1], index[i+2]);
    }
    
    // Union by position to fix UV seams
    const posMap = new Map();
    for(let i=0; i<vertexCount; i++) {
        const key = `${positions[i*3].toFixed(3)},${positions[i*3+1].toFixed(3)},${positions[i*3+2].toFixed(3)}`;
        if(posMap.has(key)) {
            union(i, posMap.get(key));
        } else {
            posMap.set(key, i);
        }
    }
    
    const rootToTriangles = new Map();
    for(let i=0; i<index.length; i+=3) {
        const root = find(index[i]);
        if(!rootToTriangles.has(root)) rootToTriangles.set(root, []);
        rootToTriangles.get(root).push(index[i], index[i+1], index[i+2]);
    }
    
    const separatedGroup = new THREE.Group();
    let partId = 0;
    
    // We will assign standard anatomical names heuristically
    const usedNames = new Set();
    function getHeuristicName(center, size) {
        const x = center.x;
        const y = center.y;
        const z = center.z;
        const side = x < 0 ? '_R' : '_L'; // Assuming model faces +Z, X<0 is Right from viewer, wait, anatomically if facing us, X<0 is Right side of screen, which is patient's Right. Let's use generic suffix.
        
        let name = "Unmapped";
        
        // Height is ~26.
        if (y > 23) {
            if (size.y > 1.5) name = "Skull";
            else if (y < 24) name = "Mandible";
            else name = "Frontal_Bone";
        } else if (y < 2.5) {
            name = "Foot" + side;
            if(size.x < 0.5) name = "Phalanges_Foot" + side;
        } else if (y >= 2.5 && y < 13) {
            if (y > 7.5) name = "Femur" + side;
            else if (size.y > 2) name = "Tibia" + side;
            else name = "Fibula" + side;
        } else if (y >= 13 && y < 16) {
            if (Math.abs(x) < 1.0) name = "Sacrum";
            else name = "Pelvis" + side;
        } else if (y >= 16 && y <= 23) {
            if (Math.abs(x) > 2.0) {
                // Arms
                if (y > 19) name = "Humerus" + side;
                else if (y > 16.5) name = "Radius" + side; // or Ulna
                else name = "Hand" + side;
            } else if (Math.abs(x) > 1.2 && y > 21.5) {
                name = "Scapula" + side;
            } else if (Math.abs(x) > 0.5 && y > 22) {
                name = "Clavicle" + side;
            } else if (Math.abs(x) > 0.5) {
                name = "Rib" + side;
            } else {
                name = "Spine";
            }
        }
        
        // Ensure unique names
        let finalName = name;
        let counter = 1;
        while(usedNames.has(finalName)) {
            finalName = name + "_" + counter;
            counter++;
        }
        usedNames.add(finalName);
        return finalName;
    }
    
    rootToTriangles.forEach((triangles) => {
        if(triangles.length < 12) return;
        
        const newGeo = new THREE.BufferGeometry();
        const newPos = new Float32Array(triangles.length * 3);
        const newNorm = normals ? new Float32Array(triangles.length * 3) : null;
        
        for(let i=0; i<triangles.length; i++) {
           const idx = triangles[i];
           newPos[i*3] = positions[idx*3];
           newPos[i*3+1] = positions[idx*3+1];
           newPos[i*3+2] = positions[idx*3+2];
           if(normals) {
             newNorm[i*3] = normals[idx*3];
             newNorm[i*3+1] = normals[idx*3+1];
             newNorm[i*3+2] = normals[idx*3+2];
           }
        }
        newGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
        if(normals) newGeo.setAttribute('normal', new THREE.BufferAttribute(newNorm, 3));
        
        newGeo.computeBoundingBox();
        const box = newGeo.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const safeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const newMesh = new THREE.Mesh(newGeo, safeMaterial);
        newMesh.name = getHeuristicName(center, size);
        
        separatedGroup.add(newMesh);
        partId++;
    });
    
    console.log(`Separated into ${partId} labeled bones.`);
    
    // Export
    const exporter = new GLTFExporter();
    exporter.parse(separatedGroup, (result) => {
        fs.writeFileSync('public/models/human-skeleton-separated-final.glb', Buffer.from(result));
        console.log("Successfully created public/models/human-skeleton-separated-final.glb");
    }, (error) => {
        console.error(error);
    }, { binary: true });
    
}, (err) => {
    console.error(err);
});
