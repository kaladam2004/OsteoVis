# OsteoVis — Premium 3D Human Skeleton Atlas

An interactive, medical-grade 3D anatomy viewer built with Three.js and Vite. Explore all 206 bones of the human skeleton in real time, with advanced tools for studying, teaching, and annotating anatomy.

---

## Features

### Core Viewing
- **Real-time 3D rendering** — MeshPhysicalMaterial with clearcoat + subsurface noise for realistic ivory bone texture
- **Post-processing** — SSAO ambient occlusion + Bloom glow via EffectComposer
- **Fragment-aware architecture** — multi-fragment bones (Femur: 20 fragments, Mandible: 37) all selectable and animated as one unit
- **206-bone database** — full ANATOMY_DB with name, Latin name, description, function, category

### Navigation & Selection
- **Click to select** — bone jumps forward and scales up; camera follows
- **Hover tooltip** — name, Latin name, category, description on hover
- **Searchable bone list** — real-time search across all 206 bones + Latin names
- **Category filter tabs** — Skull, Spine, Thorax, Upper Limb, Pelvis, Lower Limb, Hand, Foot
- **Keyboard shortcuts** — `/` focuses search, `Esc` deselects, `I` toggles bone isolation

### View Modes
| Mode | Description |
|------|-------------|
| **Explore** | Default free-roam with bone selection and detail panel |
| **Explode** | Bones spread outward from body center with per-category magnitude |
| **Systems** | Highlight anatomical systems: Axial, Appendicular, Skull, Spine, Thorax, Upper/Lower Limb |
| **Quiz** | Click the correct bone; beginner/intermediate/advanced difficulty pools |

### Camera
- **7 preset views** — Front, Back, Left, Right, Top, Bottom, Isometric (smooth tweened transitions)
- **Custom orbit controls** — spherical coordinate damping, zoom limits
- **Auto-rotate** toggle

### Clinical Detail Panel
Each selected bone shows:
- Latin name, description, function
- Articulations, muscle attachments (25 major bones)
- Clinical note, ossification timeline
- Category

### Advanced Tools

| Tool | Shortcut | Description |
|------|----------|-------------|
| **X-Ray Mode** | `☢` | All bones semi-transparent gray; selected bone stays orange |
| **Measurement** | `📏` | Click 2 points → distance in cm; click 3 → angle in degrees |
| **Annotations** | `📌` | Drop named pins on any bone; stored in localStorage |
| **Cross-Section** | `✂` | Sagittal / Transverse / Coronal clipping planes with live sliders |
| **Bone Isolation** | `🔬` / `I` | Selected bone visible; all others at 8% opacity |
| **Presentation Mode** | `🖥` | Fullscreen with large bone info overlay; hides all UI chrome |
| **Screenshot** | `📷` | Normal or transparent-background PNG via EffectComposer |

### Layer System
Skeleton layer active; Muscles, Nerves, Vessels, Ligaments show placeholder notification (extensible for future GLB layers).

### Persistence
- **URL sharing** — `?bone=femur_r&mode=learn&system=lower&view=isometric`
- **localStorage** — last selected bone, mode, view, quiz score/total
- **Annotations** — stored in `osteovis_annotations` localStorage key

### Performance
- Auto-detects low FPS on mobile (< 30 fps) → disables SSAO + Bloom in one shot
- `preserveDrawingBuffer: true` for reliable screenshot capture
- `logarithmicDepthBuffer: true` for Z-fighting prevention on fine bone geometry

### Quiz
- Beginner / Intermediate / Advanced difficulty pools
- Optional 30-second countdown timer with color-coded urgency
- Final score screen with A–F grade and accuracy percentage
- Score persisted across sessions via localStorage

---

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| Three.js | ^0.184.0 | 3D rendering, materials, raycasting |
| @tweenjs/tween.js | ^25.0.0 | Camera + bone animations |
| Vite | ^8.0.16 | Build tool + dev server |
| EffectComposer | (Three.js) | SSAO + Bloom post-processing |
| GLTFLoader | (Three.js) | GLB model loading |

---

## Getting Started

### 1. Install

```bash
git clone https://github.com/yourusername/osteovis.git
cd osteovis
npm install
```

### 2. Add the 3D model

Place your medically accurate `.glb` skeleton file at:

```
public/models/human-skeleton-separated-final.glb
```

The model must have **separated meshes per bone** (not a single merged mesh). The app auto-maps mesh names to the anatomy database using heuristic matching + manual overrides.

> If the model is missing the app logs a warning and loads nothing.

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, GitHub Pages, or any static host.

---

## Project Structure

```
OsteoVis/
├── index.html                  # App shell, all HTML structure
├── package.json
├── public/
│   └── models/
│       └── human-skeleton-separated-final.glb
└── src/
    ├── css/
    │   └── style.css           # All styles (glassmorphism, responsive, animations)
    └── js/
        ├── main.js             # Entry: event listeners, animation loop, startup restore
        ├── scene.js            # Renderer, lights, EffectComposer, SSAO, Bloom
        ├── builder.js          # GLTFLoader, bone mapping, fragment-aware material setup
        ├── controls.js         # Custom spherical CameraController with damping
        ├── ui.js               # All UI logic: modes, selection, tools, camera
        ├── quiz.js             # Quiz logic: pools, timer, score, final screen
        ├── crosssection.js     # Three.js clipping planes for cross-section viewer
        ├── measure.js          # Distance + angle measurement tool
        ├── annotations.js      # Pin annotations: 3D meshes + DOM labels + localStorage
        ├── layers.js           # Layer switcher (Skeleton/Muscles/Nerves/Vessels/Ligaments)
        ├── persistence.js      # localStorage prefs + URL params
        ├── data.js             # ANATOMY_DB (206 bones) + BONE_CLINICAL_DATA
        └── state.js            # Global mutable app state
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus bone search |
| `Esc` | Deselect bone / close sidebars / exit presentation |
| `I` | Toggle bone isolation (requires selection) |

---

## Browser Support

Modern browsers with WebGL 2.0: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

---

## License

MIT — free to use and modify for educational purposes.

> Ensure you comply with the licensing terms of any 3D `.glb` asset you use with this platform.
