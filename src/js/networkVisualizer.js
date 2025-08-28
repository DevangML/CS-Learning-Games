// Network Visualization Engine for CN Mastery Quest
class NetworkVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.playbackSpeed = 1000; // milliseconds per step
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.border = '1px solid #ddd';
        this.canvas.style.borderRadius = '8px';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Add control buttons
        this.setupControls();
    }

    setupControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'viz-controls';
        controlsDiv.innerHTML = `
            <button id="playBtn" class="btn-viz">▶ Play</button>
            <button id="pauseBtn" class="btn-viz">⏸ Pause</button>
            <button id="resetBtn" class="btn-viz">↻ Reset</button>
            <button id="stepBtn" class="btn-viz">⏯ Step</button>
            <input type="range" id="speedSlider" min="200" max="2000" value="1000" class="speed-slider">
            <span class="speed-label">Speed: 1x</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
                <span class="step-counter">Step 0 / 0</span>
            </div>
        `;
        this.container.appendChild(controlsDiv);
        
        this.bindControlEvents();
    }

    bindControlEvents() {
        document.getElementById('playBtn').onclick = () => this.play();
        document.getElementById('pauseBtn').onclick = () => this.pause();
        document.getElementById('resetBtn').onclick = () => this.reset();
        document.getElementById('stepBtn').onclick = () => this.step();
        
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.oninput = (e) => {
            this.playbackSpeed = parseInt(e.target.value);
            const speedLabel = document.querySelector('.speed-label');
            const speedX = (2200 - this.playbackSpeed) / 2000;
            speedLabel.textContent = `Speed: ${speedX.toFixed(1)}x`;
        };
    }

    // TCP 3-Way Handshake Visualization
    visualizeTCPHandshake() {
        this.totalSteps = 6;
        const steps = [
            { step: 1, action: 'Client sends SYN', packet: 'SYN', from: 'client', to: 'server' },
            { step: 2, action: 'Server receives SYN', packet: 'SYN', status: 'received' },
            { step: 3, action: 'Server sends SYN-ACK', packet: 'SYN-ACK', from: 'server', to: 'client' },
            { step: 4, action: 'Client receives SYN-ACK', packet: 'SYN-ACK', status: 'received' },
            { step: 5, action: 'Client sends ACK', packet: 'ACK', from: 'client', to: 'server' },
            { step: 6, action: 'Connection Established', packet: 'ACK', status: 'established' }
        ];

        this.currentAnimation = 'tcp-handshake';
        this.animationData = steps;
        this.reset();
        this.drawTCPHandshake(0);
    }

    drawTCPHandshake(step) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw client and server
        const clientX = 150, serverX = 650, y = 300;
        
        // Client
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(clientX - 50, y - 40, 100, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CLIENT', clientX, y + 5);
        
        // Server
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(serverX - 50, y - 40, 100, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('SERVER', serverX, y + 5);
        
        // Draw packets and arrows based on current step
        if (step >= 1) this.drawPacket(clientX + 50, y, serverX - 50, y, 'SYN', step === 1);
        if (step >= 3) this.drawPacket(serverX - 50, y - 20, clientX + 50, y - 20, 'SYN-ACK', step === 3);
        if (step >= 5) this.drawPacket(clientX + 50, y + 20, serverX - 50, y + 20, 'ACK', step === 5);
        
        // Draw connection state
        if (step === 6) {
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();
            this.ctx.moveTo(clientX + 50, y + 40);
            this.ctx.lineTo(serverX - 50, y + 40);
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = '18px Arial';
            this.ctx.fillText('CONNECTION ESTABLISHED', 400, 450);
        }
        
        // Draw step info
        if (this.animationData[step - 1]) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Step ${step}: ${this.animationData[step - 1].action}`, 400, 100);
        }
        
        this.updateProgress();
    }

    drawPacket(fromX, fromY, toX, toY, label, isAnimating) {
        // Arrow
        this.ctx.strokeStyle = isAnimating ? '#FF5722' : '#666';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash(isAnimating ? [5, 5] : []);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Arrowhead
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const headlen = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI/6), toY - headlen * Math.sin(angle - Math.PI/6));
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI/6), toY - headlen * Math.sin(angle + Math.PI/6));
        this.ctx.stroke();
        
        // Packet label
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2 - 20;
        this.ctx.fillStyle = isAnimating ? '#FF5722' : '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, midX, midY);
        
        this.ctx.setLineDash([]);
    }

    // Data Stream Flow Visualization
    visualizeDataStream(packetSize, bandwidth, delay) {
        this.totalSteps = 20;
        this.currentAnimation = 'data-stream';
        this.animationData = {
            packetSize,
            bandwidth,
            delay,
            packets: []
        };
        
        // Generate packets
        for (let i = 0; i < 10; i++) {
            this.animationData.packets.push({
                id: i + 1,
                size: packetSize,
                startTime: i * (packetSize * 8 / bandwidth),
                position: 0,
                status: 'waiting'
            });
        }
        
        this.reset();
        this.drawDataStream(0);
    }

    drawDataStream(step) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const senderX = 100, receiverX = 700, linkY = 300;
        const currentTime = step * 0.5; // seconds
        
        // Draw sender and receiver
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(senderX - 40, linkY - 30, 80, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SENDER', senderX, linkY + 5);
        
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(receiverX - 40, linkY - 30, 80, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('RECEIVER', receiverX, linkY + 5);
        
        // Draw link
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(senderX + 40, linkY);
        this.ctx.lineTo(receiverX - 40, linkY);
        this.ctx.stroke();
        
        // Draw packets in transit
        this.animationData.packets.forEach(packet => {
            if (currentTime >= packet.startTime) {
                const transitTime = currentTime - packet.startTime;
                const progress = Math.min(transitTime / this.animationData.delay, 1);
                packet.position = senderX + 40 + progress * (receiverX - senderX - 80);
                
                if (progress >= 1) {
                    packet.status = 'received';
                } else if (progress > 0) {
                    packet.status = 'in-transit';
                }
            }
            
            if (packet.status === 'in-transit') {
                this.ctx.fillStyle = '#FF5722';
                this.ctx.fillRect(packet.position - 15, linkY - 10, 30, 20);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(packet.id, packet.position, linkY + 5);
            }
        });
        
        // Draw metrics
        this.drawMetrics(currentTime);
        this.updateProgress();
    }

    drawMetrics(currentTime) {
        const metrics = [
            `Time: ${currentTime.toFixed(1)}s`,
            `Bandwidth: ${this.animationData.bandwidth} Mbps`,
            `Packet Size: ${this.animationData.packetSize} bytes`,
            `Propagation Delay: ${this.animationData.delay}s`
        ];
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        metrics.forEach((metric, i) => {
            this.ctx.fillText(metric, 50, 50 + i * 25);
        });
    }

    // Subnet Calculation Visualizer
    visualizeSubnetting(network, cidr) {
        this.totalSteps = 8;
        this.currentAnimation = 'subnetting';
        this.animationData = { network, cidr };
        this.reset();
        this.drawSubnetting(0);
    }

    drawSubnetting(step) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Subnetting ${this.animationData.network}/${this.animationData.cidr}`, 400, 50);
        
        // Calculate subnet details
        const hostBits = 32 - this.animationData.cidr;
        const totalAddresses = Math.pow(2, hostBits);
        const usableHosts = totalAddresses - 2;
        const subnetMask = this.cidrToSubnetMask(this.animationData.cidr);
        
        // Step-by-step calculation display
        const calculations = [
            `Network: ${this.animationData.network}/${this.animationData.cidr}`,
            `Host bits: 32 - ${this.animationData.cidr} = ${hostBits}`,
            `Total addresses: 2^${hostBits} = ${totalAddresses}`,
            `Usable hosts: ${totalAddresses} - 2 = ${usableHosts}`,
            `Subnet mask: ${subnetMask}`,
            `Network address: ${this.animationData.network}`,
            `Broadcast: ${this.calculateBroadcast(this.animationData.network, this.animationData.cidr)}`,
            `Host range: ${this.calculateHostRange(this.animationData.network, this.animationData.cidr)}`
        ];
        
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        for (let i = 0; i <= Math.min(step, calculations.length - 1); i++) {
            this.ctx.fillStyle = i === step ? '#FF5722' : '#333';
            this.ctx.fillText(calculations[i], 100, 120 + i * 40);
        }
        
        this.updateProgress();
    }

    // Control methods
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.animate();
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
    }

    reset() {
        this.pause();
        this.currentStep = 0;
        this.redraw();
        this.updateProgress();
    }

    step() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.redraw();
        }
    }

    animate() {
        if (!this.isPlaying) return;
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.redraw();
            
            this.animationId = setTimeout(() => this.animate(), this.playbackSpeed);
        } else {
            this.pause();
        }
    }

    redraw() {
        switch (this.currentAnimation) {
            case 'tcp-handshake':
                this.drawTCPHandshake(this.currentStep);
                break;
            case 'data-stream':
                this.drawDataStream(this.currentStep);
                break;
            case 'subnetting':
                this.drawSubnetting(this.currentStep);
                break;
        }
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.step-counter').textContent = `Step ${this.currentStep} / ${this.totalSteps}`;
    }

    // Helper methods
    cidrToSubnetMask(cidr) {
        const mask = [];
        for (let i = 0; i < 4; i++) {
            const bitsInOctet = Math.max(0, Math.min(8, cidr - i * 8));
            const octet = (0xFF << (8 - bitsInOctet)) & 0xFF;
            mask.push(octet);
        }
        return mask.join('.');
    }

    calculateBroadcast(network, cidr) {
        const networkParts = network.split('.').map(Number);
        const hostBits = 32 - cidr;
        const totalAddresses = Math.pow(2, hostBits);
        
        // Simple calculation for demonstration
        const lastOctet = networkParts[3] + totalAddresses - 1;
        return `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${lastOctet}`;
    }

    calculateHostRange(network, cidr) {
        const networkParts = network.split('.').map(Number);
        const hostBits = 32 - cidr;
        const totalAddresses = Math.pow(2, hostBits);
        
        const firstHost = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${networkParts[3] + 1}`;
        const lastHost = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${networkParts[3] + totalAddresses - 2}`;
        
        return `${firstHost} - ${lastHost}`;
    }
}

// Export for use in other modules
window.NetworkVisualizer = NetworkVisualizer;