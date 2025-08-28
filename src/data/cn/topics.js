// Computer Networks (CN) Theory Topics - Initial Set
const CN_TOPICS = {
    1: {
        id: "network-basics",
        title: "🌐 Network Fundamentals",
        category: "Basics",
        difficulty: "Beginner",
        estimatedTime: "12 min",
        description: "OSI vs TCP/IP, devices, addressing essentials",
        verified: true,
        content: `
        <h2>Models: OSI vs TCP/IP</h2>
        <p>The <strong>OSI model</strong> has 7 layers (Physical → Application) and is a conceptual reference. The <strong>TCP/IP model</strong> has 4–5 layers used in real networks (Link, Internet, Transport, Application).</p>
        <div class="comparison-table">
            <table>
                <tr><th>OSI</th><th>TCP/IP</th><th>Examples</th></tr>
                <tr><td>Physical</td><td>Link</td><td>Ethernet, Wi‑Fi</td></tr>
                <tr><td>Data Link</td><td>Link</td><td>MAC, ARP</td></tr>
                <tr><td>Network</td><td>Internet</td><td>IP, ICMP</td></tr>
                <tr><td>Transport</td><td>Transport</td><td>TCP, UDP</td></tr>
                <tr><td>Session</td><td rowspan="3">Application</td><td>RPC, TLS</td></tr>
                <tr><td>Presentation</td><td>SSL/TLS, encoding</td></tr>
                <tr><td>Application</td><td>HTTP, DNS, SMTP</td></tr>
            </table>
        </div>
        <h3>Devices</h3>
        <ul>
            <li><strong>Hub:</strong> Broadcasts all frames; no filtering</li>
            <li><strong>Switch:</strong> Learns MAC table; forwards per port</li>
            <li><strong>Router:</strong> Layer‑3 forwarding between networks</li>
        </ul>
        <h3>Addressing</h3>
        <ul>
            <li><strong>MAC:</strong> 48‑bit link‑layer address (e.g., 00:1A:2B:…)</li>
            <li><strong>IPv4:</strong> 32‑bit dotted decimal (e.g., 192.168.1.1)</li>
            <li><strong>Subnetting:</strong> CIDR notation (e.g., /24 = 255.255.255.0)</li>
        </ul>
        `,
        quiz: [
            {
                question: "Which device operates at Layer 2 and forwards based on MAC table?",
                options: ["Router", "Switch", "Hub", "Firewall"],
                correct: 1,
                explanation: "Switches are Layer‑2 devices that learn and forward by MAC addresses."
            },
            {
                question: "Which OSI layers map into TCP/IP's Application layer?",
                options: ["Application only", "Session + Presentation", "Application + Session + Presentation", "Transport"],
                correct: 2,
                explanation: "TCP/IP condenses OSI Session, Presentation, Application into one Application layer."
            }
        ]
    },
    2: {
        id: "transport-layer",
        title: "🚚 Transport Layer: TCP vs UDP",
        category: "Transport",
        difficulty: "Beginner",
        estimatedTime: "15 min",
        description: "Connections, reliability, flow and congestion control",
        verified: true,
        content: `
        <h2>TCP vs UDP</h2>
        <ul>
            <li><strong>TCP:</strong> Connection‑oriented, reliable, ordered, congestion‑controlled.</li>
            <li><strong>UDP:</strong> Connectionless, best‑effort, low overhead, no ordering.</li>
        </ul>
        <h3>TCP Handshake</h3>
        <ol>
            <li>SYN: client → server</li>
            <li>SYN‑ACK: server → client</li>
            <li>ACK: client → server</li>
        </ol>
        <h3>Reliability & Control</h3>
        <ul>
            <li><strong>ARQ:</strong> Acks + retransmissions ensure delivery</li>
            <li><strong>Flow control:</strong> Receiver window prevents overflow</li>
            <li><strong>Congestion control:</strong> Slow start, AIMD</li>
        </ul>
        `,
        quiz: [
            {
                question: "Which is NOT a TCP feature?",
                options: ["Congestion control", "Ordered delivery", "Connectionless transfer", "Flow control"],
                correct: 2,
                explanation: "TCP is connection‑oriented; UDP is connectionless."
            },
            {
                question: "How many steps in the TCP handshake?",
                options: ["1", "2", "3", "4"],
                correct: 2,
                explanation: "SYN → SYN‑ACK → ACK: 3‑way handshake establishes the connection."
            }
        ]
    }
};

// Export
window.CN_TOPICS = CN_TOPICS;

