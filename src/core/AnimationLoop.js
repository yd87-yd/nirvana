import * as THREE from 'three';

export class AnimationLoop {
  constructor(scene) {
    this.scene = scene;
    this.clock = new THREE.Clock();
    this.speed = 1.0;
    this.paused = false;
    this.onFrame = null; // callback receiving (delta, elapsed)
    this._bound = () => this._tick();
  }

  start() {
    this._rafId = requestAnimationFrame(this._bound);
  }

  stop() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _tick() {
    this._rafId = requestAnimationFrame(this._bound);
    const rawDelta = this.clock.getDelta();
    const delta = this.paused ? 0 : rawDelta * this.speed;
    const elapsed = this.clock.getElapsedTime();

    if (this.onFrame) this.onFrame(delta, elapsed);

    this.scene.controls.update();
    this.scene.renderer.render(this.scene.scene, this.scene.camera);
  }

  setSpeed(s) { this.speed = s; }
  togglePause() { this.paused = !this.paused; return this.paused; }
}
