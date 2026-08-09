import * as THREE from 'three';
import { Scene } from './core/Scene.js';
import { AnimationLoop } from './core/AnimationLoop.js';
import { PostProcessing } from './core/PostProcessing.js';
import { FlyControls } from './core/FlyControls.js';

import { SUN, PLANETS, ORBIT_SCALE } from './data/planets.js';
import { Starfield } from './objects/Starfield.js';
import { Sun } from './objects/Sun.js';
import { Planet } from './objects/Planet.js';
import { Earth } from './objects/Earth.js';
import { Saturn } from './objects/Saturn.js';
import { OrbitLine } from './objects/OrbitLine.js';
import { AsteroidBelt } from './objects/AsteroidBelt.js';
import { KuiperBelt } from './objects/KuiperBelt.js';
import { WaypointPath } from './objects/WaypointPath.js';

import { FlyTo } from './interaction/FlyTo.js';
import { Raycaster } from './interaction/Raycaster.js';
import { Search } from './interaction/Search.js';

import { HUD } from './ui/HUD.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { InfoPanel } from './ui/InfoPanel.js';

// ========================================================
// STARPATH — Solar System Explorer
// ========================================================

const container = document.getElementById('app');

// 1. Scene & rendering
const scene = new Scene(container);
const post = new PostProcessing(scene);
const loop = new AnimationLoop(scene);

// 2. Controls
const flyControls = new FlyControls(scene.camera, scene.renderer.domElement);
const flyTo = new FlyTo(scene.camera, scene.controls);

// 3. Build celestial bodies
const starfield = new Starfield(20000, 1800);
scene.scene.add(starfield.group);

const sun = new Sun();
scene.scene.add(sun.group);

// Orbit lines
const orbitLines = [];
PLANETS.forEach(p => {
  const line = new OrbitLine(p.distance * ORBIT_SCALE);
  scene.scene.add(line.line);
  orbitLines.push(line);
});

// Planets
const planets = PLANETS.map(data => {
  let p;
  if (data.name === 'Earth') p = new Earth(data);
  else if (data.name === 'Saturn') p = new Saturn(data);
  else p = new Planet(data);
  scene.scene.add(p.group);
  return p;
});

// Asteroid belt (between Mars ~1.52AU and Jupiter ~5.2AU)
const asteroidBelt = new AsteroidBelt(2.2, 3.2, 30000);
scene.scene.add(asteroidBelt.group);

// Kuiper belt (outer)
const kuiperBelt = new KuiperBelt(35, 55, 12000);
scene.scene.add(kuiperBelt.group);

// Waypoint path (connects planets) — unique Starpath feature
const waypointPath = new WaypointPath(planets);
scene.scene.add(waypointPath.group);

// 4. Interaction
const raycaster = new Raycaster(
  scene.camera,
  scene.renderer.domElement,
  planets,
  (target) => {
    // click select
    flyTo.flyTo(target, null, () => {
      infoPanel.show(target);
      hud.setTarget(target);
    });
  },
  (hovered) => {
    // hover (currently just highlights via raycaster)
  }
);
scene.scene.add(raycaster.highlightMesh);

function handleSearchSelect(target) {
  // Sun or planet
  const distance = target === sun ? 18 : null;
  flyTo.flyTo(target, distance, () => {
    infoPanel.show(target);
    hud.setTarget(target);
  });
}
const search = new Search(planets, sun, handleSearchSelect);

// 5. UI
const hud = new HUD();
const infoPanel = new InfoPanel();
new ControlPanel(loop, scene.controls, flyControls, post, {
  setOrbits: (v) => orbitLines.forEach(l => l.line.visible = v),
  setLabels: (v) => waypointPath.setVisible(v),
  setAsteroids: (v) => { asteroidBelt.group.visible = v; },
  setBloom: (v) => { /* already handled internally */ },
  onReset: () => {
    flyTo.flyTo(new THREE.Vector3(0, 80, 180), null, () => {
      scene.controls.target.set(0, 0, 0);
      scene.controls.enabled = true;
      infoPanel.hide();
      hud.setTarget(null);
    });
  },
  onPauseToggle: (paused) => { /* HUD timeline handles via loop */ },
});

// 6. Main animation loop
let lastTarget = null;
loop.onFrame = (delta, elapsed) => {
  // Update sun direction for Earth shader (sun is at origin, earth orbits)
  const sunWorld = sun.group.position; // origin
  planets.forEach(p => {
    if (p.setSunDirection) {
      const earthPos = p.getWorldPosition();
      const dir = new THREE.Vector3().subVectors(sunWorld, earthPos);
      p.setSunDirection(dir);
    }
  });

  // Update all objects
  starfield.update(elapsed);
  sun.update(delta, elapsed);
  planets.forEach(p => p.update(delta, elapsed));
  asteroidBelt.update(delta, elapsed);
  kuiperBelt.update(delta, elapsed);
  waypointPath.update(delta, elapsed);
  raycaster.update(elapsed);
  flyTo.update(delta);
  flyControls.update(delta);

  // HUD updates
  hud.updateCoord(scene.camera.position, elapsed);
  hud.updateTime(loop.speed, loop.paused, delta);

  // Render with post-processing
  post.render();
};

// Resize
window.addEventListener('resize', () => {
  scene.onResize();
  post.onResize();
});

// Keyboard: Esc exits fly mode, R resets
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && flyControls.enabled) {
    document.getElementById('btn-orbit').click();
  }
});

// 7. Initial auto-tour: gently fly to Earth after a short delay
setTimeout(() => {
  const earth = planets.find(p => p.name === 'Earth');
  flyTo.flyTo(earth, 18, () => {
    infoPanel.show(earth);
    hud.setTarget(earth);
  });
}, 1500);

// 8. Start!
loop.start();

// Hide loading screen
setTimeout(() => {
  const loading = document.getElementById('loading');
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 900);
}, 1800);

// Log
console.log('%c✨ Starpath Solar System initialized', 'color:#6EE7F9;font-size:14px;font-weight:bold;');
console.log('%cPlanets loaded: ' + planets.length + ' | Stars: 20000 | Asteroids: 30000', 'color:#94A3B8;font-size:11px;');
console.log('%cClick planets or search. WASD for fly mode. Shift to boost.', 'color:#64748b;font-size:11px;');
