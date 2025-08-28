// BDP Lab Scene - Visual pipe + live formulas
;(function () {
  function fmtBytes(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' MB';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + ' KB';
    return Math.round(n) + ' B';
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  class BDPLabScene {
    constructor() {
      this.el = null;
      this.pipe = null;
      this.beads = [];
      this.params = { bwMbps: 100, rttMs: 50, mss: 1460 };
      this.time = 0;
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>🪟 Bandwidth–Delay Product (BDP) Lab</h2>
          <p>Adjust parameters and watch how the pipe (in-flight data) fills. Compute window sizing visually.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="pipe" id="bdp-pipe">
              <div class="pipe-bg"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Parameters</h3>
              <label>Bandwidth (Mbps)
                <input type="range" min="1" max="1000" value="${this.params.bwMbps}" id="bwRange"/>
                <span id="bwVal">${this.params.bwMbps} Mbps</span>
              </label>
              <label>RTT (ms)
                <input type="range" min="1" max="500" value="${this.params.rttMs}" id="rttRange"/>
                <span id="rttVal">${this.params.rttMs} ms</span>
              </label>
              <label>MSS (bytes)
                <input type="range" min="256" max="4096" step="4" value="${this.params.mss}" id="mssRange"/>
                <span id="mssVal">${this.params.mss} B</span>
              </label>
            </div>
            <div class="panel">
              <h3>Formulas</h3>
              <div class="formula">BDP = bandwidth × RTT</div>
              <div class="formula">= <span id="bwBits">0</span> × <span id="rttSec">0</span> = <strong id="bdpBits">0</strong> bits (<strong id="bdpBytes">0</strong>)</div>
              <div class="formula">Required Window ≈ BDP (bytes)</div>
              <div class="formula">Segments ≈ BDP / MSS = <strong id="segCount">0</strong></div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  How many segments to fill the pipe?
                  <div class="task-input">
                    <input type="number" id="ansSegments" placeholder="e.g., 428"/>
                    <button id="checkSegments">Check</button>
                  </div>
                  <div class="task-feedback" id="fbSegments"></div>
                </li>
                <li>
                  What window size (bytes) fully utilizes the link?
                  <div class="task-input">
                    <input type="number" id="ansWindow" placeholder="e.g., 625000"/>
                    <button id="checkWindow">Check</button>
                  </div>
                  <div class="task-feedback" id="fbWindow"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache nodes
      this.pipe = this.el.querySelector('#bdp-pipe');
      this.bwRange = this.el.querySelector('#bwRange');
      this.rttRange = this.el.querySelector('#rttRange');
      this.mssRange = this.el.querySelector('#mssRange');
      this.bwVal = this.el.querySelector('#bwVal');
      this.rttVal = this.el.querySelector('#rttVal');
      this.mssVal = this.el.querySelector('#mssVal');
      this.bwBits = this.el.querySelector('#bwBits');
      this.rttSec = this.el.querySelector('#rttSec');
      this.bdpBits = this.el.querySelector('#bdpBits');
      this.bdpBytes = this.el.querySelector('#bdpBytes');
      this.segCount = this.el.querySelector('#segCount');

      this.ansSegments = this.el.querySelector('#ansSegments');
      this.ansWindow = this.el.querySelector('#ansWindow');
      this.fbSegments = this.el.querySelector('#fbSegments');
      this.fbWindow = this.el.querySelector('#fbWindow');

      this.el.querySelector('#checkSegments').addEventListener('click', () => this.checkSegments());
      this.el.querySelector('#checkWindow').addEventListener('click', () => this.checkWindow());

      const onChange = () => {
        this.params.bwMbps = parseInt(this.bwRange.value, 10);
        this.params.rttMs = parseInt(this.rttRange.value, 10);
        this.params.mss = parseInt(this.mssRange.value, 10);
        this.bwVal.textContent = `${this.params.bwMbps} Mbps`;
        this.rttVal.textContent = `${this.params.rttMs} ms`;
        this.mssVal.textContent = `${this.params.mss} B`;
        this.refreshReadouts();
        this.spawnBeads();
      };
      [this.bwRange, this.rttRange, this.mssRange].forEach(inp => inp.addEventListener('input', onChange));

      this.refreshReadouts();
      this.spawnBeads();
    }

    getBDP() {
      // bandwidth in bits/s, rtt in s
      const bw = this.params.bwMbps * 1e6; // bits/s
      const rtt = this.params.rttMs / 1000; // s
      const bits = bw * rtt;
      const bytes = bits / 8;
      return { bits, bytes };
    }

    refreshReadouts() {
      const bw = (this.params.bwMbps * 1e6).toLocaleString();
      const rtt = (this.params.rttMs / 1000).toFixed(3);
      const { bits, bytes } = this.getBDP();
      this.bwBits.textContent = `${bw} bps`;
      this.rttSec.textContent = `${rtt} s`;
      this.bdpBits.textContent = bits.toLocaleString();
      this.bdpBytes.textContent = fmtBytes(bytes);
      const segs = Math.max(1, Math.round(bytes / this.params.mss));
      this.segCount.textContent = segs.toString();
    }

    checkSegments() {
      const { bytes } = this.getBDP();
      const expected = Math.round(bytes / this.params.mss);
      const given = parseInt(this.ansSegments.value, 10);
      if (!isFinite(given)) return;
      const ok = Math.abs(given - expected) <= 1; // small tolerance for rounding
      this.fbSegments.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${expected}`;
      this.fbSegments.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('bdp', 0, 12);
    }

    checkWindow() {
      const { bytes } = this.getBDP();
      const expected = Math.round(bytes);
      const given = parseInt(this.ansWindow.value, 10);
      if (!isFinite(given)) return;
      const ok = Math.abs(given - expected) <= Math.max(1000, expected * 0.01); // 1% or 1KB
      this.fbWindow.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${expected} B (${fmtBytes(expected)})`;
      this.fbWindow.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('bdp', 1, 12);
    }

    spawnBeads() {
      // Create a number of beads relative to seg count, capped for performance
      const { bytes } = this.getBDP();
      const segs = Math.max(1, Math.round(bytes / this.params.mss));
      const beadCount = clamp(Math.round(segs / 4), 10, 120);

      const pipe = this.pipe;
      pipe.innerHTML = '<div class="pipe-bg"></div>';
      this.beads = [];
      for (let i = 0; i < beadCount; i++) {
        const d = document.createElement('div');
        d.className = 'bead';
        d.style.left = Math.round((i / beadCount) * 100) + '%';
        pipe.appendChild(d);
        this.beads.push({ el: d, x: i / beadCount });
      }
    }

    update(dt) {
      this.time += dt;
      // Speed proportional to bandwidth; normalize a bit
      const speed = clamp(this.params.bwMbps / 200, 0.1, 5.0);
      for (const b of this.beads) {
        b.x += dt * speed * 0.1;
        if (b.x > 1) b.x -= 1;
        b.el.style.left = (b.x * 100).toFixed(2) + '%';
      }
    }

    destroy() {
      this.el && this.el.remove();
      this.beads = [];
    }
  }

  window.BDPLabScene = BDPLabScene;
})();

