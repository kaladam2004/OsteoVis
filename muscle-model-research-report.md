# Human Muscular System Model Research Report

Date: 2026-06-19

## Selected Asset

Best choice: BodyParts3D / Anatomography, IS-A OBJ archive, converted to `public/models/human-muscles.glb`.

Reason: It is a real adult human anatomical polygon dataset with named structures, public download, and a current archive license of CC BY 4.0. The converted OsteoVis asset contains 130 named muscle mesh elements mapped to 53 OsteoVis muscle entries.

## Final Converted Asset

- Path: `public/models/human-muscles.glb`
- Source: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- License: CC BY 4.0 per current BodyParts3D archive license page
- Required attribution: `BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International`
- Original format: OBJ ZIP (`isa_BP3D_4.0_obj_99.zip`)
- Final format: GLB
- Mesh count: 130
- Node count: 131
- Material count: 1
- Texture count: 0
- Vertices: 533,320
- Triangles: 824,668
- GLB size: 16,385,736 bytes
- GLTFLoader result: loaded successfully; 130 mapped, 0 unmapped

## Ranking

| Rank | Source | URL | License | Format | Poly count | Quality | Suitability | Advantages | Disadvantages |
|---:|---|---|---|---|---:|---:|---|---|---|
| 1 | BodyParts3D / Anatomography IS-A archive | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html | CC BY 4.0 | OBJ converted to GLB | 824,668 triangles in converted muscle subset | 8/10 | Best open option for OsteoVis | Real anatomical dataset, named structures, broad muscle coverage, no account gate, reusable with attribution | Not textured, 2013 geometry, not as polished as commercial atlases |
| 2 | BodyParts3D / Anatomography PART-OF archive | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html | CC BY 4.0 | OBJ | Partial subset only | 6/10 | Useful fallback, not enough alone | Smaller archive, real data | Muscle coverage is too sparse for full-system learning |
| 3 | Zygote Body / Zygote | https://www.zygotebody.com/ | Proprietary/commercial | Web viewer / licensed assets | Not public | 9/10 | Excellent reference, not bundleable | Very high-quality layered anatomy | No public reusable model download for app bundling |
| 4 | BioDigital Human | https://www.biodigital.com/ | Proprietary/commercial | Web/API platform | Not public | 9/10 | Excellent benchmark, not bundleable | Strong web anatomy UX and labels | Assets are not open downloadable models |
| 5 | NIH Visible Human Project | https://www.nlm.nih.gov/research/visible/visible_human.html | Dataset terms, attribution required | Image/voxel dataset | Not directly mesh | 7/10 | Research source, not direct app asset | Real cadaver source data | Requires segmentation/meshing pipeline, not a ready GLB/OBJ muscle model |
| 6 | MakeHuman | https://static.makehumancommunity.org/ | CC0 exports from official app | Mesh exports | Human surface mesh | 4/10 | Not suitable as anatomical muscle system | Open, easy export | Not a real muscular anatomy model |
| 7 | MB-Lab | https://mb-lab-community.github.io/MB-Lab.github.io/ | AGPL-derived data | Blender mesh | Human surface mesh | 4/10 | Not suitable as anatomical muscle system | Good parametric human topology | Not segmented medical muscle anatomy; AGPL data concerns |

## Integration Verification

- `npm run build`: passed.
- Three.js `GLTFLoader.parse`: passed.
- App browser smoke test: passed.
- Muscle loader console: `OsteoVis Muscles ✓ | meshes: 130 | mapped: 130 | unmapped: 0`.
- Cross-section: clipping controls enabled and applied to bones plus muscles.
- Measurement: raycasts against visible bones and visible muscle meshes.
- Annotation: raycasts against visible bones and visible muscle meshes.
- Presentation mode: opens with the muscle layer loaded.
- X-Ray mode: applies to bones and muscles.

