import * as THREE from 'three';

// Smooth fly-to camera animation with damping
export class FlyTo {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.active = false;
    this.fromPos = new THREE.Vector3();
    this.toPos = new THREE.Vector3();
    this.fromTarget = new THREE.Vector3();
    this.toTarget = new THREE.Vector3();
    this.t = 0;
    this.duration = 2.5;
    this.onComplete = null;
  }

  flyTo(target, distance = null, onComplete = null) {
    this.fromPos.copy(this.camera.position);
    this.fromTarget.copy(this.controls.target);

    const tgtPos = target instanceof THREE.Vector3 ? target : target.getWorldPosition();

    // If distance not specified, auto based on target size
    const dist = distance ?? (target.data ? target.data.size * 8 : 15);

    // Compute offset direction from current camera angle
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    this.toPos.copy(tgtPos).add(dir.multiplyScalar(dist));
    this.toTarget.copy(tgtPos);

    this.t = 0;
    this.active = true;
    this.onComplete = onComplete;

    // Disable controls during flight
    this.controls.enabled = false;
  }

  // Bezier easing
  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  update(delta) {
    if (!this.active) return;

    this.t += delta / this.duration;
    if (this.t >= 1) {
      this.t = 1;
      this.active = false;
      this.controls.enabled = true;
      if (this.onComplete) this.onComplete();
    }

    const e = this._easeInOut(this.t);
    // Add arc (parabolic interpolation with height offset)
    const arc = Math.sin(this.t * Math.PI) * 15;
    const midUp = new THREE.Vector3(0, 1, 0);

    const newPos = new THREE.Vector3().lerpVectors(this.fromPos, this.toPos, e);
    newPos.y += arc;
    this.camera.position.copy(newPos);

    const newTarget = new THREE.Vector3().lerpVectors(this.fromTarget, this.toTarget, e);
    this.controls.target.copy(newTarget);
    this.controls.update();
  }
}
