import * as THREE from 'three';

// Raycaster for hover highlight + click select on planets
export class Raycaster {
  constructor(camera, domElement, planets, onSelect, onHover) {
    this.camera = camera;
    this.domElement = domElement;
    this.planets = planets;
    this.onSelect = onSelect;
    this.onHover = onHover;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-10, -10);

    this.hovered = null;
    this.selected = null;
    this.highlightMesh = null;

    this._setupHighlight();
    this._bind();
  }

  _setupHighlight() {
    // Glow ring for hover/select
    const geo = new THREE.RingGeometry(1.3, 1.5, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.highlightMesh = new THREE.Mesh(geo, mat);
    this.highlightMesh.rotation.x = -Math.PI / 2;
    this.highlightMesh.visible = false;
  }

  _bind() {
    this.domElement.addEventListener('pointermove', (e) => this._onMove(e));
    this.domElement.addEventListener('pointerdown', (e) => this._onClick(e));
    this.domElement.addEventListener('pointerleave', () => {
      this.mouse.set(-10, -10);
      this._updateHover();
    });
  }

  _onMove(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _onClick(e) {
    this._updateHover();
    if (this.hovered && this.onSelect) {
      this.selected = this.hovered;
      this.onSelect(this.hovered);
    }
  }

  _updateHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.planets.map(p => p.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      const planet = this.planets.find(p => p.mesh === hitMesh);
      if (planet !== this.hovered) {
        this.hovered = planet;
        this.domElement.style.cursor = 'pointer';
        if (this.onHover) this.onHover(planet);
      }
    } else {
      if (this.hovered) {
        this.hovered = null;
        this.domElement.style.cursor = 'default';
        if (this.onHover) this.onHover(null);
      }
    }
  }

  update(elapsed) {
    this._updateHover();

    if (this.highlightMesh) {
      const target = this.selected || this.hovered;
      if (target) {
        const pos = target.getWorldPosition();
        this.highlightMesh.position.set(pos.x, pos.y - target.data.size - 0.5, pos.z);
        const scale = target.data.size * 2.5;
        this.highlightMesh.scale.setScalar(scale);
        this.highlightMesh.rotation.z = elapsed * 1.5;
        this.highlightMesh.material.color.setHex(this.selected ? 0xF472B6 : 0xFDE047);
        this.highlightMesh.visible = true;
      } else {
        this.highlightMesh.visible = false;
      }
    }
  }
}
