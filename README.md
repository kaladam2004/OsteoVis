# OsteoVis 💀

OsteoVis is a premium, interactive, and highly realistic 3D medical anatomy platform built with Three.js and Vite. It allows medical students, educators, and anatomy enthusiasts to explore a highly accurate human skeleton in real-time, right in the browser.

![OsteoVis Preview](https://via.placeholder.com/800x450.png?text=OsteoVis+3D+Anatomy) *(Add a real screenshot here)*

## ✨ Features

- **Medical-Grade 3D Realism**: High-fidelity GLTF/GLB skeleton rendering with SSAO, soft shadows, and realistic ivory materials.
- **Interactive Anatomy Database**: Search, filter, and isolate all 206 bones of the adult human body.
- **Exploded View**: Instantly separate bones to study individual joints and structures.
- **Teacher Mode**: Isolate a specific bone while keeping the rest of the skeleton visible as a faint ghost.
- **Quiz Mode**: Test your anatomical knowledge by finding specific bones on the 3D model.
- **Dynamic Camera Controls**: Smooth damping, zoom limits, and one-click predefined views (Front, Side, Top, Back).
- **Responsive UI**: Sleek, glassmorphism UI that works flawlessly on desktop and mobile.

## 🛠 Tech Stack

- **HTML5 & CSS3**: Vanilla, modular styles for a lightweight footprint.
- **JavaScript (ES Modules)**: Clean and structured architecture.
- **Three.js**: Core 3D engine for rendering the skeleton and lighting.
- **Tween.js**: Smooth mathematical animations for camera and exploded views.
- **Vite**: Ultra-fast frontend build tool and local development server.

## 📁 Folder Structure

```text
OsteoVis/
├── index.html           # Main HTML structure
├── package.json         # Project metadata and scripts
├── public/              
│   └── models/          # ⚠️ PLACE YOUR GLB MODEL HERE
├── src/
│   ├── css/
│   │   └── style.css    # Global UI styles
│   ├── js/
│   │   ├── main.js      # Entry point
│   │   ├── scene.js     # Three.js setup, lights, SSAO, Composer
│   │   ├── builder.js   # GLTFLoader, Auto-mapping, and Materials
│   │   ├── controls.js  # Custom CameraController logic
│   │   ├── ui.js        # User interface logic
│   │   ├── quiz.js      # Quiz system logic
│   │   ├── data.js      # Comprehensive ANATOMY_DB
│   │   └── state.js     # Global application state
```

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/yourusername/osteovis.git
cd osteovis
npm install
```

### 2. Adding the 3D Model
For licensing reasons, a premium medical 3D skeleton model is **not** included in the repository. 
You must provide your own medically accurate `.glb` or `.gltf` model.
1. Download or purchase a medically accurate human skeleton model.
2. Rename the file to `human-skeleton.glb`.
3. Place it inside the `public/models/` directory.

*Note: If the model is missing, the app will show a fallback warning message.*

### 3. Run Locally
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
To bundle the app for production (Vercel, Netlify, GitHub Pages):
```bash
npm run build
```
This will generate optimized files in the `dist/` directory.

## 📝 License

This project is licensed under the MIT License. You are free to modify and use it for educational purposes. 

*(Note: Ensure you comply with the licensing terms of the 3D `.glb` asset you choose to use with this platform).*
