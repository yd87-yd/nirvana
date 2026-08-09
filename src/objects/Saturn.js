import * as THREE from 'three';
import { Planet } from './Planet.js';

export class Saturn extends Planet {
  constructor(data) {
    super(data);
    this._buildRings();
  }

  _buildRings() {
    const innerRadius = this.data.size * 1.3;
    const outerRadius = this.data.size * 2.4;
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 8);

    // Create ring texture with bands
    const tex = this._createRingTexture();

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.rings = new THREE.Mesh(geo, mat);
    this.rings.rotation.x = Math.PI / 2.3; // Tilt like real Saturn
    this.planetGroup.add(this.rings);
  }

  _createRingTexture() {
    const w = 512, h = 64;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Base gradient
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(232,213,169,0)');
    g.addColorStop(0.1, 'rgba(232,213,169,0.9)');
    g.addColorStop(0.4, 'rgba(200,180,140,0.85)');
    g.addColorStop(0.55, 'rgba(180,160,120,0.3)'); // Cassini division
    g.addColorStop(0.7, 'rgba(220,200,160,0.9)');
    g.addColorStop(0.9, 'rgba(240,220,180,0.6)');
    g.addColorStop(1, 'rgba(240,220,180,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Fine bands
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const bw = 1 + Math.random() * 3;
      const alpha = 0.2 + Math.random() * 0.4;
      ctx.fillStyle = `rgba(180,160,130,${alpha})`;
      ctx.fillRect(x, 0, bw, h);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  update(delta, elapsed) {
    super.update(delta, elapsed);
    this.rings.rotation.z += delta * 0.05;
  }
}
