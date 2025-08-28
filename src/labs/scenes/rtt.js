// RTT/RTO Estimation Lab - SRTT/RTTVAR updates and RTO
;(function () {
  class RTTLabScene {
    constructor() {
      this.el = null;
      this.params = { srtt: 100, rttvar: 20, sample: 160, alpha: 0.125, beta: 0.25 };
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>⏱️ RTT / RTO Estimation Lab</h2>
          <p>Play with SRTT/RTTVAR updates and compute RTO = SRTT + 4×RTTVAR.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="panel">
              <h3>Parameters</h3>
              <label>SRTT (ms)
                <input type="range" min="10" max="500" value="${this.params.srtt}" id="srttRange"/>
                <span id="srttVal">${this.params.srtt} ms</span>
              </label>
              <label>RTTVAR (ms)
                <input type="range" min="1" max="200" value="${this.params.rttvar}" id="varRange"/>
                <span id="varVal">${this.params.rttvar} ms</span>
              </label>
              <label>Sample RTT (ms)
                <input type="range" min="10" max="500" value="${this.params.sample}" id="sampRange"/>
                <span id="sampVal">${this.params.sample} ms</span>
              </label>
              <label>α (alpha)
                <input type="range" min="0.05" max="0.5" step="0.005" value="${this.params.alpha}" id="alphaRange"/>
                <span id="alphaVal">${this.params.alpha}</span>
              </label>
              <label>β (beta)
                <input type="range" min="0.05" max="0.5" step="0.005" value="${this.params.beta}" id="betaRange"/>
                <span id="betaVal">${this.params.beta}</span>
              </label>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Formulas</h3>
              <div class="formula">err = |sample − SRTT|</div>
              <div class="formula">SRTT' = SRTT + α(sample − SRTT)</div>
              <div class="formula">RTTVAR' = (1−β)RTTVAR + β·err</div>
              <div class="formula">RTO = SRTT' + 4×RTTVAR'</div>
              <div class="formula">SRTT' = <strong id="srttP">0</strong> ms; RTTVAR' = <strong id="varP">0</strong> ms; RTO = <strong id="rto">0</strong> ms</div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  New SRTT (ms):
                  <div class="task-input">
                    <input type="number" id="ansSrtt" step="0.1"/>
                    <button id="checkSrtt">Check</button>
                  </div>
                  <div class="task-feedback" id="fbSrtt"></div>
                </li>
                <li>
                  New RTTVAR (ms):
                  <div class="task-input">
                    <input type="number" id="ansVar" step="0.1"/>
                    <button id="checkVar">Check</button>
                  </div>
                  <div class="task-feedback" id="fbVar"></div>
                </li>
                <li>
                  RTO (ms):
                  <div class="task-input">
                    <input type="number" id="ansRto" step="0.1"/>
                    <button id="checkRto">Check</button>
                  </div>
                  <div class="task-feedback" id="fbRto"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache
      this.srttRange = this.el.querySelector('#srttRange');
      this.varRange = this.el.querySelector('#varRange');
      this.sampRange = this.el.querySelector('#sampRange');
      this.alphaRange = this.el.querySelector('#alphaRange');
      this.betaRange = this.el.querySelector('#betaRange');
      this.srttVal = this.el.querySelector('#srttVal');
      this.varVal = this.el.querySelector('#varVal');
      this.sampVal = this.el.querySelector('#sampVal');
      this.alphaVal = this.el.querySelector('#alphaVal');
      this.betaVal = this.el.querySelector('#betaVal');
      this.srttP = this.el.querySelector('#srttP');
      this.varP = this.el.querySelector('#varP');
      this.rto = this.el.querySelector('#rto');
      this.fbSrtt = this.el.querySelector('#fbSrtt');
      this.fbVar = this.el.querySelector('#fbVar');
      this.fbRto = this.el.querySelector('#fbRto');

      const onChange = () => {
        this.params.srtt = parseFloat(this.srttRange.value);
        this.params.rttvar = parseFloat(this.varRange.value);
        this.params.sample = parseFloat(this.sampRange.value);
        this.params.alpha = parseFloat(this.alphaRange.value);
        this.params.beta = parseFloat(this.betaRange.value);
        this.srttVal.textContent = `${this.params.srtt} ms`;
        this.varVal.textContent = `${this.params.rttvar} ms`;
        this.sampVal.textContent = `${this.params.sample} ms`;
        this.alphaVal.textContent = `${this.params.alpha}`;
        this.betaVal.textContent = `${this.params.beta}`;
        this.updateComputed();
      };
      ['input','change'].forEach(ev => [this.srttRange,this.varRange,this.sampRange,this.alphaRange,this.betaRange].forEach(el=>el.addEventListener(ev,onChange)));

      this.updateComputed();
      this.el.querySelector('#checkSrtt').addEventListener('click', () => this.checkSrtt());
      this.el.querySelector('#checkVar').addEventListener('click', () => this.checkVar());
      this.el.querySelector('#checkRto').addEventListener('click', () => this.checkRto());
    }

    updateComputed() {
      const s = this.params.srtt;
      const v = this.params.rttvar;
      const m = this.params.sample;
      const a = this.params.alpha;
      const b = this.params.beta;
      const srttP = s + a * (m - s);
      const err = Math.abs(m - s);
      const varP = (1 - b) * v + b * err;
      const rto = srttP + 4 * varP;
      this.srttP.textContent = srttP.toFixed(1);
      this.varP.textContent = varP.toFixed(1);
      this.rto.textContent = rto.toFixed(1);
      this._srttP = srttP;
      this._varP = varP;
      this._rto = rto;
    }

    checkSrtt() {
      const given = parseFloat(this.el.querySelector('#ansSrtt').value);
      const ok = Math.abs(given - this._srttP) <= 0.5;
      this.fbSrtt.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${this._srttP.toFixed(1)}`;
      this.fbSrtt.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('rtt', 0, 10);
    }

    checkVar() {
      const given = parseFloat(this.el.querySelector('#ansVar').value);
      const ok = Math.abs(given - this._varP) <= 0.5;
      this.fbVar.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${this._varP.toFixed(1)}`;
      this.fbVar.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('rtt', 1, 10);
    }

    checkRto() {
      const given = parseFloat(this.el.querySelector('#ansRto').value);
      const ok = Math.abs(given - this._rto) <= 1.0;
      this.fbRto.textContent = ok ? '✅ Correct!' : `❌ Expected ≈ ${this._rto.toFixed(1)}`;
      this.fbRto.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('rtt', 2, 12);
    }

    update() {}
    destroy() { this.el && this.el.remove(); }
  }

  window.RTTLabScene = RTTLabScene;
})();
