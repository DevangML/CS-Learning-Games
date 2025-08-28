// ARQ Lab Scene - Stop-and-Wait and Go-Back-N timelines
;(function () {
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  class ARQLabScene {
    constructor() {
      this.el = null;
      this.params = { mode: 'sw', rateMbps: 2, frameBytes: 1000, propMs: 25, N: 10 };
      this.time = 0;
      this.blocks = [];
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>📶 ARQ Efficiency Lab (S&W and GBN)</h2>
          <p>Visualize transmission vs propagation, sliding windows, and utilization.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="timeline" id="arq-timeline">
              <div class="axis"></div>
              <div class="win" id="win-band"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Parameters</h3>
              <label>Mode
                <select id="modeSelect">
                  <option value="sw">Stop-and-Wait</option>
                  <option value="gbn">Go-Back-N</option>
                </select>
              </label>
              <label>Rate (Mbps)
                <input type="range" min="1" max="1000" value="${this.params.rateMbps}" id="rateRange"/>
                <span id="rateVal">${this.params.rateMbps} Mbps</span>
              </label>
              <label>Frame (bytes)
                <input type="range" min="200" max="8000" step="20" value="${this.params.frameBytes}" id="frameRange"/>
                <span id="frameVal">${this.params.frameBytes} B</span>
              </label>
              <label>Propagation (ms)
                <input type="range" min="1" max="500" value="${this.params.propMs}" id="propRange"/>
                <span id="propVal">${this.params.propMs} ms</span>
              </label>
              <label id="Nwrap">Window N (GBN)
                <input type="range" min="1" max="64" value="${this.params.N}" id="nRange"/>
                <span id="nVal">${this.params.N}</span>
              </label>
            </div>
            <div class="panel">
              <h3>Formulas</h3>
              <div class="formula">Tx time T = L/R</div>
              <div class="formula">L = <span id="Lbits">0</span> bits; R = <span id="Rbits">0</span> bps → T = <strong id="Tsec">0</strong> s</div>
              <div class="formula">a = prop / T = <strong id="aval">0</strong></div>
              <div class="formula">η = <span id="etaExpr">1/(1+2a)</span> = <strong id="etaVal">0</strong></div>
              <small>GBN uses η ≈ N/(1+2a) (capped at 1)</small>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  Compute a (prop/T):
                  <div class="task-input">
                    <input type="number" id="ansA" step="0.01" placeholder="e.g., 25"/>
                    <button id="checkA">Check</button>
                  </div>
                  <div class="task-feedback" id="fbA"></div>
                </li>
                <li>
                  Compute η (utilization):
                  <div class="task-input">
                    <input type="number" id="ansEta" step="0.001" placeholder="e.g., 0.667"/>
                    <button id="checkEta">Check</button>
                  </div>
                  <div class="task-feedback" id="fbEta"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache nodes
      this.timeline = this.el.querySelector('#arq-timeline');
      this.winBand = this.el.querySelector('#win-band');
      this.modeSelect = this.el.querySelector('#modeSelect');
      this.rateRange = this.el.querySelector('#rateRange');
      this.frameRange = this.el.querySelector('#frameRange');
      this.propRange = this.el.querySelector('#propRange');
      this.nRange = this.el.querySelector('#nRange');
      this.rateVal = this.el.querySelector('#rateVal');
      this.frameVal = this.el.querySelector('#frameVal');
      this.propVal = this.el.querySelector('#propVal');
      this.nVal = this.el.querySelector('#nVal');

      this.Lbits = this.el.querySelector('#Lbits');
      this.Rbits = this.el.querySelector('#Rbits');
      this.Tsec = this.el.querySelector('#Tsec');
      this.aval = this.el.querySelector('#aval');
      this.etaExpr = this.el.querySelector('#etaExpr');
      this.etaVal = this.el.querySelector('#etaVal');

      this.ansA = this.el.querySelector('#ansA');
      this.ansEta = this.el.querySelector('#ansEta');
      this.fbA = this.el.querySelector('#fbA');
      this.fbEta = this.el.querySelector('#fbEta');

      this.el.querySelector('#checkA').addEventListener('click', () => this.checkA());
      this.el.querySelector('#checkEta').addEventListener('click', () => this.checkEta());

      const onChange = () => {
        this.params.mode = this.modeSelect.value;
        this.params.rateMbps = parseInt(this.rateRange.value, 10);
        this.params.frameBytes = parseInt(this.frameRange.value, 10);
        this.params.propMs = parseInt(this.propRange.value, 10);
        this.params.N = parseInt(this.nRange.value, 10);
        this.rateVal.textContent = `${this.params.rateMbps} Mbps`;
        this.frameVal.textContent = `${this.params.frameBytes} B`;
        this.propVal.textContent = `${this.params.propMs} ms`;
        this.nVal.textContent = `${this.params.N}`;
        this.el.querySelector('#Nwrap').style.display = this.params.mode === 'gbn' ? 'block' : 'none';
        this.refreshReadouts();
        this.spawnTimeline();
      };
      ;['input','change'].forEach(ev => {
        [this.modeSelect,this.rateRange,this.frameRange,this.propRange,this.nRange].forEach(inp => inp.addEventListener(ev, onChange));
      });

      this.refreshReadouts();
      this.spawnTimeline();
    }

    txTimeSec() {
      const L = this.params.frameBytes * 8; // bits
      const R = this.params.rateMbps * 1e6; // bps
      return L / R;
    }

    aVal() {
      return (this.params.propMs / 1000) / this.txTimeSec();
    }

    eta() {
      const a = this.aVal();
      if (this.params.mode === 'sw') {
        return 1 / (1 + 2 * a);
      } else {
        return Math.min(1, this.params.N / (1 + 2 * a));
      }
    }

    refreshReadouts() {
      const L = (this.params.frameBytes * 8);
      const R = (this.params.rateMbps * 1e6);
      const T = this.txTimeSec();
      const a = this.aVal();
      const eta = this.eta();
      this.Lbits.textContent = L.toLocaleString();
      this.Rbits.textContent = R.toLocaleString();
      this.Tsec.textContent = T.toFixed(3);
      this.aval.textContent = a.toFixed(2);
      this.etaExpr.textContent = this.params.mode === 'sw' ? '1/(1+2a)' : 'N/(1+2a) (cap 1)';
      this.etaVal.textContent = eta.toFixed(3);
    }

    spawnTimeline() {
      this.timeline.innerHTML = '<div class="axis"></div><div class="win" id="win-band"></div>';
      this.winBand = this.timeline.querySelector('#win-band');
      const T = this.txTimeSec();
      const prop = this.params.propMs / 1000;
      const pxPerSec = 220; // scale

      // Draw frames for one RTT window
      const count = this.params.mode === 'sw' ? 1 : clamp(this.params.N, 1, 20);
      for (let i = 0; i < count; i++) {
        const d = document.createElement('div');
        d.className = 'frame-block';
        const startSec = i * T; // pipeline launch
        const x = startSec * pxPerSec;
        const w = Math.max(6, T * pxPerSec);
        d.style.left = x + 'px';
        d.style.width = w + 'px';
        d.title = `Frame ${i+1}`;
        this.timeline.appendChild(d);
      }

      // ACK return band to visualize RTT cycle
      const rtt = 2 * prop;
      const bandW = Math.max(20, rtt * pxPerSec);
      this.winBand.style.left = '0px';
      this.winBand.style.width = bandW + 'px';
      this.winBand.title = `RTT ≈ ${rtt.toFixed(3)} s`;
    }

    update(dt) {
      // Optionally animate band shimmering
      const t = (this.time += dt);
      if (this.winBand) {
        const alpha = 0.2 + 0.1 * Math.sin(t * 2.0);
        this.winBand.style.background = `rgba(102, 126, 234, ${alpha.toFixed(2)})`;
      }
    }

    checkA() {
      const expected = this.aVal();
      const given = parseFloat(this.ansA.value);
      if (!isFinite(given)) return;
      const ok = Math.abs(given - expected) <= 0.05 * Math.max(1, expected);
      this.fbA.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${expected.toFixed(2)}`;
      this.fbA.className = 'task-feedback ' + (ok ? 'ok' : 'err');
    }

    checkEta() {
      const expected = this.eta();
      const given = parseFloat(this.ansEta.value);
      if (!isFinite(given)) return;
      const ok = Math.abs(given - expected) <= 0.02;
      this.fbEta.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${expected.toFixed(3)}`;
      this.fbEta.className = 'task-feedback ' + (ok ? 'ok' : 'err');
    }

    destroy() { this.el && this.el.remove(); }
  }

  window.ARQLabScene = ARQLabScene;
})();

