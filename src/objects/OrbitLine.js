import * as THREE from 'three';

// Dashed orbit ring for a planet
export class OrbitLine {
  constructor(distance, segments = 128) {
    this.distance = distance;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x2a3a5a,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.line = new THREE.LineLoop(geo, mat);
    this.line.name = 'orbit';
  }
}
