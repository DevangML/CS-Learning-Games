// Interactive Network Labs - Focus on Numerical Problem Solving
class NetworkLab {
    constructor() {
        this.currentLab = null;
        this.visualizer = null;
        this.setupRoutes();
    }

    setupRoutes() {
        if (window.router) {
            window.router
                .route('/lab/:labId', (ctx) => this.showLab(ctx))
                .route('/lab', (ctx) => this.showLabIndex(ctx));
        }
    }

    showLabIndex(ctx) {
        const mainContent = this.getMainContent();
        mainContent.innerHTML = `
            <div class="lab-index">
                <header class="lab-header">
                    <h1>🧪 Network Calculation Labs</h1>
                    <p>Interactive visualizations for key networking calculations</p>
                </header>

                <div class="lab-grid">
                    ${this.renderLabCards()}
                </div>
            </div>
        `;
    }

    renderLabCards() {
        const labs = [
            {
                id: 'subnet',
                title: '📐 Subnetting Calculator',
                description: 'CIDR, VLSM, and subnet calculations with step-by-step visualization',
                difficulty: 'Essential',
                topics: ['CIDR notation', 'Subnet masks', 'Host calculations', 'VLSM design']
            },
            {
                id: 'bdp',
                title: '🪟 Bandwidth-Delay Product',
                description: 'Calculate optimal window sizes and pipeline utilization',
                difficulty: 'Essential',
                topics: ['TCP window sizing', 'Pipeline efficiency', 'RTT calculations']
            },
            {
                id: 'arq',
                title: '📶 ARQ Efficiency Analysis',
                description: 'Stop-and-Wait vs Go-Back-N protocol performance',
                difficulty: 'Essential',
                topics: ['Throughput calculations', 'Efficiency formulas', 'Pipeline comparison']
            },
            {
                id: 'frag',
                title: '✂️ IP Fragmentation',
                description: 'Fragment size, offset calculations, and MTU analysis',
                difficulty: 'Intermediate',
                topics: ['MTU calculations', 'Fragment offsets', 'Header overhead']
            },
            { id: 'crc', title: '🔁 CRC Basics', description: 'Generator degree and codeword length', difficulty: 'Essential', topics: ['Generator degree', 'Appended zeros', 'Codeword length'] },
            { id: 'hamming', title: '🧮 Hamming Code', description: 'Parity bits and positions', difficulty: 'Essential', topics: ['Min parity bits', 'Bit positions', 'SEC/DED'] },
            { id: 'rtt', title: '⏱️ RTT / RTO', description: 'SRTT, RTTVAR, timeout estimation', difficulty: 'Essential', topics: ['Smoothed RTT', 'RTTVAR', 'RTO'] }
        ];

        return labs.map(lab => `
            <div class="lab-card" onclick="window.router.navigate('/lab/${lab.id}')">
                <div class="lab-header">
                    <h3>${lab.title}</h3>
                    <span class="difficulty-badge ${lab.difficulty.toLowerCase()}">${lab.difficulty}</span>
                </div>
                <p class="lab-description">${lab.description}</p>
                <div class="lab-topics">
                    ${lab.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                </div>
                <button class="lab-launch-btn">Launch Lab 🚀</button>
            </div>
        `).join('');
    }

