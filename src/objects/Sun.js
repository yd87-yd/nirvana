import * as THREE from 'three';
import { SUN } from '../data/planets.js';

export class Sun {
  constructor() {
    this.group = new THREE.Group();
    this.data = SUN;
    this._build();
  }

  _build() {
    // Core sphere with emissive material
    const geo = new THREE.SphereGeometry(this.data.size, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xfff1a8,
      fog: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Point light
    this.light = new THREE.PointLight(0xfff5d0, 2.5, 600, 0.6);
    this.group.add(this.light);

    // Glow sprite (additive)
    const glowTex = this._createGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffd700,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.glow = new THREE.Sprite(glowMat);
    this.glow.scale.setScalar(this.data.size * 8);
    this.group.add(this.glow);

    // Corona halo (larger, softer)
    const coronaMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xff8844,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.corona = new THREE.Sprite(coronaMat);
    this.corona.scale.setScalar(this.data.size * 16);
    this.group.add(this.corona);

    this.name = 'Sun';
    this.nameCn = '太阳';
  }

  _createGlowTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.15, 'rgba(255,230,150,0.9)');
    g.addColorStop(0.4, 'rgba(255,180,80,0.4)');
    g.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  update(delta, elapsed) {
    this.mesh.rotation.y += delta * 0.1;
    // Pulse corona size
    const pulse = 1 + Math.sin(elapsed * 0.8) * 0.05;
    this.corona.scale.setScalar(this.data.size * 16 * pulse);
  }
}
