import * as THREE from 'three';

// Procedural starfield using Points + custom shader for subtle twinkling
export class Starfield {
  constructor(count = 20000, radius = 2000) {
    this.count = count;
    this.radius = radius;
    this.group = new THREE.Group();
    this._build();
  }

  _build() {
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    const c1 = new THREE.Color(0xaaccff);
    const c2 = new THREE.Color(0xffffff);
    const c3 = new THREE.Color(0xffddaa);

    for (let i = 0; i < this.count; i++) {
      // Uniform points on sphere surface with small inner shell
      const r = this.radius * (0.7 + Math.random() * 0.3);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      const color = t < 0.6 ? c2 : t < 0.85 ? c1 : c3;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.3 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */`
        attribute float size;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (200.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
          vTwinkle = sin(uTime * 2.0 + position.x * 0.1 + position.y * 0.15) * 0.5 + 0.5;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          alpha *= 0.6 + vTwinkle * 0.4;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.group.add(this.points);
  }

  update(elapsed) {
    this.points.material.uniforms.uTime.value = elapsed;
  }
}
