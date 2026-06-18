# OsteoVis — Аудити Пурраи Барнома
**Сана:** 2026-06-17  
**Версия:** 1.0.0  
**Ҳадаф:** Расидан ба сатҳи BioDigital Human / Visible Body

---

## 1. ҚУВВАҲОИ БАРНОМА

### Меъмории код
- Модулӣ, хуб ҷудошуда: `scene.js`, `builder.js`, `controls.js`, `ui.js`, `quiz.js`, `data.js`, `state.js`
- Ҳеч framework нест — vanilla JS+CSS+HTML, бор кардан хеле зуд аст
- Vite build tool — hot reload ва bundling дуруст кор мекунад
- ES Modules — import/export тоза

### 3D / Rendering
- **SSAO** (Screen Space Ambient Occlusion) — чуқурӣ ва сояи реалистикӣ
- **UnrealBloomPass** — равшании мулоим
- **ACESFilmic tone mapping** — ранги тиббӣ
- **MeshPhysicalMaterial + clearcoat** — матни устухон реалистик
- **Custom vertex shader (Simplex Noise)** — текстураи нозук ба сатҳи устухон
- **PCFSoft shadows** — сояи нарм
- **Hemisphere + Directional + Rim lights** — 5 нури хуб танзимшуда
- Resize handler дуруст кор мекунад

### UI/UX
- Glassmorphism dizayn — зебо, муосир
- Шрифтҳои касбӣ: Inter + Space Grotesk (Google Fonts)
- Responsive: sidebar-ҳо дар мобайл слайд мешаванд
- Tooltip ҳангоми hover — ном, лотинӣ, категория, тавсиф
- Camera presets: Front / Back / Side / Top + Reset
- Auto-rotate toggle
- Screenshot download (PNG)
- Floating labels бо масофабандӣ
- Loading screen бо анимация

### Маълумотпоя (data.js)
- **206 устухон** дар ANATOMY_DB бо id, name, latinName, category, description, fn
- Ҳамаи бахшҳо: Skull (28), Vertebral (26), Thorax (27), Upper (10), Hand (54), Pelvis (6), Lower (8), Foot (47)
- Номҳои лотинӣ дуруст

### Explode Mode
- TWEEN анимация, магнитудҳо аз рӯи категория: `skull:0.4`, `upper:0.5`, `lower:0.6`, `hand:0.7`, `foot:0.7`
- Reset ба ҷои аслӣ

### Quiz Mode
- 3 сатҳ: Beginner / Intermediate / Advanced
- Pool-ҳои ҷудогона барои ҳар сатҳ
- Feedback + highlight: сабз (дуруст) / сурх (нодуруст)
- 2 сония баъд ба саволи навбатӣ мегузарад

### Камера
- Custom CameraController (OrbitControls бидуни dependency)
- Momentum/damping: `thetaVel *= 0.9`
- Touch: 1 ангушт = orbit, 2 ангушт = pinch-zoom
- Right-click drag = pan
- Zoom limits: 1.0 — 15.0
- Bone click: камера ба устухон zoom мекунад + target-ро мегузаронад

### Инструментҳои ёрдамчӣ
- `segment_skeleton.js` — алгоритми Union-Find барои ҷудо кардани устухонҳо аз як mesh
- `split_glb.js` — озмоиши GLTFLoader дар Node.js

---

## 2. КАМБУДИҲО

### 2.1 Категорияҳои "Hand" ва "Foot" дар sidebar нестанд
Вкладкаҳои sidebar: All / Skull / Spine / Thorax / Upper Limb / Pelvis / Lower Limb.  
`data.js`-да `cat:'hand'` ва `cat:'foot'` вуҷуд дорад, аммо вкладкаи мувофиқ нест.  
**Натиҷа:** Дар "Upper Limb" ва "Lower Limb" дастҳо/пойҳо намоиш дода намешаванд.

### 2.2 "Systems" режими холӣ аст
Тугмаи "Systems" зер мешавад, аммо ягон амали иловагӣ нест — танҳо `resetMats()` + explode чӯб кунонда мешавад. Системаҳои оссификация, мушакҳо, асаб нишон дода намешавад.

