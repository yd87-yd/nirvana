// Info panel: detail view for selected planet
export class InfoPanel {
  constructor() {
    this.panel = document.getElementById('info-panel');
    this.nameCn = document.getElementById('ip-name-cn');
    this.nameEn = document.getElementById('ip-name-en');
    this.diameter = document.getElementById('ip-diameter');
    this.distance = document.getElementById('ip-distance');
    this.orbit = document.getElementById('ip-orbit');
    this.rotate = document.getElementById('ip-rotate');
    this.moons = document.getElementById('ip-moons');
    this.gravity = document.getElementById('ip-gravity');
    this.desc = document.getElementById('ip-desc');
    this.fact = document.getElementById('ip-fact');

    document.getElementById('ip-close').addEventListener('click', () => {
      this.panel.classList.remove('visible');
    });
  }

  show(target) {
    const data = target.data || target;
    this.nameCn.textContent = data.nameCn;
    this.nameEn.textContent = data.name.toUpperCase();
    this.diameter.textContent = data.diameter.toLocaleString() + ' km';
    this.distance.textContent = data.distance === 0 ? '—' : data.distance + ' AU';
    this.orbit.textContent = data.orbitPeriod || '—';
    this.rotate.textContent = data.rotatePeriod || '—';
    this.moons.textContent = data.moons ?? 0;
    this.gravity.textContent = data.gravity || '—';
    this.desc.textContent = data.description || '';
    this.fact.textContent = (data.fact ? '✨ ' : '') + (data.fact || '');
    this.panel.classList.add('visible');
  }

  hide() {
    this.panel.classList.remove('visible');
  }
}
