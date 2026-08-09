import * as THREE from 'three';
import { ORBIT_SCALE } from '../data/planets.js';

// Asteroid belt between Mars and Jupiter (~2.2-3.2 AU)
export class AsteroidBelt {
  constructor(innerAU = 2.2, outerAU = 3.2, count = 30000) {
    this.innerRadius = innerAU * ORBIT_SCALE;
    this.outerRadius = outerAU * ORBIT_SCALE;
    this.count = count;
    this.group = new THREE.Group();
    this._build();
  }

  _build() {
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const randoms = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const r = this.innerRadius + Math.random() * (this.outerRadius - this.innerRadius);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.8;

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      const shade = 0.5 + Math.random() * 0.4;
      colors[i * 3] = shade * 0.7;
      colors[i * 3 + 1] = shade * 0.6;
      colors[i * 3 + 2] = shade * 0.5;

      sizes[i] = 0.5 + Math.random() * 1.5;
      randoms[i] = Math.random() * 1000;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */`
        attribute float size;
        attribute float aRandom;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          // Slow orbital drift
          float angle = uTime * 0.02 * (0.5 + aRandom * 0.001);
          float cosA = cos(angle);
          float sinA = sin(angle);
          pos.xz = mat2(cosA, -sinA, sinA, cosA) * pos.xz;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (120.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.group.add(this.points);
  }

  update(delta, elapsed) {
    this.points.material.uniforms.uTime.value = elapsed;
  }
}