### 2.3 Loading bar ҳаракат намекунад
`loader.load('/models/...', callback, undefined, errorCallback)` — аргументи сеюм (`progress`) `undefined` дода мешавад. Loading bar ҳамеша `width: 0%`.

### 2.4 Ҳолати "selected" дар списки устухонҳо синхрон намешавад
Вақте аз 3D-модел устухонеро клик мекунед, дар sidebar-и чап list item highlighted намешавад. Танҳо аз list клик кардан visual бозхӯрд медиҳад.

### 2.5 Режими мобайл: тугмаҳои режим гум шудаанд
`@media (max-width: 1024px) { .header-center { display: none; } }` — тугмаҳои Explore / Explode / Systems / Quiz дар мобайл намоён нестанд ва роҳи дигари дастрас кардан нест.

### 2.6 "Visible" шумора ҳамеша 206 аст
`#visible-count` ҳеч вақт тағйир намеёбад — на аз filter, на аз teacher mode.

### 2.7 Screenshot бе postprocessing ранг мегирад
`takeScreenshot()` аввал `renderer.render(scene, camera)` мехонад (postprocessing бидун), баъд canvas мегирад. Натиҷа bloom ва SSAO ҳастанд, аммо рефракция дуруст нест.

### 2.8 tools/ директория холӣ аст
Директория сохта шудааст, аммо ягон файл надорад.

### 2.9 `test_puppeteer.js` dependency надорад
`puppeteer` дар `package.json` нест, аммо скрипт мавҷуд аст.

---

## 3. ХАТОГИҲОИ ТЕХНИКӢ (BUGS)

### 3.1 🔴 BUG КРИТИКӢ: `setQuizLevel` дар `window` нест

**Файл:** `index.html:101`, `quiz.js`, `ui.js`, `main.js`

```html
<!-- index.html: -->
<button onclick="setQuizLevel('beginner',this)">Beginner</button>
```

```js
// quiz.js: экспорт карда мешавад
export { setQuizLevel, nextQuizQuestion, checkQuizAnswer };

// ui.js: импорт карда мешавад, аммо RE-EXPORT намешавад
import { setQuizLevel, nextQuizQuestion, checkQuizAnswer } from './quiz.js';

// main.js: танҳо UI.* ба window дода мешавад
Object.assign(window, UI); // setQuizLevel дар UI нест!
```

**Натиҷа:** Дар браузер клик ба тугмаи "Beginner/Med/Hard" → `Uncaught ReferenceError: setQuizLevel is not defined`

---

### 3.2 🔴 BUG: `window.camera` ҳамеша `undefined` аст

**Файл:** `ui.js:121`

```js
const camWorld = window.camera ? window.camera.position.clone() : new THREE.Vector3(0,0,5);
```

`camera` ба `window` ҳеч вақт дода намешавад. Натиҷа: zoom-forward ҳамеша аз position `(0,0,5)` ҳисоб мешавад, на аз camera-и воқеӣ. Zoom-forward эффект нодуруст кор мекунад.

---

### 3.3 🔴 BUG: Quiz crash агар устухон map нашуда бошад

**Файл:** `quiz.js:45`

```js
state.boneMeshes[quizTarget].material.color.setHex(...)
// агар quizTarget-и устухон дар state.boneMeshes набошад → TypeError: Cannot read properties of undefined
```

Баъзе quiz pool-ҳо (`malleus_r`, `incus_r`, `stapes_r`) дар GLB модел эҳтимол map нашудаанд — crash мешавад.

---

### 3.4 🟡 BUG: Импорти даврӣ (circular import)

**Файлҳо:** `ui.js` ↔ `main.js`

```js
// ui.js импорт мекунад:
import { controls } from './main.js';

// main.js импорт мекунад:
import * as UI from './ui.js';
```

JavaScript ES modules circular dependency-ро ҳал мекунад, аммо ин fragile аст. Агар `controls` пеш аз init истифода шавад → `undefined`.

---

### 3.5 🟡 BUG: `mapBoneName()` – mapping заиф

**Файл:** `builder.js:77`