    showLab(ctx) {
        const labId = ctx.params.labId;
        this.currentLab = labId;
        
        const mainContent = this.getMainContent();
        mainContent.innerHTML = `
            <div class="lab-container">
                <header class="lab-nav">
                    <a href="/lab" class="back-btn" data-route="/lab">← All Labs</a>
                    <h1 id="lab-title">Network Lab</h1>
                    <div class="lab-controls">
                        <button id="resetLab" class="btn-secondary">🔄 Reset</button>
                        <button id="helpLab" class="btn-secondary">❓ Help</button>
                    </div>
                </header>

                <div class="lab-workspace">
                    <div class="lab-visualization" id="lab-viz">
                        <!-- Visualization will be rendered here -->
                    </div>
                    
                    <div class="lab-panel">
                        <div class="lab-inputs" id="lab-inputs">
                            <!-- Lab-specific inputs -->
                        </div>
                        
                        <div class="lab-results" id="lab-results">
                            <!-- Calculation results -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeLab(labId);
        this.appendTheoryLinks(labId);
    }

    initializeLab(labId) {
        switch (labId) {
            case 'subnet':
                this.initSubnettingLab();
                break;
            case 'bdp':
                this.initBDPLab();
                break;
            case 'arq':
                this.initARQLab();
                break;
            case 'frag':
                this.initFragmentationLab();
                break;
            case 'crc':
                this.initCRCLab();
                break;
            case 'hamming':
                this.initHammingLab();
                break;
            case 'rtt':
                this.initRTTLab();
                break;
            default:
                this.showLabNotFound();
        }
    }

    // Subnetting Calculator Lab
    initSubnettingLab() {
        document.getElementById('lab-title').textContent = '📐 Subnetting Calculator';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>Network Configuration</h3>
            <div class="input-group">
                <label for="network">Network Address:</label>
                <input type="text" id="network" value="192.168.1.0" placeholder="e.g., 192.168.1.0">
            </div>
            <div class="input-group">
                <label for="cidr">CIDR Prefix:</label>
                <input type="number" id="cidr" value="24" min="8" max="30">
            </div>
            <div class="input-group">
                <label for="subnets">Number of Subnets:</label>
                <input type="number" id="subnets" value="4" min="1" max="256">
            </div>
            <button id="calculateSubnets" class="btn-primary">Calculate Subnets</button>
        `;

        if (window.NetworkVisualizer) {
            this.visualizer = new NetworkVisualizer('lab-viz');
        } else {
            console.warn('NetworkVisualizer not available');
            this.visualizer = null;
        }
        
        document.getElementById('calculateSubnets').onclick = () => {
            this.calculateSubnets();
        };

        // Initial calculation
        this.calculateSubnets();
    }

    calculateSubnets() {
        const network = document.getElementById('network').value;
        const cidr = parseInt(document.getElementById('cidr').value);
        const subnets = parseInt(document.getElementById('subnets').value);

        // Calculate subnet details
        const hostBits = 32 - cidr;
        const subnetBits = Math.ceil(Math.log2(subnets));
        const newCidr = cidr + subnetBits;
        const hostsPerSubnet = Math.pow(2, 32 - newCidr) - 2;
        const totalSubnets = Math.pow(2, subnetBits);

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 Calculation Results</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Original Network:</span>
                    <span class="result-value">${network}/${cidr}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Subnet Bits Needed:</span>
                    <span class="result-value">${subnetBits} bits</span>
                </div>
                <div class="result-item">
                    <span class="result-label">New Subnet Mask:</span>
                    <span class="result-value">/${newCidr}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Subnets:</span>
                    <span class="result-value">${totalSubnets}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Hosts per Subnet:</span>
                    <span class="result-value">${hostsPerSubnet}</span>
                </div>
            </div>

            <h4>📋 Subnet List</h4>
            <div class="subnet-list">
                ${this.generateSubnetList(network, newCidr, totalSubnets).join('')}
            </div>
        `;

        // Update visualization
        if (this.visualizer) {
            this.visualizer.visualizeSubnetting(network, newCidr);
        }
    }

    generateSubnetList(baseNetwork, cidr, count) {
        const results = [];
        const [a, b, c, d] = baseNetwork.split('.').map(Number);
        const subnetSize = Math.pow(2, 32 - cidr);
        
        for (let i = 0; i < count && i < 8; i++) { // Limit display to first 8
            const subnetStart = d + (i * subnetSize);
            const networkAddr = `${a}.${b}.${c}.${subnetStart}`;
            const broadcastAddr = `${a}.${b}.${c}.${subnetStart + subnetSize - 1}`;
            const firstHost = `${a}.${b}.${c}.${subnetStart + 1}`;
            const lastHost = `${a}.${b}.${c}.${subnetStart + subnetSize - 2}`;
            
            results.push(`
                <div class="subnet-item">
                    <div class="subnet-header">Subnet ${i + 1}</div>
                    <div class="subnet-details">
                        <span>Network: ${networkAddr}/${cidr}</span>
                        <span>Broadcast: ${broadcastAddr}</span>
                        <span>Host Range: ${firstHost} - ${lastHost}</span>
                    </div>
                </div>
            `);
        }
        
        if (count > 8) {
            results.push(`<div class="subnet-item">... and ${count - 8} more subnets</div>`);
        }
        
        return results;
    }

    // Bandwidth-Delay Product Lab
    initBDPLab() {
        document.getElementById('lab-title').textContent = '🪟 Bandwidth-Delay Product';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>Link Parameters</h3>
            <div class="input-group">
                <label for="bandwidth">Bandwidth (Mbps):</label>
                <input type="number" id="bandwidth" value="100" min="1" max="10000">
            </div>
            <div class="input-group">
                <label for="rtt">Round Trip Time (ms):</label>
                <input type="number" id="rtt" value="50" min="1" max="1000">
            </div>
            <div class="input-group">
                <label for="mss">Maximum Segment Size (bytes):</label>
                <input type="number" id="mss" value="1460" min="536" max="9000">
            </div>
            <button id="calculateBDP" class="btn-primary">Calculate BDP</button>
        `;

        if (window.NetworkVisualizer) {
            this.visualizer = new NetworkVisualizer('lab-viz');
        } else {
            console.warn('NetworkVisualizer not available');
            this.visualizer = null;
        }
        
        document.getElementById('calculateBDP').onclick = () => {
            this.calculateBDP();
        };

        // Initial calculation
        this.calculateBDP();
    }

