// HUD: coordinate display, target indicator, timeline date
export class HUD {
  constructor() {
    this.coordEl = document.getElementById('hud-coord');
    this.targetEl = document.getElementById('hud-target');
    this.timelineDateEl = document.getElementById('tl-date');
    this.currentTime = new Date('2026-08-09').getTime();
    this.startTime = this.currentTime;
    this.endTime = new Date('2126-08-09').getTime();
    this._lastCoordUpdate = 0;
  }

  updateCoord(cameraPos, elapsed) {
    if (elapsed - this._lastCoordUpdate < 0.15) return;
    this._lastCoordUpdate = elapsed;
    const x = cameraPos.x.toFixed(2).padStart(6, ' ');
    const y = cameraPos.y.toFixed(2).padStart(6, ' ');
    const z = cameraPos.z.toFixed(2).padStart(6, ' ');
    this.coordEl.textContent = `X:${x}  Y:${y}  Z:${z}`;
  }

  setTarget(planet) {
    if (planet) {
      this.targetEl.textContent = planet.name.toUpperCase();
      this.targetEl.classList.add('visible');
    } else {
      this.targetEl.classList.remove('visible');
    }
  }

  updateTime(speed, paused, delta) {
    if (!paused) {
      // Each real second = speed * 0.5 earth days
      this.currentTime += delta * speed * 43200000; // ms per day ~ 86400000, half that
      if (this.currentTime > this.endTime) this.currentTime = this.startTime;
    }
    const d = new Date(this.currentTime);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.timelineDateEl.textContent = `${y}.${m}.${day}`;

    // Update timeline progress bar
    const total = this.endTime - this.startTime;
    const prog = ((this.currentTime - this.startTime) / total) * 100;
    const bar = document.querySelector('.tl-progress');
    if (bar) bar.style.width = `${prog}%`;
  }
}