`segment_skeleton.js` номҳои эвристикӣ месозад: `"Femur_R"`, `"Skull"`, `"Spine_1"` и ҳ.к.  
`mapBoneName()` ин номро бо ANATOMY_DB муқоиса мекунад, аммо:
- `"Femur_R"` vs id `"femur_r"` — пас аз `replace(/[^a-z0-9]/g, '')` ба `"femurr"` vs `"femurr"` — мувофиқ мешавад ✓
- `"Spine_1"` vs `"c1"` / `"t1"` / `"l1"` — mapping нодуруст мешавад
- `"Skull"` — дар ANATOMY_DB `"frontal"`, `"parietal_r"` и ҳ.к. — mapping нест

**Натиҷа:** Аксари устухонҳо `unmapped_<uuid>` мешаванд → hover/click tooltip надоранд → quiz crash мешавад.

---

### 3.6 🟡 BUG: `scene.rotation.y` auto-rotate деформация
**Файл:** `main.js:70`

```js
if(state.isRotating) scene.rotation.y += 0.005;
```

Тамоми `scene`-ро мегардонад — lights ҳам мегарданд! Натиҷа: равшанӣ ҳангоми auto-rotate тағйир меёбад. Бояд `modelGroup.rotation.y` гардонда шавад.

---

### 3.7 🟡 BUG: Tooltip дар дасти чап аз экран мебарояд
**Файл:** `main.js:43-44`

```js
tt.style.left = (e.clientX + 15) + 'px';
tt.style.top = e.clientY + 'px';
```

Tooltip ҳамеша +15px аз рости муш нишон дода мешавад. Агар курсор дар тарафи рости экран бошад, tooltip аз экран мебарояд.

---

## 4. КАМБУДИҲОИ 3D / АНАТОМИЯ

### 4.1 Ҷудокунии устухонҳо нодуруст аст
`segment_skeleton.js` Union-Find алгоритм истифода мебарад — ин ба геометрияи ҷисмӣ алоқамандӣ дорад (connected components), на ба анатомия. Мушкилот:
- Vertebrae-ҳо ки дар ҷои наздик ҳастанд мумкин аст ба ҳам пайваст бошанд
- 3 ossicles-и гӯш (malleus, incus, stapes) аз модели GLB эҳтимолан ҷоӣ надоранд
- Hyoid, vomer, ethmoid — хурд ва бо skull пайваст бошанд

### 4.2 Explosion бар асоси normalize() нодуруст аст
```js
targets[id] = base.clone().add(base.clone().normalize().multiplyScalar(mag));
```
`base.normalize()` вектори мавқеи маҳаллиро normalize мекунад. Агар устухон дар маркази координат набошад (мисол, vertebrae дар y-axis), explosion нодуруст аст — устухонҳо ба тарафи вектор, на аз маркази бадан мепарند.

### 4.3 Маводи устухон SSS надорад
Устухони воқеӣ sub-surface scattering (SSS) дорад — равшанӣ аз дарун мебарояд (хусусан дар кортикали нозук). Three.js MeshPhysicalMaterial SSS пурра дастгирӣ намекунад.

### 4.4 Тафовути ранг байни устухонҳо нест
Ҳамаи устухонҳо як ранги `0xE8DEC7` доранд. Дар واقеъ:
- Cortical bone = равшантар, сахттар
- Cancellous bone (epiphysis-ҳо) = тираттар, пуркунанда
- Cartilage = мавзеъҳои сабзранг

### 4.5 Маҳаллаи анатомикии ягон маълумот нест
Вақте устухонро интихоб мекунед: name, latinName, description, fn — ин ҳамааш аст.  
Барои сатҳи касбӣ зарур аст:
- Articulations (бо кадом устухонҳо пайваст аст)
- Muscular attachments (origin / insertion)
- Clinical significance (fracture patterns, pathologies)
- Ossification timeline (кай ташкил мешавад)
- Blood supply

---

## 5. ЧИ БОЯД ИСЛОҲ ШАВАД

### Критикӣ (пеш аз намоиш):