    // CRC Lab (Minimal - route to existing interactive scene if present)
    initCRCLab() {
        document.getElementById('lab-title').textContent = '🔁 CRC Basics';
        const viz = document.getElementById('lab-viz');
        viz.innerHTML = `<div class="hint">Open the interactive CRC lab for hands-on practice.</div>`;
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `<button class="btn-primary" onclick="window.router.navigate('/lab/crc')">Open Interactive CRC Lab</button>`;
        const results = document.getElementById('lab-results');
        results.innerHTML = `<p>Use the interactive lab to compute appended zeros and codeword length visually.</p>`;
    }

    // Hamming Lab (Minimal)
    initHammingLab() {
        document.getElementById('lab-title').textContent = '🧮 Hamming Code';
        const viz = document.getElementById('lab-viz');
        viz.innerHTML = `<div class="hint">Open the interactive Hamming lab for parity positions and syndrome.</div>`;
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `<button class="btn-primary" onclick="window.router.navigate('/lab/hamming')">Open Interactive Hamming Lab</button>`;
        const results = document.getElementById('lab-results');
        results.innerHTML = `<p>Compute minimum parity bits and visualize bit positions.</p>`;
    }

    // RTT/RTO Lab (Minimal)
    initRTTLab() {
        document.getElementById('lab-title').textContent = '⏱️ RTT / RTO Estimation';
        const viz = document.getElementById('lab-viz');
        viz.innerHTML = `<div class="hint">Open the interactive RTT/RTO lab to adjust SRTT/RTTVAR and compute RTO.</div>`;
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `<button class="btn-primary" onclick="window.router.navigate('/lab/rtt')">Open Interactive RTT/RTO Lab</button>`;
        const results = document.getElementById('lab-results');
        results.innerHTML = `<p>Use sliders to observe how SRTT and RTTVAR affect RTO.</p>`;
    }

