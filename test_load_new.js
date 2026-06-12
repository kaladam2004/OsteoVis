import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;
global.Blob = dom.window.Blob;
global.URL = { createObjectURL: () => 'blob:dummy' };

const loader = new GLTFLoader();
const data = fs.readFileSync('public/models/human-skeleton-separated.glb').buffer;

loader.parse(data, '', (gltf) => {
    console.log('Successfully loaded newly exported GLB in Node!');
    console.log('Meshes count:', gltf.scene.children.length);
}, (err) => {
    console.error('FAILED to load newly exported GLB:', err);
});
