import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import { JSDOM } from 'jsdom';

// Polyfill DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;
global.atob = dom.window.atob;
global.btoa = dom.window.btoa;
global.Blob = dom.window.Blob;

const loader = new GLTFLoader();
const data = fs.readFileSync('public/models/human-skeleton.glb').buffer;

loader.parse(data, '', (gltf) => {
    console.log('Loaded GLTF');
}, (err) => {
    console.error(err);
});
