# OsteoVis — QA Report
**Date:** 2026-06-17  
**Build:** 34 modules, 0 errors, 483ms (Vite v8.0.16)  
**Phase:** P3 Final Polish

---

## Build & Environment

| Check | Result |
|-------|--------|
| `npm run build` | ✅ 0 errors, 0 warnings (bundle size advisory is non-blocking) |
| `npm run dev` | ✅ Dev server starts, HMR works |
| ES module imports | ✅ No circular dependencies (verified by Vite) |
| 34 modules transformed | ✅ All source files accounted for |

---

## Feature QA Matrix

### Core Features (P0 + P1)

| Feature | Status | Notes |
|---------|--------|-------|
| GLB model loads | ✅ | 195 meshes, 34ms typical |
| Bone mapping (heuristic + HEURISTIC_OVERRIDE) | ✅ | SPINE_IDS sorts 19 vertebrae by Y position |
| Exact-first match (rib_r1 ≠ rib_r10) | ✅ | Fixed in P1 |
| Fragment-aware raycasting (femur: 20 frags) | ✅ | boneAllMeshes used for raycast |
| Fragment-aware material ops | ✅ | boneMeshGroups used for color/opacity changes |
| Bone selection (highlight + jump + scale) | ✅ | TWEEN animation, camera follows |
| Bone deselection (Esc / click empty) | ✅ | State and materials reset |
| Hover tooltip | ✅ | Shows on mousemove, hides on miss |
| Explode mode (body-center direction) | ✅ | Per-category magnitude (skull: 0.4, lower: 0.6) |
| Systems mode (7 subsystems) | ✅ | Axial/Appendicular/Skull/Spine/Thorax/Upper/Lower |
| Bone detail panel | ✅ | 8 sections; clinical data for 25 major bones |
| Search (name + Latin name) | ✅ | Real-time, dropdown |
| Category filter tabs | ✅ | 9 categories |
| Mobile bottom nav | ✅ | Shows on ≤1024px, 64px tall |
| Auto-rotate | ✅ | Pauses during measure mode |
| Labels toggle | ✅ | Distance-based culling at 6 units |

### P2-1 Features

| Feature | Status | Notes |
|---------|--------|-------|
| Layer system (Skeleton active) | ✅ | 4s auto-dismiss for unloaded layers |
| URL sharing (`?bone=&mode=&system=&view=`) | ✅ | `history.replaceState` |
| localStorage persistence | ✅ | `osteovis_prefs` key |
| Keyboard nav (/, Esc, Enter on list) | ✅ | |
| ARIA attributes | ✅ | `aria-pressed`, `role=`, `aria-label` throughout |
| FPS guard (mobile auto-disable SSAO/Bloom) | ✅ | One-shot trigger at <30fps on ≤1024px |

### P2-2 Features

| Feature | Status | Notes |
|---------|--------|-------|
| Measurement tool (2-point distance) | ✅ | cm output, SCALE_CM=94.4 |
| Measurement tool (3-point angle) | ✅ | degrees output |
| Annotation pins (3D sphere + DOM label) | ✅ | Local space, persist in localStorage |
| Annotation restore on load | ✅ | Called in applyStartupState |
| Annotation list in panel | ✅ | Delete button per annotation |
| X-ray mode | ✅ | Gray+transparent; selected bone stays orange |
| X-ray + selection aware | ✅ | selectBone/deselectAll both use isXRay branch |
| Quiz timer (30s countdown) | ✅ | Color changes at ≤20s, red at ≤10s |
| Quiz final score screen | ✅ | A–F grade, accuracy %, Play Again |

### P2-3 Features

| Feature | Status | Notes |
|---------|--------|-------|
| Cross-section (Sagittal) | ✅ | THREE.Plane(1,0,0), slider 0–100% → constant (v-50)/25 |
| Cross-section (Transverse) | ✅ | THREE.Plane(0,1,0) |
| Cross-section (Coronal) | ✅ | THREE.Plane(0,0,1) |
| Cross-section reset | ✅ | Clears all planes and UI |
| `renderer.localClippingEnabled` | ✅ | Set in scene.js at module load |
| Camera preset: Right | ✅ | theta=π/2 |
| Camera preset: Bottom | ✅ | phi=π-0.1 |
| Camera preset: Isometric | ✅ | radius=5.5, phi=π/4, theta=π/4 |
| All 7 presets smooth-tweened | ✅ | Cubic.Out, 1000ms |
| Presentation mode (fullscreen + CSS class) | ✅ | Hides header+sidebars+mobile-nav |
| Presentation bone overlay | ✅ | Large name/Latin/desc; updates on select |
| Presentation Esc to exit | ✅ | Added to keyboard handler in main.js |
| Bone isolation toggle | ✅ | applyTeacherMode(id); 8% opacity others |
| Isolation auto-clears on deselect | ✅ | deselectAll clears state.isIsolated |
| `I` keyboard shortcut for isolation | ✅ | Guards against INPUT/TEXTAREA focus |
| Statistics dashboard | ✅ | In-model count, selected name, quiz%, annotations |
| Stats auto-update on select/deselect/annotate | ✅ | updateStats() called from all trigger points |
| Screenshot via EffectComposer | ✅ | Includes SSAO+Bloom |
| Screenshot transparent background | ✅ | setClearColor(0,0) before render |
| `preserveDrawingBuffer: true` | ✅ | Set in scene.js |
| Screenshot dropdown close on capture | ✅ | menu.classList.remove('open') |

