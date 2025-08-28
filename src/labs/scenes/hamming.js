// Hamming Code Lab - parity bits and syndrome basics
;(function () {
  function minParityBits(m) {
    let r = 0;
    while (Math.pow(2, r) < m + r + 1) r++;
    return r;
  }

  class HammingLabScene {
    constructor() {
      this.el = null;
      this.params = { m: 11 };
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>🧮 Hamming Code Lab</h2>
          <p>Visualize parity positions and compute minimum parity bits r for m data bits.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="hamming-board">
              <div class="row">
                <label>Data bits (m)</label>
                <input type="range" min="1" max="32" value="${this.params.m}" id="mRange"/>
                <span id="mVal">${this.params.m}</span>
              </div>
              <div class="bit-grid" id="bitGrid"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Computed</h3>
              <div class="formula">r such that 2^r ≥ m + r + 1</div>
              <div class="formula">r = <strong id="rOut">0</strong>, total n = m + r = <strong id="nOut">0</strong></div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  Minimum r for this m?
                  <div class="task-input">
                    <input type="number" id="ansR" placeholder="e.g., 4"/>
                    <button id="checkR">Check</button>
                  </div>
                  <div class="task-feedback" id="fbR"></div>
                </li>
                <li>
                  Total codeword length n?
                  <div class="task-input">
                    <input type="number" id="ansN" placeholder="e.g., 15"/>
                    <button id="checkN">Check</button>
                  </div>
                  <div class="task-feedback" id="fbN"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache
      this.mRange = this.el.querySelector('#mRange');
      this.mVal = this.el.querySelector('#mVal');
      this.bitGrid = this.el.querySelector('#bitGrid');
      this.rOut = this.el.querySelector('#rOut');
      this.nOut = this.el.querySelector('#nOut');
      this.ansR = this.el.querySelector('#ansR');
      this.ansN = this.el.querySelector('#ansN');
      this.fbR = this.el.querySelector('#fbR');
      this.fbN = this.el.querySelector('#fbN');

      this.mRange.addEventListener('input', () => { this.params.m = parseInt(this.mRange.value, 10); this.mVal.textContent = `${this.params.m}`; this.render(); });
      this.el.querySelector('#checkR').addEventListener('click', () => this.checkR());
      this.el.querySelector('#checkN').addEventListener('click', () => this.checkN());

      this.render();
    }

    render() {
      const m = this.params.m;
      const r = minParityBits(m);
      const n = m + r;
      this.rOut.textContent = r.toString();
      this.nOut.textContent = n.toString();
      // Build positions 1..n with parity at powers of two
      const cells = [];
      for (let i = 1; i <= n; i++) {
        const isParity = (i & (i - 1)) === 0; // power of two
        cells.push(`<div class="cell ${isParity ? 'parity' : 'data'}" title="${isParity ? 'Parity' : 'Data'} @ ${i}">${i}</div>`);
      }
      this.bitGrid.innerHTML = cells.join('');
    }

    checkR() {
      const expected = minParityBits(this.params.m);
      const given = parseInt(this.ansR.value, 10);
      const ok = given === expected;
      this.fbR.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbR.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('hamming', 0, 8);
    }

    checkN() {
      const expected = this.params.m + minParityBits(this.params.m);
      const given = parseInt(this.ansN.value, 10);
      const ok = given === expected;
      this.fbN.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbN.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('hamming', 1, 10);
    }

    update() {}
    destroy() { this.el && this.el.remove(); }
  }

  window.HammingLabScene = HammingLabScene;
})();

