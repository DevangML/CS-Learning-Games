// IPv4 Fragmentation Lab - MTU gate, fragments, offsets
;(function () {
  function toOffsets(frags) {
    return frags.map(f => f.offset8).join(', ');
  }

  class FragLabScene {
    constructor() {
      this.el = null;
      this.params = { mtu: 700, header: 20, datagram: 2000 };
      this.fragments = [];
    }

    async init(root) {
      this.el = document.createElement('div');
      this.el.className = 'lab-root';
      this.el.innerHTML = `
        <div class="lab-header">
          <h2>✂️ IPv4 Fragmentation Lab</h2>
          <p>Use MTU, datagram size, and header length to compute fragment count, data sizes, and offsets (8-byte units).</p>
        </div>
        <div class="lab-grid">
          <div class="lab-visual">
            <div class="frag-belt" id="frag-belt">
              <div class="gate" id="mtu-gate"><span id="mtu-label"></span></div>
              <div class="packets" id="packets"></div>
            </div>
          </div>
          <div class="lab-side">
            <div class="panel">
              <h3>Parameters</h3>
              <label>MTU (bytes)
                <input type="range" min="256" max="2000" step="8" value="${this.params.mtu}" id="mtuRange"/>
                <span id="mtuVal">${this.params.mtu} B</span>
              </label>
              <label>Header (bytes)
                <input type="range" min="20" max="60" step="4" value="${this.params.header}" id="hdrRange"/>
                <span id="hdrVal">${this.params.header} B</span>
              </label>
              <label>Datagram size (bytes, incl. header)
                <input type="range" min="200" max="6000" step="8" value="${this.params.datagram}" id="dgmRange"/>
                <span id="dgmVal">${this.params.datagram} B</span>
              </label>
            </div>
            <div class="panel">
              <h3>Computed</h3>
              <div class="formula">Payload = datagram − header = <strong id="payload"></strong> B</div>
              <div class="formula">Max data/frag = MTU − header = <strong id="maxData"></strong> B (multiples of 8)</div>
              <div class="formula">Fragments = <strong id="fragCount">0</strong></div>
              <div class="formula">Offsets (8B units) = <strong id="offsets">-</strong></div>
              <div class="formula">Data sizes = <span id="sizes">-</span></div>
            </div>
            <div class="panel">
              <h3>Tasks</h3>
              <ol class="tasks">
                <li>
                  How many fragments?
                  <div class="task-input">
                    <input type="number" id="ansFrag" placeholder="e.g., 3"/>
                    <button id="checkFrag">Check</button>
                  </div>
                  <div class="task-feedback" id="fbFrag"></div>
                </li>
                <li>
                  Offsets (comma-separated 8-unit):
                  <div class="task-input">
                    <input type="text" id="ansOff" placeholder="e.g., 0, 85, 170"/>
                    <button id="checkOff">Check</button>
                  </div>
                  <div class="task-feedback" id="fbOff"></div>
                </li>
              </ol>
              <small>DF set? Then oversized packets are dropped with ICMP ‘Fragmentation Needed’.</small>
            </div>
          </div>
        </div>
      `;
      root.appendChild(this.el);

      // Cache nodes
      this.belt = this.el.querySelector('#frag-belt');
      this.gate = this.el.querySelector('#mtu-gate');
      this.mtuLabel = this.el.querySelector('#mtu-label');
      this.packets = this.el.querySelector('#packets');

      this.mtuRange = this.el.querySelector('#mtuRange');
      this.hdrRange = this.el.querySelector('#hdrRange');
      this.dgmRange = this.el.querySelector('#dgmRange');
      this.mtuVal = this.el.querySelector('#mtuVal');
      this.hdrVal = this.el.querySelector('#hdrVal');
      this.dgmVal = this.el.querySelector('#dgmVal');

      this.payload = this.el.querySelector('#payload');
      this.maxData = this.el.querySelector('#maxData');
      this.fragCount = this.el.querySelector('#fragCount');
      this.offsets = this.el.querySelector('#offsets');
      this.sizes = this.el.querySelector('#sizes');

      this.ansFrag = this.el.querySelector('#ansFrag');
      this.ansOff = this.el.querySelector('#ansOff');
      this.fbFrag = this.el.querySelector('#fbFrag');
      this.fbOff = this.el.querySelector('#fbOff');

      this.el.querySelector('#checkFrag').addEventListener('click', () => this.checkFrag());
      this.el.querySelector('#checkOff').addEventListener('click', () => this.checkOff());

      const onChange = () => {
        this.params.mtu = parseInt(this.mtuRange.value, 10);
        this.params.header = parseInt(this.hdrRange.value, 10);
        this.params.datagram = parseInt(this.dgmRange.value, 10);
        this.mtuVal.textContent = `${this.params.mtu} B`;
        this.hdrVal.textContent = `${this.params.header} B`;
        this.dgmVal.textContent = `${this.params.datagram} B`;
        this.render();
      };
      [this.mtuRange, this.hdrRange, this.dgmRange].forEach(inp => inp.addEventListener('input', onChange));

      this.render();
    }

    computeFragments() {
      const mtu = this.params.mtu;
      const hdr = this.params.header;
      const total = this.params.datagram;
      const payload = Math.max(0, total - hdr);
      const maxData = Math.max(0, mtu - hdr);
      const frags = [];
      if (maxData <= 0 || payload <= 0) {
        return { payload, maxData, fragments: [] };
      }
      // All but last must be multiple of 8
      const fullData = Math.floor(maxData / 8) * 8;
      let remaining = payload;
      let offsetBytes = 0;
      while (remaining > fullData) {
        frags.push({ data: fullData, total: fullData + hdr, offset8: Math.floor(offsetBytes / 8) });
        remaining -= fullData;
        offsetBytes += fullData;
      }
      // Last fragment (can be non-multiple of 8)
      if (remaining > 0) {
        frags.push({ data: remaining, total: remaining + hdr, offset8: Math.floor(offsetBytes / 8) });
      }
      return { payload, maxData, fragments: frags };
    }

    render() {
      const { payload, maxData, fragments } = this.computeFragments();
      this.fragments = fragments;
      // Computed readouts
      this.payload.textContent = payload.toString();
      this.maxData.textContent = maxData.toString();
      this.fragCount.textContent = fragments.length.toString();
      this.offsets.textContent = fragments.length ? toOffsets(fragments) : '-';
      this.sizes.textContent = fragments.length ? fragments.map(f => f.data).join(', ') : '-';

      // Visuals
      this.mtuLabel.textContent = `MTU ${this.params.mtu}`;
      const beltWidth = this.belt.clientWidth || 600;
      const scale = beltWidth / Math.max(this.params.datagram, this.params.mtu * 2);
      this.packets.innerHTML = '';

      // Original datagram on the left
      const dgm = document.createElement('div');
      dgm.className = 'packet original';
      dgm.style.width = Math.max(30, this.params.datagram * scale) + 'px';
      dgm.innerHTML = `<span>${this.params.datagram}B</span>`;
      this.packets.appendChild(dgm);

      // Fragments on the right side
      const right = document.createElement('div');
      right.className = 'frags';
      fragments.forEach((f, idx) => {
        const box = document.createElement('div');
        box.className = 'packet frag';
        box.style.width = Math.max(20, (f.total) * scale) + 'px';
        box.title = `Data ${f.data}B, Total ${f.total}B, Offset ${f.offset8}`;
        box.innerHTML = `<span>#${idx + 1} d=${f.data} off=${f.offset8}</span>`;
        right.appendChild(box);
      });
      this.packets.appendChild(right);
    }

    checkFrag() {
      const expected = this.fragments.length;
      const given = parseInt(this.ansFrag.value, 10);
      if (!isFinite(given)) return;
      const ok = given === expected;
      this.fbFrag.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbFrag.className = 'task-feedback ' + (ok ? 'ok' : 'err');
    }

    checkOff() {
      const expected = toOffsets(this.fragments);
      const given = (this.ansOff.value || '').split(',').map(s => s.trim()).filter(Boolean).join(', ');
      const ok = given === expected;
      this.fbOff.textContent = ok ? '✅ Correct!' : `❌ Expected ${expected}`;
      this.fbOff.className = 'task-feedback ' + (ok ? 'ok' : 'err');
    }

    update() {}
    destroy() { this.el && this.el.remove(); }
  }

  window.FragLabScene = FragLabScene;
})();

