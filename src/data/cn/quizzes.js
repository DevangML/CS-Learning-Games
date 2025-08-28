// Computer Networks (CN) - Standalone Quizzes
const CN_QUIZZES = {
    "network-basics": {
        title: "🎯 Network Basics Mastery",
        description: "OSI vs TCP/IP, devices, IP addressing",
        difficulty: "Beginner",
        timeLimit: 300,
        questions: [
            {
                question: "Which layer is responsible for end‑to‑end reliability?",
                options: ["Network", "Transport", "Data Link", "Application"],
                correct: 1,
                explanation: "Transport layer (TCP) handles reliability, ordering, and flow control."
            },
            {
                question: "What does a router primarily use to forward packets?",
                options: ["MAC address", "Port number", "IP address", "VLAN ID"],
                correct: 2,
                explanation: "Routers operate at Layer‑3 and forward based on IP addresses."
            },
            {
                question: "Which statement about a hub is TRUE?",
                options: [
                    "Learns MAC addresses and filters",
                    "Broadcasts all frames to all ports",
                    "Routes between networks",
                    "Works at the Transport layer"
                ],
                correct: 1,
                explanation: "A hub is a simple repeater; it broadcasts frames to every port."
            },
            {
                question: "Which CIDR corresponds to 255.255.255.0?",
                options: ["/16", "/24", "/25", "/30"],
                correct: 1,
                explanation: "/24 equals 255.255.255.0 (256 addresses, 254 usable)."
            },
            {
                question: "Which protocol resolves IP to MAC within a LAN?",
                options: ["DNS", "ICMP", "ARP", "DHCP"],
                correct: 2,
                explanation: "ARP maps IPv4 addresses to MAC addresses on the local network."
            }
        ]
  }
  ,
  "subnetting-cidr-vlsm": {
    title: "📐 Subnetting / CIDR / VLSM",
    description: "Compute blocks, host counts, masks, and valid ranges",
    difficulty: "Intermediate",
    timeLimit: 600,
    questions: [
      {
        question: "For network 192.168.10.0/26, how many usable hosts per subnet?",
        options: ["64", "62", "30", "14"],
        correct: 1,
        explanation: "/26 ⇒ block size 64 addresses. Usable hosts = 64 − 2 = 62.",
        visual: `
          <div class="viz-box">
            <pre>
CIDR: /26      Mask: 255.255.255.192
Block size: 2^(32−26) = 64 addresses
Usable hosts = Block − 2 (network,broadcast)
            </pre>
          </div>`
      },
      {
        question: "Convert mask 255.255.255.240 to CIDR and pick usable host count.",
        options: ["/27 and 30", "/28 and 14", "/29 and 6", "/26 and 62"],
        correct: 1,
        explanation: "255.255.255.240 = /28. Usable = 16 − 2 = 14.",
        visual: `
          <div class="viz-box">
            <pre>
Octet: 240 = 11110000 → 4 bits
CIDR: /28
Block size: 16   Usable ≈ 14
            </pre>
          </div>`
      },
      {
        question: "You need a subnet supporting at least 50 hosts. Which prefix fits best?",
        options: ["/25", "/26", "/27", "/28"],
        correct: 1,
        explanation: "/26 gives 64 addresses ⇒ 62 usable ≥ 50. /27 has only 30 usable.",
        visual: `
          <div class="viz-box">
            <pre>
Prefix  Usable hosts
/25     126
/26     62   ← minimum ≥ 50
/27     30
/28     14
            </pre>
          </div>`
      },
      {
        question: "For network 10.0.4.0/23, what is the valid host range?",
        options: [
          "10.0.4.1 – 10.0.4.254",
          "10.0.4.1 – 10.0.5.254",
          "10.0.5.1 – 10.0.5.254",
          "10.0.4.0 – 10.0.5.255"
        ],
        correct: 1,
        explanation: "/23 covers 10.0.4.0 – 10.0.5.255. Hosts exclude network/broadcast ⇒ 10.0.4.1–10.0.5.254.",
        visual: `
          <div class="viz-box">
            <pre>
/23 span: 10.0.4.0  — 10.0.5.255
Hosts:   10.0.4.1  — 10.0.5.254
Network: 10.0.4.0   Broadcast: 10.0.5.255
            </pre>
          </div>`
      },
      {
        question: "VLSM on 192.168.1.0/24 for needs: 50, 25, 10 hosts (largest first). First three subnets?",
        options: [
          "192.168.1.0/26; 192.168.1.64/27; 192.168.1.96/28",
          "192.168.1.0/27; 192.168.1.32/28; 192.168.1.48/29",
          "192.168.1.0/25; 192.168.1.128/26; 192.168.1.192/27",
          "192.168.1.0/26; 192.168.1.128/27; 192.168.1.160/28"
        ],
        correct: 0,
        explanation: "50→/26 at .0, 25→/27 at .64, 10→/28 at .96 (sorted by size).",
        visual: `
          <div class="viz-box">
            <pre>
Needs: 50, 25, 10
Assign largest first (VLSM):
  192.168.1.0/26   (addresses .0–.63)
  192.168.1.64/27  (addresses .64–.95)
  192.168.1.96/28  (addresses .96–.111)
            </pre>
          </div>`
      }
    ]
  }
  ,
  "ip-fragmentation": {
    title: "✂️ IPv4 Fragmentation Calculations",
    description: "Compute fragments, sizes, and offsets from MTU/datagram",
    difficulty: "Intermediate",
    timeLimit: 600,
    questions: [
      {
        question: "Datagram 2000 B (incl. 20 B header) over MTU 700 B. How many fragments?",
        options: ["2", "3", "4", "5"],
        correct: 1,
        explanation: "Data=1980. Max data/frag=700−20=680 (multiple of 8). ceil(1980/680)=3.",
        visual: `
          <div class="viz-box">
            <pre>
MTU = 700   IPv4 header ≈ 20 → Data per frag = 680 (÷8 OK)
Datagram data = 2000−20 = 1980
Fragments: 680 | 680 | 620  → total 3 frags
            </pre>
          </div>`
      },
      {
        question: "For the same case, data payload sizes of the three fragments?",
        options: [
          "680, 680, 620",
          "700, 700, 600",
          "660, 660, 660",
          "680, 680, 680"
        ],
        correct: 0,
        explanation: "All but last must be multiple of 8. 1980 = 680 + 680 + 620.",
        visual: `
          <div class="viz-box">
            <pre>
Frag sizes (data): [680][680][620]
Header per frag: +20 each
            </pre>
          </div>`
      },
      {
        question: "Their fragment offsets (in 8‑byte units)?",
        options: ["0, 80, 160", "0, 85, 170", "0, 90, 180", "0, 100, 200"],
        correct: 1,
        explanation: "Offsets = (prev data bytes)/8 ⇒ 0, 680/8=85, (1360)/8=170.",
        visual: `
          <div class="viz-box">
            <pre>
Offset units = 8 bytes
Frag1 start 0 → offset 0
Frag2 start 680 → 680/8 = 85
Frag3 start 1360 → 1360/8 = 170
            </pre>
          </div>`
      },
      {
        question: "Datagram 4000 B (incl. 20 B header), MTU 1500 B. Number of fragments?",
        options: ["2", "3", "4", "5"],
        correct: 1,
        explanation: "Data=3980, max/frag=1480 (multiple of 8). ceil(3980/1480)=3.",
        visual: `
          <div class="viz-box">
            <pre>
MTU 1500 → data/frag 1480
Datagram data 3980 → 1480 | 1480 | 1020 → 3 frags
            </pre>
          </div>`
      },
      {
        question: "If DF=1 and datagram > MTU, the router will…",
        options: ["Fragment it anyway", "Drop and send ICMP", "Forward unchanged", "Increase MTU"],
        correct: 1,
        explanation: "DF set prevents fragmentation; packet dropped with ICMP ‘Fragmentation Needed’.",
        visual: `
          <div class="viz-box">
            <pre>
DF = 1 (Don’t Fragment)
If size > MTU → ❌ drop + ICMP (Type 3, Code 4)
            </pre>
          </div>`
      }
    ]
  }
  ,
  "arq-efficiency": {
    title: "📶 ARQ Protocol Efficiency",
    description: "Stop‑and‑Wait and Go‑Back‑N utilizations and throughput",
    difficulty: "Intermediate",
    timeLimit: 600,
    questions: [
      {
        question: "Stop‑and‑Wait with a = 0.25. Efficiency η?",
        options: ["0.5", "0.667", "0.75", "0.8"],
        correct: 1,
        explanation: "η = 1/(1+2a) = 1/(1+0.5) = 2/3 ≈ 0.667.",
        visual: `
          <div class="viz-box">
            <pre>
S&W timeline:
Tx [==== 1T ====]  ←→  [== 2a ==]
η = useful/(useful + wait) = 1/(1+2a)
            </pre>
          </div>`
      },
      {
        question: "GBN with N = 10 and a = 0.5. Ideal utilization (cap at 1)?",
        options: ["0.5", "1.0", "2.5", "5.0"],
        correct: 1,
        explanation: "η ≈ N/(1+2a) = 10/2 = 5 → capped at 1.",
        visual: `
          <div class="viz-box">
            <pre>
GBN pipeline (ideal): η = N/(1+2a), but η ≤ 1
N=10, a=0.5 → 10/(1+1) = 5 ⇒ cap to 1.0
            </pre>
          </div>`
      },
      {
        question: "S&W link 2 Mbps, a = 0.1. Throughput ≈ ?",
        options: ["1.0 Mbps", "1.33 Mbps", "1.67 Mbps", "2.0 Mbps"],
        correct: 2,
        explanation: "η = 1/(1+0.2)=0.833 ⇒ 0.833×2 Mbps ≈ 1.67 Mbps.",
        visual: `
          <div class="viz-box"><pre>
Capacity 2 Mbps; a=0.1 → η≈0.833
Throughput ≈ η×Capacity ≈ 0.833×2 = 1.67 Mbps
          </pre></div>`
      },
      {
        question: "Frame 1000 bits at 1 Mbps, propagation 25 ms. a = ?",
        options: ["0.025", "0.25", "2.5", "25"],
        correct: 3,
        explanation: "Tx time=1000/1e6=1 ms; a=prop/tx=25/1=25.",
        visual: `
          <div class="viz-box"><pre>
Tx time = L/R = 1000 bits / 1e6 bps = 1 ms
a = propagation / transmission = 25 ms / 1 ms = 25
          </pre></div>`
      },
      {
        question: "For previous a=25 in S&W, efficiency ≈ ?",
        options: ["~0.5", "~0.2", "~0.04", "~0.02"],
        correct: 3,
        explanation: "η=1/(1+2a)=1/51≈0.0196 ≈ 0.02.",
        visual: `
          <div class="viz-box"><pre>
a = 25 → η = 1/(1+50) = 1/51 ≈ 0.02
          </pre></div>`
      }
    ]
  }
  ,
  "bdp-window": {
    title: "🪟 Bandwidth‑Delay Product & Window Sizing",
    description: "Compute BDP and map to bytes/segments",
    difficulty: "Beginner",
    timeLimit: 540,
    questions: [
      {
        question: "100 Mbps link, RTT = 50 ms. BDP in bytes ≈ ?",
        options: ["62.5 KB", "125 KB", "250 KB", "625 KB"],
        correct: 3,
        explanation: "BDP=100e6×0.05=5e6 bits=625,000 bytes≈625 KB.",
        visual: `
          <div class="viz-box"><pre>
BDP = bandwidth × RTT
= 100,000,000 bps × 0.05 s = 5,000,000 bits
→ ÷8 = 625,000 bytes ≈ 625 KB
          </pre></div>`
      },
      {
        question: "1 Gbps, RTT=10 ms. BDP in MB ≈ ?",
        options: ["1.25 MB", "5 MB", "10 MB", "12.5 MB"],
        correct: 0,
        explanation: "BDP = 1e9 bps × 0.01 s = 10,000,000 bits; ÷8 = 1,250,000 bytes ≈ 1.25 MB.",
        visual: `
          <div class="viz-box"><pre>
BDP = 1,000,000,000 × 0.01 = 10,000,000 bits
→ ÷8 = 1,250,000 bytes ≈ 1.25 MB
          </pre></div>`
      },
      {
        question: "With MSS=1460 B and BDP=625,000 B, segments needed ≈ ?",
        options: ["256", "384", "428", "480"],
        correct: 2,
        explanation: "625000/1460 ≈ 427.4 ⇒ ≈ 428 segments to fill pipe.",
        visual: `
          <div class="viz-box"><pre>
Segments ≈ BDP / MSS = 625,000 / 1,460 ≈ 428
          </pre></div>`
      },
      {
        question: "If receiver window is 256 KB on 100 Mbps, 50 ms link, is pipe full?",
        options: ["Yes", "No"],
        correct: 1,
        explanation: "Required ≈625 KB. 256 KB < 625 KB ⇒ not full.",
        visual: `
          <div class="viz-box"><pre>
Needed window ≈ BDP ≈ 625 KB
Given window = 256 KB  → ❌ pipe underfilled
          </pre></div>`
      }
    ]
  }
  ,
  "rtt-rto": {
    title: "⏱️ RTT / RTO Estimation",
    description: "SRTT/RTTVAR updates and RTO computation",
    difficulty: "Intermediate",
    timeLimit: 540,
    questions: [
      {
        question: "SRTT=100 ms, sample=160 ms, α=1/8. New SRTT?",
        options: ["105 ms", "108 ms", "110 ms", "120 ms"],
        correct: 1,
        explanation: "SRTT+=α(sample−SRTT)=100+0.125×60=107.5≈108 ms.",
        visual: `
          <div class="viz-box"><pre>
SRTT ← SRTT + α(sample − SRTT)
= 100 + 0.125×(160−100) = 100 + 7.5 = 107.5 ≈ 108 ms
          </pre></div>`
      },
      {
        question: "RTTVAR=20 ms, prev SRTT=100 ms, sample=160 ms, β=1/4. New RTTVAR?",
        options: ["22.5 ms", "27.5 ms", "30 ms", "35 ms"],
        correct: 2,
        explanation: "|err| = 60 ms. RTTVAR = 0.75×20 + 0.25×60 = 15 + 15 = 30 ms.",
        visual: `
          <div class="viz-box"><pre>
err = |160 − 100| = 60 ms
RTTVAR = (1−β)RTTVAR + β×err = 0.75×20 + 0.25×60 = 30 ms
          </pre></div>`
      },
      {
        question: "Using SRTT=108 ms and RTTVAR=30 ms, RTO = SRTT + 4×RTTVAR ≈ ?",
        options: ["188 ms", "228 ms", "248 ms", "300 ms"],
        correct: 2,
        explanation: "RTO ≈ 108 + 4×30 = 228 ms.",
        visual: `
          <div class="viz-box"><pre>
RTO = SRTT + 4×RTTVAR = 108 + 120 = 228 ms
          </pre></div>`
      }
    ]
  }
  ,
  "crc": {
    title: "🔁 CRC Basics (Numeric)",
    description: "Generator degree, appended zeros, and codeword length",
    difficulty: "Beginner",
    timeLimit: 420,
    questions: [
      {
        question: "Generator G(x)=x^3 + x + 1 has degree r. How many zeros appended to data?",
        options: ["2", "3", "4", "8"],
        correct: 1,
        explanation: "Degree r=3 ⇒ append r zeros.",
        visual: `
          <div class="viz-box"><pre>
Degree r = 3 → append r zeros to dataword
          </pre></div>`
      },
      {
        question: "Dataword length=11, generator degree=4. Codeword length?",
        options: ["13", "14", "15", "16"],
        correct: 2,
        explanation: "Codeword length = k + r = 11 + 4 = 15.",
        visual: `
          <div class="viz-box"><pre>
k = 11, r = 4 → n = k + r = 15
          </pre></div>`
      },
      {
        question: "In CRC, if remainder is 0 at receiver, error status is…",
        options: ["Guaranteed no error", "Likely error", "No error detected", "CRC recompute needed"],
        correct: 2,
        explanation: "0 remainder ⇒ no error detected (not a guarantee).",
        visual: `
          <div class="viz-box"><pre>
Receiver divides by G(x)
Remainder 0 → no error detected
          </pre></div>`
      }
    ]
  }
  ,
  "hamming-code": {
    title: "🧮 Hamming Code (Error Correction)",
    description: "Parity count and simple syndrome reasoning",
    difficulty: "Beginner",
    timeLimit: 480,
    questions: [
      {
        question: "Minimum parity bits r for m=11 data bits (2^r ≥ m+r+1)?",
        options: ["3", "4", "5", "6"],
        correct: 1,
        explanation: "Try r=4 ⇒ 16 ≥ 11+4+1=16 ✓ (r=3 gives 8<15 ✗).",
        visual: `
          <div class="viz-box"><pre>
Need 2^r ≥ m + r + 1 (m=11)
r=3 → 8 < 11+3+1=15 ✗
r=4 → 16 ≥ 16 ✓ → r=4
          </pre></div>`
      },
      {
        question: "(7,4) Hamming code has codeword length…",
        options: ["4", "7", "8", "11"],
        correct: 1,
        explanation: "(n,k) = (7,4): 7 total bits, 4 data, 3 parity.",
        visual: `
          <div class="viz-box"><pre>
(7,4): n=7 total bits; k=4 data; r=3 parity
Parity positions: 1,2,4; Data: 3,5,6,7
          </pre></div>`
      },
      {
        question: "Hamming can correct…",
        options: ["2 bit errors", "1 bit error", "Burst errors of 3", "Only detect errors"],
        correct: 1,
        explanation: "Standard Hamming corrects single‑bit and detects double‑bit errors.",
        visual: `
          <div class="viz-box"><pre>
Hamming single‑error correction (SEC), double‑error detection (DED)
          </pre></div>`
      }
    ]
  }
};

// Export
window.CN_QUIZZES = CN_QUIZZES;
