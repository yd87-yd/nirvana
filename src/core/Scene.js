import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene {
  constructor(container) {
    this.container = container;
    this._setup();
  }

  _setup() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = new THREE.FogExp2(0x050510, 0.0015);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 5000);
    this.camera.position.set(0, 80, 180);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Ambient & hemisphere for subtle fill
    const hemi = new THREE.HemisphereLight(0x404060, 0x0a0a20, 0.35);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.08);
    this.scene.add(ambient);

    // Grid helper (subtle)
    const grid = new THREE.GridHelper(600, 60, 0x1a1a3a, 0x0f0f25);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    grid.position.y = -0.1;
    this.scene.add(grid);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 600;
    this.controls.zoomSpeed = 0.8;
    this.controls.rotateSpeed = 0.6;

    // Resize
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    this.renderer.dispose();
    this.controls.dispose();
  }
}