1. **`setQuizLevel` ба `window` дода шавад** — quiz-и пурра кор намекунад
2. **`window.camera` ивазшавад** — `import { camera } from './scene.js'` бевосита истифода шавад
3. **Quiz crash protection** — `state.boneMeshes[quizTarget]` мавҷудияташ тафтиш шавад
4. **Вкладкаҳои Hand / Foot** ба sidebar-и чап илова шаванд

### Муҳим (дар релиз аввал):

5. **mapBoneName() беҳтар шавад** — ID-ҳои ANATOMY_DB мустақиман ба `mesh.name` дар GLB навишта шаванд (segment_skeleton.js ислоҳ шавад)
6. **Loading progress bar** — progress callback дар GLTFLoader гузошта шавад
7. **Bone list selected state** — `selectBone()` list item-ро highlighted кунад
8. **auto-rotate** `scene.rotation.y` → `modelGroup.rotation.y` шавад
9. **Tooltip overflow** — viewport boundaries тафтиш шавад

### Мустаҳсан (барои UX):

10. **Режимҳо дар мобайл** — bottom navigation bar ё hamburger menu барои режимҳо
11. **Systems mode** — ҳадди аққал 3 sistema нишон дода шавад (axial vs appendicular)
12. **Visible count** — ҳангоми filter ва teacher mode навсозӣ шавад
13. **Circular import** — `controls` аз `state.js` ё `scene.js` рад шавад

---

## 6. ROADMAP

### P0 — Bug Fixes (ҳафтаи 1)

| # | Масъала | Файл | Вақт |
|---|---------|------|------|
| 1 | `setQuizLevel` ба window дода шавад (re-export аз ui.js) | `ui.js`, `quiz.js` | 30 дақ |
| 2 | `window.camera` ислоҳ шавад | `ui.js:121` | 15 дақ |
| 3 | Quiz crash guard барои unmapped bones | `quiz.js:45` | 20 дақ |
| 4 | Hand / Foot вкладкаҳо | `index.html` | 15 дақ |
| 5 | Loading progress bar animation | `builder.js` | 20 дақ |
| 6 | auto-rotate: scene → modelGroup | `main.js`, `builder.js` | 20 дақ |
| 7 | Tooltip viewport clamp | `main.js` | 20 дақ |
| 8 | Bone list selected sync | `ui.js` | 30 дақ |

**Ҳамагӣ: ~2.5 соат кор**

---

### P1 — Core Features (ҳафтаи 2–4)

#### 1.1 GLB Model — Bone Names Fix
Калидтарин масъала аст. Ду роҳ:
- **Роҳи А (беҳтар):** `segment_skeleton.js`-ро ислоҳ кун — ба ҷои heuristic names, аз ANATOMY_DB ID-ро мустақиман ба `mesh.name` бинавис (ҳамоҳангии мавқеъ + андоза)
- **Роҳи Б:** GLB-ро дар Blender кушо ва ҳар meshро ба ID мувофиқ номгузорӣ кун

#### 1.2 Explode Mode Fix
Explode direction бояд аз маркази бадан (0,0,0) бошад, на аз local mesh position:
```js
const bodyCenter = new THREE.Vector3(0, 0.9, 0); // тахминан
const dir = base.clone().sub(bodyCenter).normalize();
targets[id] = base.clone().add(dir.multiplyScalar(mag));
```

#### 1.3 Systems Mode
Ҳадди аққал 3 намоишгар:
- **Axial skeleton** (skull + vertebral + thorax) — рангубандии мушаххас
- **Appendicular skeleton** (upper + lower limbs) — рангубандии дигар
- **Age/ossification** — gradient аз ранги хуни сурх (кортикал) то зард (сепедаҳои epiphyseal)

#### 1.4 Bone Detail Panel — Маълумоти иловагӣ
Ба ҳар устухон илова шавад:
```js
{
  id: 'femur_r',
  // ...мавҷуд...
  articulations: ['hip joint (acetabulum)', 'knee joint (tibia, patella)'],
  muscleAttachments: ['Gluteus maximus (insertion)', 'Quadriceps femoris (origin via AIIS)', ...],
  clinicalNote: 'Femoral neck fractures common in osteoporosis; AVN risk.',
  ossification: 'Primary: 7th gestational week. Distal epiphysis: birth.'
}
```

