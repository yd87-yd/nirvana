import * as THREE from 'three';

// Unique feature: animated CatmullRom path connecting all planets as "waypoints"
export class WaypointPath {
  constructor(planets) {
    this.planets = planets;
    this.group = new THREE.Group();
    this.progress = 0; // 0..1
    this._build();
  }

  _build() {
    // Build a smooth curve through planet positions (use current positions as control points)
    this._rebuildCurve();

    // Full path line (ghost)
    const fullPoints = this.curve.getPoints(500);
    const fullGeo = new THREE.BufferGeometry().setFromPoints(fullPoints);
    const fullMat = new THREE.LineBasicMaterial({
      color: 0x6EE7F9,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    this.fullLine = new THREE.Line(fullGeo, fullMat);
    this.group.add(this.fullLine);

    // Animated gradient stroke (visible portion)
    const strokeGeo = new THREE.BufferGeometry();
    const maxStroke = 60; // max vertices for stroke
    const positions = new Float32Array(maxStroke * 3);
    const colors = new Float32Array(maxStroke * 3);
    strokeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    strokeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    strokeGeo.setDrawRange(0, 0);

    const strokeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      linewidth: 2,
    });
    this.strokeLine = new THREE.Line(strokeGeo, strokeMat);
    this.group.add(this.strokeLine);

    // Waypoint markers at each planet
    this.markers = [];
    for (let i = 0; i < this.planets.length; i++) {
      const mGeo = new THREE.RingGeometry(0.8, 1.1, 24);
      const color = i % 2 === 0 ? 0x6EE7F9 : 0xF472B6;
      const mMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.8,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const ring = new THREE.Mesh(mGeo, mMat);
      ring.rotation.x = -Math.PI / 2;
      ring.userData.planetIndex = i;
      this.group.add(ring);
      this.markers.push(ring);
    }
  }

  _rebuildCurve() {
    const points = this.planets.map(p => {
      const wp = p.getWorldPosition();
      return new THREE.Vector3(wp.x, wp.y + 0.5, wp.z);
    });
    // Close the loop: add first point at end for smooth wrap
    points.push(points[0].clone());
    this.curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.1);
  }

  _updateStroke() {
    const totalLen = 0.4; // visible stroke length along curve (0..1)
    const segments = 120;
    const start = this.progress;
    const geo = this.strokeLine.geometry;
    const posAttr = geo.attributes.position;
    const colAttr = geo.attributes.color;

    for (let i = 0; i < segments; i++) {
      const t = (start + (i / segments) * totalLen) % 1;
      const pt = this.curve.getPointAt(t);
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);

      // Gradient cyan -> pink
      const grad = i / segments;
      colAttr.setXYZ(
        i,
        0.43 + grad * 0.44,  // R
        0.91 - grad * 0.15,  // G
        0.98 - grad * 0.34,  // B
      );
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geo.setDrawRange(0, segments);
    geo.computeBoundingSphere();
  }

  update(delta, elapsed) {
    // Rebuild curve to track moving planets
    this._rebuildCurve();
    const fullPoints = this.curve.getPoints(500);
    this.fullLine.geometry.setFromPoints(fullPoints);

    // Animate progress
    this.progress = (this.progress + delta * 0.02) % 1;
    this._updateStroke();

    // Update markers positions
    for (let i = 0; i < this.planets.length; i++) {
      const wp = this.planets[i].getWorldPosition();
      this.markers[i].position.set(wp.x, 0.2, wp.z);
      // Pulse scale
      const s = 1 + Math.sin(elapsed * 2 + i) * 0.15;
      this.markers[i].scale.setScalar(s);
    }
  }

  setVisible(v) {
    this.group.visible = v;
  }
}
