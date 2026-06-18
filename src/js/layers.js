export const LAYERS = {
  skeleton:  { label: 'Skeleton',   icon: '🦴', loaded: true  },
  muscles:   { label: 'Muscles',    icon: '💪', loaded: false },
  nerves:    { label: 'Nerves',     icon: '⚡', loaded: false },
  vessels:   { label: 'Vessels',    icon: '🩸', loaded: false },
  ligaments: { label: 'Ligaments',  icon: '🔗', loaded: false },
};

let activeLayer = 'skeleton';
let _dismissTimer = null;

export function setLayer(layerKey) {
  if (!LAYERS[layerKey]) return;
  activeLayer = layerKey;
  const layer = LAYERS[layerKey];

  document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.layer-btn[data-layer="${layerKey}"]`)?.classList.add('active');

  const ph = document.getElementById('layer-placeholder');
  if (!ph) return;

  if (!layer.loaded) {
    ph.querySelector('.layer-ph-name').textContent = layer.label;
    ph.style.display = 'flex';
    clearTimeout(_dismissTimer);
    _dismissTimer = setTimeout(() => { ph.style.display = 'none'; }, 4000);
  } else {
    clearTimeout(_dismissTimer);
    ph.style.display = 'none';
  }
}

export function getActiveLayer() { return activeLayer; }
