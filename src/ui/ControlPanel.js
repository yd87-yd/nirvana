// Control panel bindings: speed slider, view toggles, mode switches, reset
export class ControlPanel {
  constructor(loop, orbitControls, flyControls, post, options = {}) {
    this.loop = loop;
    this.orbitControls = orbitControls;
    this.flyControls = flyControls;
    this.post = post;
    this.options = options;

    this.paused = false;
    this.speed = 1.0;
    this.orbitsVisible = true;
    this.labelsVisible = true;
    this.asteroidsVisible = true;
    this.bloomEnabled = true;
    this.mode = 'orbit'; // 'orbit' | 'fly'

    this._bind();
  }

  _bind() {
    // Speed slider
    const slider = document.getElementById('speed-slider');
    const valEl = document.getElementById('speed-val');
    slider.value = 10;
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      this.speed = v / 10;
      valEl.textContent = `${this.speed.toFixed(1)}×`;
      this.loop.setSpeed(this.paused ? 0 : this.speed);
    });

    // Pause button
    const pauseBtn = document.getElementById('btn-pause');
    pauseBtn.addEventListener('click', () => {
      this.paused = !this.paused;
      this.loop.setSpeed(this.paused ? 0 : this.speed);
      pauseBtn.textContent = this.paused ? '▶' : '❚❚';
      pauseBtn.classList.toggle('active', this.paused);
      if (this.options.onPauseToggle) this.options.onPauseToggle(this.paused);
    });

    // View toggles
    this._bindToggle('btn-orbits', 'orbitsVisible', () => this.options.setOrbits?.(this.orbitsVisible));
    this._bindToggle('btn-labels', 'labelsVisible', () => this.options.setLabels?.(this.labelsVisible));
    this._bindToggle('btn-asteroids', 'asteroidsVisible', () => this.options.setAsteroids?.(this.asteroidsVisible));
    this._bindToggle('btn-bloom', 'bloomEnabled', () => {
      this.post.setEnabled(this.bloomEnabled);
      this.options.setBloom?.(this.bloomEnabled);
    });

    // Mode buttons
    const btnOrbit = document.getElementById('btn-orbit');
    const btnFly = document.getElementById('btn-fly');
    btnOrbit.addEventListener('click', () => this._setMode('orbit', btnOrbit, btnFly));
    btnFly.addEventListener('click', () => this._setMode('fly', btnOrbit, btnFly));

    // Reset
    document.getElementById('btn-reset').addEventListener('click', () => {
      this.options.onReset?.();
    });
  }

  _bindToggle(id, prop, onChange) {
    const btn = document.getElementById(id);
    btn.addEventListener('click', () => {
      this[prop] = !this[prop];
      btn.classList.toggle('active', this[prop]);
      const dot = btn.querySelector('.toggle-dot');
      if (dot) dot.classList.toggle('on', this[prop]);
      onChange();
    });
  }

  _setMode(mode, btnOrbit, btnFly) {
    this.mode = mode;
    const orbitEl = document.getElementById('btn-orbit');
    const flyEl = document.getElementById('btn-fly');
    orbitEl.classList.toggle('active', mode === 'orbit');
    flyEl.classList.toggle('active', mode === 'fly');

    const flyIndicator = document.getElementById('fly-indicator');
    if (mode === 'fly') {
      this.orbitControls.enabled = false;
      this.flyControls.setEnabled(true);
      flyIndicator.classList.add('active');
    } else {
      this.orbitControls.enabled = true;
      this.flyControls.setEnabled(false);
      flyIndicator.classList.remove('active');
    }
  }
}
