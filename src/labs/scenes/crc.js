// CRC Lab - Generator degree and codeword length with simple visuals
;(function () {
  class CRCLabScene {
    constructor() {
      this.el = null;
      this.params = { k: 11, r: 4 };
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>🔁 CRC Lab</h2>
          <p>Understand generator degree r, appended zeros, and resulting codeword length.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="crc-board">
              <div class="row">
                <label>Dataword length (k)</label>
                <input type="range" min="4" max="64" value="${this.params.k}" id="kRange"/>
                <span id="kVal">${this.params.k}</span>
              </div>
              <div class="row">
                <label>Generator degree (r)</label>
                <input type="range" min="2" max="16" value="${this.params.r}" id="rRange"/>
                <span id="rVal">${this.params.r}</span>
              </div>
              <div class="bit-line" id="bitLine"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Computed</h3>
              <div class="formula">Append <strong id="appendZeros">0</strong> zeros</div>
              <div class="formula">Codeword length n = k + r = <strong id="nLen">0</strong></div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  For r, how many zeros appended?
                  <div class="task-input">
                    <input type="number" id="ansZeros" placeholder="e.g., 3"/>
                    <button id="checkZeros">Check</button>
                  </div>
                  <div class="task-feedback" id="fbZeros"></div>
                </li>
                <li>
                  Codeword length n = ?
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
      this.kRange = this.el.querySelector('#kRange');
      this.rRange = this.el.querySelector('#rRange');
      this.kVal = this.el.querySelector('#kVal');
      this.rVal = this.el.querySelector('#rVal');
      this.bitLine = this.el.querySelector('#bitLine');
      this.appendZeros = this.el.querySelector('#appendZeros');
      this.nLen = this.el.querySelector('#nLen');
      this.ansZeros = this.el.querySelector('#ansZeros');
      this.ansN = this.el.querySelector('#ansN');
      this.fbZeros = this.el.querySelector('#fbZeros');
      this.fbN = this.el.querySelector('#fbN');

      const onChange = () => {
        this.params.k = parseInt(this.kRange.value, 10);
        this.params.r = parseInt(this.rRange.value, 10);
        this.kVal.textContent = `${this.params.k}`;
        this.rVal.textContent = `${this.params.r}`;
        this.render();
      };
      this.kRange.addEventListener('input', onChange);
      this.rRange.addEventListener('input', onChange);

      this.el.querySelector('#checkZeros').addEventListener('click', () => this.checkZeros());
      this.el.querySelector('#checkN').addEventListener('click', () => this.checkN());

      this.render();
    }

    render() {
      const zeros = this.params.r;
      const n = this.params.k + this.params.r;
      this.appendZeros.textContent = zeros.toString();
      this.nLen.textContent = n.toString();
      // Visualize: k data bits + r zeros
      const cells = [];
      for (let i = 0; i < this.params.k; i++) cells.push('<div class="bit data"></div>');
      for (let i = 0; i < this.params.r; i++) cells.push('<div class="bit zero"></div>');
      this.bitLine.innerHTML = cells.join('');
    }

    checkZeros() {
      const expected = this.params.r;
      const given = parseInt(this.ansZeros.value, 10);
      const ok = given === expected;
      this.fbZeros.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbZeros.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('crc', 0, 8);
    }

    checkN() {
      const expected = this.params.k + this.params.r;
      const given = parseInt(this.ansN.value, 10);
      const ok = given === expected;
      this.fbN.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbN.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('crc', 1, 8);
    }

    update() {}
    destroy() { this.el && this.el.remove(); }
  }

  window.CRCLabScene = CRCLabScene;
})();

