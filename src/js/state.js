
export const state = {
  currentMode: 'normal',
  selectedBone: null,
  hoveredBone: null,
  isExploded: false,
  isRotating: false,
  labelsOn: false,
  currentFilter: 'all',
  boneMeshes: {},
  boneBasePositions: {},
  boneBaseScales: {},
  boneBaseQuaternions: {},
  labels: {},
  modelGroup: null,
  boneAllMeshes: [],
  boneMeshGroups: {},
  isMeasuring: false,
  isAnnotating: false,
  isXRay: false,
  isSection: false,
  isPresentationMode: false,
  isIsolated: false,
  annotations: {},
  annotationMeshes: {},
  annotationLabels: {},
  // Scene normalisation — set by builder.js after loading skeleton
  skeletonNormScale: 1,        // scale factor applied to modelGroup (1.8 / rawHeight)
  skeletonNormOffset: 0,       // world Y offset applied to modelGroup
  // Muscular System
  activePanel: 'bones',        // 'bones' | 'muscles'
  displayMode: 'skeleton',     // 'skeleton' | 'muscles' | 'combined'
  selectedMuscle: null,        // muscle data object from MUSCLE_DB
  skeletonVisible: true,       // bone mesh visibility (derived from displayMode)
  skeletonOpacity: 1.0,        // skeleton opacity (0–1)
  muscleHighlightedBones: [],  // bone IDs highlighted for muscle origin/insertion
  muscleFilter: 'all',         // current muscle category filter
  muscleMarkers: [],           // array of THREE.Mesh for origin/insertion
  // 3D muscle model — populated by muscle_loader.js after GLB loads
  muscleModelLoaded: false,
  muscleModelLoading: false,   // true while GLB is in flight
  muscleGroup: null,           // independent THREE.Group, sibling of modelGroup
  muscleAllMeshes: [],
  muscleMeshGroups: {},
  muscleMeshes: {},
  muscleOpacity: 0.92,
  selectedMuscleMesh: null,    // currently highlighted 3D muscle mesh
  // Nervous System — populated by nerve_loader.js after GLB loads
  nerveModelLoaded: false,
  nerveModelLoading: false,
  nerveModelMissing: false,
  nerveGroup: null,
  nerveAllMeshes: [],
  nerveMeshGroups: {},
  nerveMeshes: {},
  nerveOpacity: 0.85,
  nerveVisible: false,         // off by default, user activates layer
  selectedNerve: null,
  selectedNerveMesh: null,
  nerveMarkers: [],

  // Cardiovascular System — populated by cardio_loader.js after GLB loads
  cardioModelLoaded: false,
  cardioModelLoading: false,
  cardioModelMissing: false,
  cardioGroup: null,
  cardioAllMeshes: [],
  cardioMeshGroups: {},
  cardioMeshes: {},
  cardioOpacity: 1.0,
  cardioVisible: false,         // off by default, user activates layer
  selectedCardio: null,
  selectedCardioMesh: null
};
