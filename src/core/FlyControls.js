import * as THREE from 'three';

// Custom Fly controls: WASD movement + QE up/down + Shift boost + mouse look
// Works alongside OrbitControls (disabled during fly mode)
export class FlyControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;

    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.euler.setFromQuaternion(camera.quaternion);
    this.pointerLocked = false;

    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    this.domElement.addEventListener('click', () => {
      if (this.enabled && !this.pointerLocked) {
        this.domElement.requestPointerLock?.();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.domElement;
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled || !this.pointerLocked) return;
      const sensitivity = 0.002;
      this.euler.y -= e.movementX * sensitivity;
      this.euler.x -= e.movementY * sensitivity;
      const max = Math.PI / 2 - 0.01;
      this.euler.x = Math.max(-max, Math.min(max, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    });
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v && this.pointerLocked) document.exitPointerLock?.();
  }

  update(delta) {
    if (!this.enabled) return;

    const speed = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? 60 : 20;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    const move = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) move.add(forward);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) move.sub(forward);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.add(right);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) move.sub(right);
    if (this.keys['KeyE']) move.add(up);
    if (this.keys['KeyQ']) move.sub(up);

    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed * delta);
    this.camera.position.add(move);
  }
}