#### 1.5 Mobile Navigation
Bottom bar барои режимҳо дар мобайл (≤768px):
```
[Explore] [Explode] [Systems] [Quiz]
```

#### 1.6 Circular Import Refactor
`controls` → `state.js`-га кӯч шавад ё `window.appControls`-и мавҷуда истифода шавад (аллакай дар main.js гузошта шудааст, аз ui.js бевосита `window.appControls` хонда шавад).

---

### P2 — Professional Anatomy Platform (моҳи 2–4)

#### 2.1 Layer System (Muscle / Nerve / Vessel)
- Layers panel: Skeleton / Muscles / Nerves / Vessels / Ligaments
- Ҳар слой — GLB иловагӣ бо opacity control
- Slider: skeleton-дан muscle гузаштан анимационӣ

#### 2.2 Cross-Section Viewer
- Clipping plane дар Three.js: `renderer.clippingPlanes = [...]`
- Drag handle барои гузаронидани sectioning plane
- Три мавзеъ: sagittal / coronal / transverse

#### 2.3 Measurement Tool
- 2 нуқтаро клик кун → масофа ба сантиметр
- Angle measurement байни 3 нуқта
- Reference scale (ruler) дар viewport

#### 2.4 Enhanced Bone Data
- 206 устухон + articulation graphs
- Clinical pathology gallery (osteoporosis, fractures, tumors)
- X-ray mode (inverted grayscale shader)
- Radiograph comparison panel

#### 2.5 Quiz Mode+
- Timer mode
- Fill-in-the-blank (навиштани ном)
- Case-based questions (pathology scenario)
- Progress tracking (localStorage)
- Leaderboard / scoreboard

#### 2.6 Annotation System
- Дар 3D-моделда нуқтаи аннотация гузоштан
- Custom labels / notes
- Export annotations as JSON / PDF

#### 2.7 Performance Optimization
- LOD (Level of Detail): дур → low-poly mesh, наздик → high-poly
- Frustum culling дуруст
- SSAO танҳо дар desktop (mobile→ fallback)
- Instancing барои phalanges / vertebrae
- GLB compressed with Draco / Meshopt

#### 2.8 URL Sharing
- `?bone=femur_r&view=front&mode=quiz` URL параметрҳо
- `window.history.pushState` ҳангоми интихоби устухон
- Bookmark/share button

#### 2.9 Accessibility
- Keyboard navigation: Tab → устухонҳо, Enter → интихоб, Escape → deselect
- ARIA labels ба ҳамаи элементҳо
- High-contrast mode

#### 2.10 Internationalization (i18n)
- Тоҷикӣ / Русӣ / Арабӣ / Испанӣ
- Номҳо аз data.js ба ҷадвали тарҷума гузашта шаванд

---

## ХУЛОСА: Фосила аз BioDigital Human

| Соҳа | OsteoVis (ҳозир) | BioDigital Human | Камбудии асосӣ |
|------|-----------------|-----------------|----------------|
| 3D Model Quality | Миёна | Тиббӣ/Ниҳоятдараҷа | Model сифат + Bone mapping |
| Interactive Features | Асосӣ | Пурра | Layers, Cross-section, Measure |
| Anatomy Data | Асосӣ | Клиникӣ | Articulations, pathology, muscles |
| Quiz | Оддӣ | Пешрафта | Timer, cases, progress |
| Mobile | Нокомил | Пурра | Mode buttons hidden |
| Performance | Миёна | Оптималшуда | LOD, compression |
| Accessibility | Нест | Дорад | Keyboard, ARIA |
| Sharing | Нест | Дорад | URL params |

**Арзёбии умумӣ:** OsteoVis як MVP (Minimum Viable Product) дорад. Меъморӣ хуб, UI зебо, аммо bugs-ҳои критикӣ кор кардани quiz-ро монеъ мешаванд. Bone mapping масъалаи асосии 3D аст. P0 bugs дар 1 рӯз ислоҳ шаванд, P1 дар 2–3 ҳафта, P2 барои сатҳи "BioDigital" 3–6 моҳ.
