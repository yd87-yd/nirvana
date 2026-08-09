// Search UI: input field + results dropdown -> triggers fly-to on select
export class Search {
  constructor(planets, sun, onSelect) {
    this.planets = planets;
    this.sun = sun;
    this.onSelect = onSelect;

    this.input = document.getElementById('search-input');
    this.results = document.getElementById('search-results');
    this._bind();
  }

  _bind() {
    this.input.addEventListener('input', () => this._onInput());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const visible = this.results.querySelectorAll('.result-item');
        if (visible.length > 0) visible[0].click();
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-wrap')) {
        this.results.classList.remove('visible');
      }
    });
  }

  _onInput() {
    const q = this.input.value.trim().toLowerCase();
    if (!q) { this.results.classList.remove('visible'); return; }

    const all = [this.sun, ...this.planets];
    const matches = all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.nameCn.includes(q)
    );

    if (matches.length === 0) { this.results.classList.remove('visible'); return; }

    this.results.innerHTML = matches.map(m => `
      <div class="result-item" data-name="${m.name}">
        <span class="name-cn">${m.nameCn}</span>
        <span class="name-en">${m.name.toUpperCase()}</span>
      </div>
    `).join('');
    this.results.classList.add('visible');

    this.results.querySelectorAll('.result-item').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.name;
        const target = all.find(p => p.name === name);
        if (target) {
          this.onSelect(target);
          this.input.value = '';
          this.results.classList.remove('visible');
        }
      });
    });
  }
}
