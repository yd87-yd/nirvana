import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class PostProcessing {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this._setup();
  }

  _setup() {
    const { scene, camera, renderer } = this.scene;
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight),
      0.6,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(this.bloom);
  }

  onResize() {
    const { renderer } = this.scene;
    this.composer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
  }

  render() {
    if (this.enabled) {
      this.composer.render();
    } else {
      const { scene, camera, renderer } = this.scene;
      renderer.render(scene, camera);
    }
  }

  setEnabled(v) {
    this.enabled = v;
  }

  dispose() {
    this.composer.dispose();
  }
}
