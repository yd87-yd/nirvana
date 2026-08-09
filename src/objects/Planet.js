import * as THREE from 'three';
import { ORBIT_SCALE } from '../data/planets.js';

export class Planet {
  constructor(data) {
    this.data = data;
    this.name = data.name;
    this.nameCn = data.nameCn;
    this.distance = data.distance * ORBIT_SCALE;
    this.orbitSpeed = data.orbitSpeed ?? 0.1;
    this.rotateSpeed = data.rotateSpeed ?? 1.0;

    // Orbit group: rotates around sun
    this.orbitGroup = new THREE.Group();
    // Planet group: positions planet at distance + handles self-rotation
    this.planetGroup = new THREE.Group();
    this.orbitGroup.add(this.planetGroup);

    // Planet mesh
    const geo = new THREE.SphereGeometry(data.size, 48, 48);
    const mat = this._createMaterial(data);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = data.name;
    this.planetGroup.add(this.mesh);

    // Position at distance
    this.planetGroup.position.x = this.distance;

    // Initial random angle
    this.angle = Math.random() * Math.PI * 2;
    this.orbitGroup.rotation.y = this.angle;

    this.group = this.orbitGroup;
  }

  _createMaterial(data) {
    // Procedural canvas texture fallback
    const tex = this._createProceduralTexture(data);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0.05,
      color: 0xffffff,
    });
  }

  _createProceduralTexture(data) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const base = new THREE.Color(data.color);
    const baseRgb = { r: Math.round(base.r * 255), g: Math.round(base.g * 255), b: Math.round(base.b * 255) };

    // Gradient base
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, `rgb(${baseRgb.r + 30},${baseRgb.g + 30},${baseRgb.b + 30})`);
    g.addColorStop(0.5, `rgb(${baseRgb.r},${baseRgb.g},${baseRgb.b})`);
    g.addColorStop(1, `rgb(${Math.max(0, baseRgb.r - 40)},${Math.max(0, baseRgb.g - 40)},${Math.max(0, baseRgb.b - 40)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size * 2, size);

    // Add horizontal banding (gas giants) or splotches (rocky)
    if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(data.name)) {
      // Bands
      for (let y = 0; y < size; y += 4 + Math.random() * 4) {
        const shade = (Math.random() - 0.5) * 40;
        ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, baseRgb.r + shade))},${Math.max(0, Math.min(255, baseRgb.g + shade))},${Math.max(0, Math.min(255, baseRgb.b + shade))},0.4)`;
        ctx.fillRect(0, y, size * 2, 2 + Math.random() * 3);
      }
    } else {
      // Splotches
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size * 2;
        const y = Math.random() * size;
        const r = 2 + Math.random() * 8;
        const shade = (Math.random() - 0.5) * 60;
        ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, baseRgb.r + shade))},${Math.max(0, Math.min(255, baseRgb.g + shade))},${Math.max(0, Math.min(255, baseRgb.b + shade))},${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  update(delta, elapsed) {
    // Orbit
    this.angle += delta * this.orbitSpeed * 0.3;
    this.orbitGroup.rotation.y = this.angle;
    // Self rotation
    this.mesh.rotation.y += delta * this.rotateSpeed * 0.5;
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);
    return pos;
  }
}
