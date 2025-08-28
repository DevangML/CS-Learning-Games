// Subnetting/CIDR/VLSM Lab - Binary mask board and ranges
;(function () {
  function parseIPv4(s) {
    const parts = (s || '').trim().split('.').map(n => parseInt(n, 10));
    if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null;
    return parts;
  }
  function ipToInt(a,b,c,d){ return ((a<<24)>>>0) + (b<<16) + (c<<8) + d; }
  function intToIp(x){ return [(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.'); }

  class SubnetLabScene {
    constructor() {
      this.el = null;
      this.params = { net: '192.168.1.0', prefix: 26 };
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>📐 Subnetting / CIDR / VLSM Lab</h2>
          <p>Visualize binary masks, block sizes, and valid host ranges.</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="mask-board">
              <div class="row">
                <label>Network:</label>
                <input id="netInput" value="${this.params.net}"/>
                <label>Prefix:</label>
                <input type="range" min="8" max="30" value="${this.params.prefix}" id="prefixRange"/>
                <span id="pfxVal">/${this.params.prefix}</span>
              </div>
              <div class="row bin" id="maskRow"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Computed</h3>
              <div class="formula">Mask: <strong id="maskStr"></strong></div>
              <div class="formula">Block size: <strong id="blockSize">0</strong> addresses</div>
              <div class="formula">Usable hosts: <strong id="usable">0</strong></div>
              <div class="formula">Host range: <strong id="hostRange">-</strong></div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  Usable hosts for this prefix?
                  <div class="task-input">
                    <input type="number" id="ansHosts" placeholder="e.g., 62"/>
                    <button id="checkHosts">Check</button>
                  </div>
                  <div class="task-feedback" id="fbHosts"></div>
                </li>
                <li>
                  First–Last host (e.g., 192.168.1.1–192.168.1.62):
                  <div class="task-input">
                    <input type="text" id="ansRange" placeholder="a.b.c.d–e.f.g.h"/>
                    <button id="checkRange">Check</button>
                  </div>
                  <div class="task-feedback" id="fbRange"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache
      this.netInput = this.el.querySelector('#netInput');
      this.prefixRange = this.el.querySelector('#prefixRange');
      this.pfxVal = this.el.querySelector('#pfxVal');
      this.maskRow = this.el.querySelector('#maskRow');
      this.maskStr = this.el.querySelector('#maskStr');
      this.blockSizeEl = this.el.querySelector('#blockSize');
      this.usableEl = this.el.querySelector('#usable');
      this.hostRangeEl = this.el.querySelector('#hostRange');
      this.ansHosts = this.el.querySelector('#ansHosts');
      this.ansRange = this.el.querySelector('#ansRange');
      this.fbHosts = this.el.querySelector('#fbHosts');
      this.fbRange = this.el.querySelector('#fbRange');

      this.el.querySelector('#checkHosts').addEventListener('click', () => this.checkHosts());
      this.el.querySelector('#checkRange').addEventListener('click', () => this.checkRange());
      const onChange = () => {
        this.params.net = this.netInput.value.trim();
        this.params.prefix = parseInt(this.prefixRange.value, 10);
        this.pfxVal.textContent = `/${this.params.prefix}`;
        this.render();
      };
      this.netInput.addEventListener('change', onChange);
      this.prefixRange.addEventListener('input', onChange);

      this.render();
    }

    maskFromPrefix(p) {
      const maskInt = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
      const m = intToIp(maskInt);
      return { maskInt, maskStr: m };
    }

    compute() {
      const ip = parseIPv4(this.params.net);
      if (!ip) return null;
      const p = this.params.prefix;
      const { maskInt, maskStr } = this.maskFromPrefix(p);
      const ipInt = ipToInt(ip[0], ip[1], ip[2], ip[3]);
      const network = (ipInt & maskInt) >>> 0;
      const block = Math.pow(2, 32 - p);
      const broadcast = (network + block - 1) >>> 0;
      const firstHost = p === 32 ? network : (network + 1) >>> 0;
      const lastHost = p >= 31 ? broadcast : (broadcast - 1) >>> 0;
      const usable = p >= 31 ? 0 : Math.max(0, block - 2);
      return { maskStr, block, usable, firstHost, lastHost };
    }

    render() {
      const res = this.compute();
      if (!res) return;
      const p = this.params.prefix;
      // Binary mask row
      let bits = ''.padStart(p, '1') + ''.padStart(32 - p, '0');
      const chunks = bits.match(/.{1,8}/g) || [];
      this.maskRow.innerHTML = chunks.map((chunk, i) => `
        <div class="octet">${chunk.replace(/0/g,'<span class=\'b0\'>0</span>').replace(/1/g,'<span class=\'b1\'>1</span>')}</div>
      `).join('');

      this.maskStr.textContent = res.maskStr;
      this.blockSizeEl.textContent = res.block.toString();
      this.usableEl.textContent = res.usable.toString();
      const rangeStr = `${intToIp(res.firstHost)}–${intToIp(res.lastHost)}`;
      this.hostRangeEl.textContent = res.usable ? rangeStr : 'N/A (prefix ≥ /31)';
    }

    checkHosts() {
      const res = this.compute();
      if (!res) return;
      const given = parseInt(this.ansHosts.value, 10);
      const ok = given === res.usable;
      this.fbHosts.textContent = ok ? '✅ Correct!' : `❌ Expected ${res.usable}`;
      this.fbHosts.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('subnet', 0, 10);
    }

    checkRange() {
      const res = this.compute();
      if (!res || !res.usable) return;
      const expected = `${intToIp(res.firstHost)}–${intToIp(res.lastHost)}`;
      const given = (this.ansRange.value || '').replace(/\s+/g,'');
      const ok = given === expected;
      this.fbRange.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbRange.className = 'task-feedback ' + (ok ? 'ok' : 'err');
      if (ok && window.LabProgress) window.LabProgress.award('subnet', 1, 12);
    }

    update() {}
    destroy() { this.el && this.el.remove(); }
  }

  window.SubnetLabScene = SubnetLabScene;
})();

