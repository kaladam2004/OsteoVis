import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function getDracoLoader() {
  const dracoLoader = new DRACOLoader();
  // Use public CDN for Draco decoders to avoid needing local static files
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  return dracoLoader;
}
