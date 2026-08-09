import * as THREE from 'three';
import { Planet } from './Planet.js';

export class Earth extends Planet {
  constructor(data) {
    super(data);
    this._buildEarthSpecific();
  }

  _createMaterial(data) {
    // Earth-specific shader material
    const geo = new THREE.SphereGeometry(data.size, 64, 64);
    const dayTex = this._createEarthTexture();
    const nightTex = this._createNightTexture();

    this.dayTexture = dayTex;
    this.nightTexture = nightTex;

    return new THREE.ShaderMaterial({
      uniforms: {
        uDayTex: { value: dayTex },
        uNightTex: { value: nightTex },
        uSunDir: { value: new THREE.Vector3(1, 0, 0).normalize() },
        uAtmosphereColor: { value: new THREE.Color(0x4a9eff) },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D uDayTex;
        uniform sampler2D uNightTex;
        uniform vec3 uSunDir;
        uniform vec3 uAtmosphereColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 L = normalize(uSunDir);
          float lambert = dot(N, L);
          float dayAmount = smoothstep(-0.15, 0.25, lambert);

          vec4 dayColor = texture2D(uDayTex, vUv);
          vec4 nightColor = texture2D(uNightTex, vUv);
          vec3 color = mix(nightColor.rgb, dayColor.rgb, dayAmount);

          // Subtle atmosphere rim
          vec3 V = normalize(cameraPosition - vWorldPos);
          float rim = 1.0 - max(0.0, dot(N, V));
          rim = pow(rim, 3.0) * 0.4;
          color += uAtmosphereColor * rim * dayAmount;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  _createEarthTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, size);
    ocean.addColorStop(0, '#1a3a5c');
    ocean.addColorStop(0.5, '#2d5a87');
    ocean.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, size * 2, size);

    // Add continents (simplified blobs)
    ctx.fillStyle = '#2d5c3a';
    const continents = [
      { x: 120, y: 30, w: 60, h: 40 },    // N. America
      { x: 150, y: 55, w: 20, h: 35 },    // S. America
      { x: 220, y: 25, w: 50, h: 35 },    // Europe/Africa
      { x: 290, y: 40, w: 70, h: 35 },    // Asia
      { x: 340, y: 70, w: 25, h: 15 },    // Australia
      { x: 50, y: 20, w: 100, h: 15 },    // Greenland strip
    ];
    for (const c of continents) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ice caps
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(0, 0, size * 2, 8);
    ctx.fillRect(0, size - 8, size * 2, 8);

    // Clouds overlay
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size * 2;
      const y = 10 + Math.random() * (size - 20);
      const r = 3 + Math.random() * 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _createNightTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Dark ocean
    ctx.fillStyle = '#050a15';
    ctx.fillRect(0, 0, size * 2, size);

    // City lights (clustered where continents are)
    const lights = [
      { x: 120, y: 30, count: 40 },
      { x: 150, y: 55, count: 10 },
      { x: 220, y: 25, count: 35 },
      { x: 290, y: 40, count: 50 },
      { x: 340, y: 70, count: 8 },
    ];
    ctx.fillStyle = '#ffdd88';
    for (const region of lights) {
      for (let i = 0; i < region.count; i++) {
        const offsetX = (Math.random() - 0.5) * region.w;
        const offsetY = (Math.random() - 0.5) * region.h;
        ctx.fillRect(region.x + offsetX, region.y + offsetY, 1, 1);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _buildEarthSpecific() {
    // Atmosphere glow sprite
    const glowTex = this._createAtmosphereTexture();
    const atmoMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.atmosphere = new THREE.Sprite(atmoMat);
    this.atmosphere.scale.setScalar(this.data.size * 1.55);
    this.planetGroup.add(this.atmosphere);

    // Moon
    this.moonOrbit = new THREE.Group();
    this.planetGroup.add(this.moonOrbit);

    const moonGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 64; moonCanvas.height = 32;
    const mctx = moonCanvas.getContext('2d');
    mctx.fillStyle = '#a0a0a0';
    mctx.fillRect(0, 0, 64, 32);
    for (let i = 0; i < 20; i++) {
      mctx.beginPath();
      mctx.arc(Math.random() * 64, Math.random() * 32, 2 + Math.random() * 4, 0, Math.PI * 2);
      mctx.fillStyle = '#808080';
      mctx.fill();
    }
    const moonTex = new THREE.CanvasTexture(moonCanvas);
    this.moon = new THREE.Mesh(moonGeo, new THREE.MeshStandardMaterial({ map: moonTex, roughness: 1 }));
    this.moon.position.set(3, 0.3, 0);
    this.moonOrbit.add(this.moon);
    this.moonOrbitRadius = 3;
    this.moonAngle = Math.random() * Math.PI * 2;
  }

  _createAtmosphereTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.55);
    g.addColorStop(0, 'rgba(74,158,255,0)');
    g.addColorStop(0.6, 'rgba(74,158,255,0.25)');
    g.addColorStop(1, 'rgba(74,158,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  setSunDirection(dir) {
    this.mesh.material.uniforms.uSunDir.value.copy(dir).normalize();
  }

  update(delta, elapsed) {
    super.update(delta, elapsed);
    // Moon orbit
    this.moonAngle += delta * 2.0;
    this.moon.position.set(
      Math.cos(this.moonAngle) * this.moonOrbitRadius,
      0.3,
      Math.sin(this.moonAngle) * this.moonOrbitRadius
    );
    this.moon.rotation.y += delta * 0.5;
  }
}