    calculateBDP() {
        const bandwidth = parseInt(document.getElementById('bandwidth').value);
        const rtt = parseInt(document.getElementById('rtt').value);
        const mss = parseInt(document.getElementById('mss').value);

        // Calculate BDP and related metrics
        const bdpBits = bandwidth * 1e6 * (rtt / 1000);
        const bdpBytes = bdpBits / 8;
        const bdpKB = bdpBytes / 1024;
        const bdpMB = bdpKB / 1024;
        const segmentsNeeded = Math.ceil(bdpBytes / mss);
        const optimalWindow = segmentsNeeded * mss;

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 BDP Analysis</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">BDP (bits):</span>
                    <span class="result-value">${bdpBits.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">BDP (bytes):</span>
                    <span class="result-value">${bdpBytes.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">BDP (KB):</span>
                    <span class="result-value">${bdpKB.toFixed(2)} KB</span>
                </div>
                <div class="result-item">
                    <span class="result-label">BDP (MB):</span>
                    <span class="result-value">${bdpMB.toFixed(2)} MB</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Segments Needed:</span>
                    <span class="result-value">${segmentsNeeded}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Optimal Window:</span>
                    <span class="result-value">${(optimalWindow / 1024).toFixed(2)} KB</span>
                </div>
            </div>

            <h4>💡 Performance Analysis</h4>
            <div class="analysis-section">
                <div class="analysis-item">
                    <span class="analysis-label">Pipe Capacity:</span>
                    <span>This link can hold ${bdpKB.toFixed(0)} KB of data in transit</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Window Requirement:</span>
                    <span>TCP window must be ≥${(optimalWindow / 1024).toFixed(0)} KB for full utilization</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Utilization Formula:</span>
                    <span>η = min(Window/BDP, 1)</span>
                </div>
            </div>
        `;

        // Visualize data flow
        if (this.visualizer) {
            this.visualizer.visualizeDataStream(mss, bandwidth, rtt / 1000);
        }
    }

    appendTheoryLinks(labId) {
        const LINKS = {
            subnet: [
                { label: 'GFG: Introduction to Subnetting', href: 'https://www.geeksforgeeks.org/introduction-of-subnetting/' },
                { label: 'IndiaBIX: Networking – Subnetting', href: 'https://www.indiabix.com/networking/subnetting/' }
            ],
            bdp: [
                { label: 'GFG: Bandwidth-Delay Product', href: 'https://www.geeksforgeeks.org/bandwidth-delay-product-and-its-significance/' }
            ],
            arq: [
                { label: 'GFG: Automatic Repeat reQuest (ARQ)', href: 'https://www.geeksforgeeks.org/automatic-repeat-request-arq/' }
            ],
            frag: [
                { label: 'GFG: IP Fragmentation', href: 'https://www.geeksforgeeks.org/ip-fragmentation/' }
            ],
            crc: [
                { label: 'GFG: CRC in Computer Networks', href: 'https://www.geeksforgeeks.org/cyclic-redundancy-check-crc/' }
            ],
            hamming: [
                { label: 'GFG: Hamming Code in CN', href: 'https://www.geeksforgeeks.org/hamming-code-in-computer-network/' }
            ],
            rtt: [
                { label: 'GFG: TCP Timers (RTO)', href: 'https://www.geeksforgeeks.org/tcp-timers/' }
            ]
        };
        const panel = document.getElementById('lab-results');
        const links = LINKS[labId] || [];
        if (panel && links.length) {
            const box = document.createElement('div');
            box.className = 'theory-links';
            box.innerHTML = '<h3>🔗 Theory Links</h3>' +
                '<ul class="link-list">' +
                links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join('') +
                '</ul>';
            panel.appendChild(box);
        }
    }

    // ARQ Efficiency Lab
    initARQLab() {
        document.getElementById('lab-title').textContent = '📶 ARQ Efficiency Analysis';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>Protocol Parameters</h3>
            <div class="input-group">
                <label for="protocol">Protocol Type:</label>
                <select id="protocol">
                    <option value="stopwait">Stop-and-Wait</option>
                    <option value="gbn">Go-Back-N</option>
                    <option value="sr">Selective Repeat</option>
                </select>
            </div>
            <div class="input-group">
                <label for="aValue">Propagation Ratio (a):</label>
                <input type="number" id="aValue" value="0.25" step="0.01" min="0.01" max="100">
            </div>
            <div class="input-group" id="windowGroup">
                <label for="windowSize">Window Size (N):</label>
                <input type="number" id="windowSize" value="7" min="1" max="255">
            </div>
            <div class="input-group">
                <label for="errorRate">Error Rate (%):</label>
                <input type="number" id="errorRate" value="0" min="0" max="50" step="0.1">
            </div>
            <button id="calculateARQ" class="btn-primary">Calculate Efficiency</button>
        `;

        // Hide window size for Stop-and-Wait
        document.getElementById('protocol').onchange = (e) => {
            const windowGroup = document.getElementById('windowGroup');
            windowGroup.style.display = e.target.value === 'stopwait' ? 'none' : 'block';
        };

        document.getElementById('calculateARQ').onclick = () => {
            this.calculateARQEfficiency();
        };

        // Initial calculation
        this.calculateARQEfficiency();
    }

    calculateARQEfficiency() {
        const protocol = document.getElementById('protocol').value;
        const a = parseFloat(document.getElementById('aValue').value);
        const N = parseInt(document.getElementById('windowSize').value);
        const errorRate = parseFloat(document.getElementById('errorRate').value) / 100;

        let efficiency, throughput, description;
        
        switch (protocol) {
            case 'stopwait':
                efficiency = (1 - errorRate) / (1 + 2 * a);
                description = 'η = (1-p) / (1 + 2a)';
                break;
            case 'gbn':
                efficiency = Math.min(N / (1 + 2 * a), 1) * (1 - errorRate) / (1 + errorRate * N);
                description = 'η = min(N/(1+2a), 1) × (1-p)/(1+p×N)';
                break;
            case 'sr':
                efficiency = Math.min(N / (1 + 2 * a), 1) * (1 - errorRate);
                description = 'η = min(N/(1+2a), 1) × (1-p)';
                break;
        }

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 Efficiency Results</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Protocol:</span>
                    <span class="result-value">${protocol.toUpperCase()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Efficiency (η):</span>
                    <span class="result-value">${(efficiency * 100).toFixed(2)}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Propagation Ratio (a):</span>
                    <span class="result-value">${a}</span>
                </div>
                ${protocol !== 'stopwait' ? `
                <div class="result-item">
                    <span class="result-label">Window Size (N):</span>
                    <span class="result-value">${N}</span>
                </div>
                ` : ''}
                <div class="result-item">
                    <span class="result-label">Error Rate:</span>
                    <span class="result-value">${(errorRate * 100).toFixed(1)}%</span>
                </div>
            </div>

            <h4>📈 Analysis</h4>
            <div class="analysis-section">
                <div class="formula-box">
                    <strong>Formula:</strong> ${description}
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Performance:</span>
                    <span>${this.getEfficiencyRating(efficiency)}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Bottleneck:</span>
                    <span>${this.identifyBottleneck(protocol, a, N)}</span>
                </div>
            </div>
        `;
    }

    getEfficiencyRating(efficiency) {
        if (efficiency > 0.9) return '🏆 Excellent (>90%)';
        if (efficiency > 0.7) return '⭐ Good (70-90%)';
        if (efficiency > 0.5) return '📊 Fair (50-70%)';
        return '⚠️ Poor (<50%)';
    }

    identifyBottleneck(protocol, a, N) {
        if (protocol === 'stopwait') {
            if (a > 1) return 'High propagation delay - consider pipelining';
            return 'Protocol limitation - use pipelining for better performance';
        }
        
        const pipelineLimit = N / (1 + 2 * a);
        if (pipelineLimit > 1) return 'Bandwidth limited - increase link capacity';
        return 'Window size limited - increase window size';
    }

    // IP Fragmentation Lab
    initFragmentationLab() {
        document.getElementById('lab-title').textContent = '✂️ IP Fragmentation Calculator';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>Packet Parameters</h3>
            <div class="input-group">
                <label for="datagramSize">Datagram Size (bytes):</label>
                <input type="number" id="datagramSize" value="2000" min="28" max="65535">
            </div>
            <div class="input-group">
                <label for="headerSize">IP Header Size (bytes):</label>
                <input type="number" id="headerSize" value="20" min="20" max="60">
            </div>
            <div class="input-group">
                <label for="mtu">MTU (bytes):</label>
                <input type="number" id="mtu" value="700" min="68" max="9000">
            </div>
            <div class="input-group">
                <label for="df">Don't Fragment (DF):</label>
                <input type="checkbox" id="df">
            </div>
            <button id="calculateFrags" class="btn-primary">Calculate Fragments</button>
        `;

        document.getElementById('calculateFrags').onclick = () => {
            this.calculateFragmentation();
        };

        // Initial calculation
        this.calculateFragmentation();
    }

    calculateFragmentation() {
        const datagramSize = parseInt(document.getElementById('datagramSize').value);
        const headerSize = parseInt(document.getElementById('headerSize').value);
        const mtu = parseInt(document.getElementById('mtu').value);
        const df = document.getElementById('df').checked;

        const dataSize = datagramSize - headerSize;
        const maxDataPerFrag = mtu - headerSize;
        const alignedDataPerFrag = Math.floor(maxDataPerFrag / 8) * 8; // Must be multiple of 8

        if (df && datagramSize > mtu) {
            const results = document.getElementById('lab-results');
            results.innerHTML = `
                <div class="error-message">
                    <h3>❌ Fragmentation Required but DF=1</h3>
                    <p>Packet would be dropped and ICMP "Fragmentation Needed" sent.</p>
                    <div class="icmp-details">
                        <strong>ICMP Type 3, Code 4:</strong> Destination Unreachable - Fragmentation Needed
                    </div>
                </div>
            `;
            return;
        }

        if (datagramSize <= mtu) {
            const results = document.getElementById('lab-results');
            results.innerHTML = `
                <div class="success-message">
                    <h3>✅ No Fragmentation Needed</h3>
                    <p>Packet size (${datagramSize} bytes) ≤ MTU (${mtu} bytes)</p>
                </div>
            `;
            return;
        }

        const numFragments = Math.ceil(dataSize / alignedDataPerFrag);
        const fragments = [];

        for (let i = 0; i < numFragments; i++) {
            const isLast = i === numFragments - 1;
            const fragDataSize = isLast ? dataSize - (i * alignedDataPerFrag) : alignedDataPerFrag;
            const fragTotalSize = fragDataSize + headerSize;
            const offset = (i * alignedDataPerFrag) / 8;
            const moreFrags = !isLast;

            fragments.push({
                fragment: i + 1,
                dataSize: fragDataSize,
                totalSize: fragTotalSize,
                offset: offset,
                moreFragments: moreFrags
            });
        }

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 Fragmentation Results</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Original Size:</span>
                    <span class="result-value">${datagramSize} bytes</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Data Size:</span>
                    <span class="result-value">${dataSize} bytes</span>
                </div>
                <div class="result-item">
                    <span class="result-label">MTU:</span>
                    <span class="result-value">${mtu} bytes</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Fragments:</span>
                    <span class="result-value">${numFragments}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Data per Fragment:</span>
                    <span class="result-value">${alignedDataPerFrag} bytes</span>
                </div>
            </div>

            <h4>📋 Fragment Details</h4>
            <div class="fragment-table">
                <div class="fragment-header">
                    <span>Frag #</span>
                    <span>Data Size</span>
                    <span>Total Size</span>
                    <span>Offset</span>
                    <span>More Frags</span>
                </div>
                ${fragments.map(frag => `
                    <div class="fragment-row">
                        <span>${frag.fragment}</span>
                        <span>${frag.dataSize} bytes</span>
                        <span>${frag.totalSize} bytes</span>
                        <span>${frag.offset}</span>
                        <span>${frag.moreFragments ? 'Yes (MF=1)' : 'No (MF=0)'}</span>
                    </div>
                `).join('')}
            </div>

            <h4>💡 Key Points</h4>
            <div class="analysis-section">
                <div class="analysis-item">
                    <span class="analysis-label">Offset Units:</span>
                    <span>Fragment offsets are in 8-byte units</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Alignment:</span>
                    <span>Data size must be multiple of 8 (except last fragment)</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Overhead:</span>
                    <span>Each fragment adds ${headerSize} bytes of header overhead</span>
                </div>
            </div>
        `;
    }

    // TCP Flow Control Lab
    initTCPFlowLab() {
        document.getElementById('lab-title').textContent = '🚚 TCP Flow Control';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>TCP Parameters</h3>
            <div class="input-group">
                <label for="initialWindow">Initial Window Size (KB):</label>
                <input type="number" id="initialWindow" value="64" min="1" max="1024">
            </div>
            <div class="input-group">
                <label for="rttValue">RTT (ms):</label>
                <input type="number" id="rttValue" value="100" min="1" max="1000">
            </div>
            <div class="input-group">
                <label for="lossRate">Packet Loss Rate (%):</label>
                <input type="number" id="lossRate" value="1" min="0" max="10" step="0.1">
            </div>
            <button id="calculateTCP" class="btn-primary">Analyze Flow Control</button>
        `;

        document.getElementById('calculateTCP').onclick = () => {
            this.calculateTCPFlow();
        };

        // Initial calculation
        this.calculateTCPFlow();
    }

    calculateTCPFlow() {
        const initialWindow = parseInt(document.getElementById('initialWindow').value);
        const rtt = parseInt(document.getElementById('rttValue').value);
        const lossRate = parseFloat(document.getElementById('lossRate').value) / 100;

        // AIMD calculations
        const cwndAfterLoss = Math.max(1, Math.floor(initialWindow / 2));
        const timeToRecover = Math.ceil(Math.log2(initialWindow / cwndAfterLoss)) * rtt;
        const avgThroughput = (0.75 * initialWindow) / (rtt / 1000); // Simplified

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 TCP Flow Analysis</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Initial Window:</span>
                    <span class="result-value">${initialWindow} KB</span>
                </div>
                <div class="result-item">
                    <span class="result-label">After Loss (AIMD):</span>
                    <span class="result-value">${cwndAfterLoss} KB</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recovery Time:</span>
                    <span class="result-value">${timeToRecover} ms</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Avg Throughput:</span>
                    <span class="result-value">${avgThroughput.toFixed(2)} KB/s</span>
                </div>
            </div>

            <h4>💡 AIMD Analysis</h4>
            <div class="analysis-section">
                <div class="analysis-item">
                    <span class="analysis-label">Algorithm:</span>
                    <span>Additive Increase, Multiplicative Decrease</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">On Loss:</span>
                    <span>Window reduced to ${cwndAfterLoss} KB (50% of current)</span>
                </div>
            </div>
        `;
    }

    // Routing Calculations Lab
    initRoutingLab() {
        document.getElementById('lab-title').textContent = '🛣️ Routing Calculations';
        
        const inputs = document.getElementById('lab-inputs');
        inputs.innerHTML = `
            <h3>Network Topology</h3>
            <div class="input-group">
                <label for="nodes">Number of Nodes:</label>
                <input type="number" id="nodes" value="5" min="3" max="10">
            </div>
            <div class="input-group">
                <label for="algorithm">Routing Algorithm:</label>
                <select id="algorithm">
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="bellman">Bellman-Ford</option>
                </select>
            </div>
            <button id="calculateRouting" class="btn-primary">Calculate Paths</button>
        `;

        document.getElementById('calculateRouting').onclick = () => {
            this.calculateRouting();
        };

        // Initial calculation
        this.calculateRouting();
    }

    calculateRouting() {
        const nodes = parseInt(document.getElementById('nodes').value);
        const algorithm = document.getElementById('algorithm').value;

        // Simplified routing calculations
        const maxHops = nodes - 1;
        const convergenceTime = algorithm === 'dijkstra' ? 
            Math.log2(nodes) * 100 : // Simplified for Dijkstra
            nodes * 50; // Simplified for Bellman-Ford

        const results = document.getElementById('lab-results');
        results.innerHTML = `
            <h3>📊 Routing Analysis</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Algorithm:</span>
                    <span class="result-value">${algorithm.toUpperCase()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Network Size:</span>
                    <span class="result-value">${nodes} nodes</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Max Path Length:</span>
                    <span class="result-value">${maxHops} hops</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Convergence Time:</span>
                    <span class="result-value">${convergenceTime} ms</span>
                </div>
            </div>

            <h4>📈 Algorithm Comparison</h4>
            <div class="analysis-section">
                <div class="analysis-item">
                    <span class="analysis-label">Time Complexity:</span>
                    <span>${algorithm === 'dijkstra' ? 'O(V log V)' : 'O(V × E)'}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Best Use:</span>
                    <span>${algorithm === 'dijkstra' ? 'Non-negative weights' : 'Handles negative weights'}</span>
                </div>
            </div>
        `;
    }

    getMainContent() {
        // Hide game interface elements
        const elementsToHide = [
            'gameArea', 'levelSelector', 'dailyMissions', 'roadmapHeader', 
            'gameStats', 'userProfile'
        ];
        
        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });

        // Show or create lab container
        let labContainer = document.getElementById('lab-main');
        if (!labContainer) {
            labContainer = document.createElement('div');
            labContainer.id = 'lab-main';
            labContainer.className = 'lab-main-content';
            document.querySelector('.container').appendChild(labContainer);
        }
        
        labContainer.style.display = 'block';
        return labContainer;
    }

    showLabNotFound() {
        const mainContent = this.getMainContent();
        mainContent.innerHTML = `
            <div class="error-page">
                <h1>404 - Lab Not Found</h1>
                <p>The requested lab could not be found.</p>
                <a href="/lab" class="btn-primary" data-route="/lab">← Back to Lab Index</a>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.networkLab = new NetworkLab();
});

// Export for global access
window.NetworkLab = NetworkLab;