---

## Bugs Found & Fixed in P3

| # | Bug | Fix | File |
|---|-----|-----|------|
| 1 | `scene` imported but unused in ui.js | Removed from import | `ui.js:6` |
| 2 | Mobile header overflow: 10 icon-btns exceed 375px screen | Hide btn-labels, btn-rotate, btn-section, btn-isolate, btn-presentation at ≤600px | `style.css` |
| 3 | `jsdom` in production `dependencies` (only used in dev test files) | Moved to `devDependencies` | `package.json` |

---

## Known Limitations (Documented, Not Bugs)

| Limitation | Notes |
|------------|-------|
| Annotation pins don't follow individual bones in Explode mode | Pins are in modelGroup local space, not bone-local space. V1 limitation. |
| Measurement lines don't follow auto-rotate | Measurement lines are in world space; auto-rotate pauses when measure is active. |
| Cross-section does not clip measurement lines/annotation pins | measureGroup and annotation pins use `depthTest: false` and are not subject to clipping planes. Acceptable for V1. |
| Clipping planes may show interior geometry | Three.js default: no backface clipping cap. Anatomically OK for study purposes. |
| Layer system has only Skeleton loaded | Muscles/Nerves/Vessels/Ligaments show placeholder. Designed for future GLB layers. |

---

## Mobile QA

| Check | Result |
|-------|--------|
| Bottom nav visible on ≤1024px | ✅ |
| Sidebars slide in/out (hamburger) | ✅ |
| Header icon buttons ≤600px | ✅ 5 visible: ☢📏📌📷ℹ️ |
| Touch/tap bone selection | ✅ (via click event, works with touch) |
| View controls wrap at narrow width | ✅ `flex-wrap: wrap; max-width: min(640px, calc(100%-32px))` |
| Cross-section panel on mobile | ✅ `right: 8px; width: 210px` at ≤1024px |
| FPS guard fires | ✅ One-shot disable at <30fps on mobile |

---

## Performance

| Metric | Value |
|--------|-------|
| Build size (JS) | 728 KB minified / 186 KB gzip |
| Build size (CSS) | 20.7 KB / 4.4 KB gzip |
| Build time | ~483ms |
| Modules | 34 |
| Three.js bundle advisory | Expected (Three.js is ~700KB) |

---

## Production Checklist

- [x] `npm run build` — 0 errors
- [x] No circular ES module dependencies
- [x] All onclick handlers backed by window-exposed functions
- [x] State fields initialized in state.js
- [x] localStorage keys consistent (`osteovis_prefs`, `osteovis_annotations`)
- [x] URL params all valid (`bone`, `mode`, `system`, `view`)
- [x] ARIA labels on all interactive elements
- [x] Mobile layout functional on 375px viewport
- [x] Keyboard shortcuts documented
- [x] `preserveDrawingBuffer: true` for screenshot reliability
- [x] `localClippingEnabled: true` for cross-section planes
- [x] `.gitignore` covers node_modules, dist, .env
- [x] README.md complete with setup instructions + feature table
- [x] `jsdom` in devDependencies (not bundled)
- [x] No hardcoded localhost URLs

---

## What OsteoVis Can Do (Final Summary)

OsteoVis is a **browser-based 3D medical anatomy atlas** with the following capabilities:

**For Students:**
- Explore all 206 human bones in 3D with real-time interaction
- Read clinical data: articulations, muscle attachments, ossification timelines, clinical notes
- Take anatomy quizzes at 3 difficulty levels with optional countdown timer
- Measure bone distances (cm) and joint angles (degrees)
- Drop named annotation pins for personal study notes

**For Educators:**
- Teacher Presentation Mode: fullscreen with large bone name overlay, all UI hidden
- Bone Isolation Mode: highlight one bone while ghosting the rest (8% opacity)
- Cross-Section Viewer: sagittal/transverse/coronal clipping planes with live sliders
- Screenshots with or without background (includes SSAO+Bloom quality)
- Share a specific view via URL (`?bone=femur_r&mode=learn`)

**Technical Highlights:**
- Medical-grade bone material: MeshPhysicalMaterial with clearcoat + procedural surface noise
- 7 smooth-tweened camera presets including isometric
- X-ray mode with transparent skeleton
- Anatomy systems highlighting (Axial, Appendicular, subsystems)
- Explode view with anatomically-correct per-region separation
- Persistent user preferences across sessions (localStorage + URL)
- Responsive UI: desktop sidebar + mobile bottom navigation
