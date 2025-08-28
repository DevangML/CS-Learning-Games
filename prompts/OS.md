Operating Systems (OS) — Game Content Generator Prompt

Instruction
Create {COUNT} levels of OS interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Research commonly asked and up‑to‑date OS interview areas from reputable sources similar to our ongoing curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and widely accepted OS references. Select high‑leverage concepts without explicitly enumerating them here.
- Ensure coverage reflects practical interview expectations and current industry‑relevant kernels/tooling.

Question & Content Design
- Per level, include 2–3 concise theory topics and 4–6 quizzes. Mix: MCQ, scenario debugging, execution traces (e.g., scheduling/page faults), compare/contrast, and small numeric reasoning.
- Include realistic pitfalls and typical misconceptions; address them in explanations.

Game Content Structure (Output)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, objectives:[], prerequisites:[], theory:[Theory 2..3], quizzes:[Quiz 4..6], practice:[], missionCandidates?: string[3] }
- Theory: { id, title, summary, content (120–180 words), keyPoints: string[3..5], pitfalls: string[2..4] }
- Quiz: { id, type:"mcq_single"|"mcq_multi"|"true_false"|"numeric"|"short_answer", question, choices?, correctAnswer, hints:{t1,t2,t3}, explanation, tags: string[3..6], verified:true OR sources:{name}[] }
- Indexing: theory id and quiz id start at 0; missionCandidates reference quizzes only.

Difficulty Ramp
- Use a smooth ramp: Beginner → Intermediate → Advanced → Expert. For 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert.

Quality Rules
- Hints: three tiers (conceptual, tactical, near‑solution).
- Solutions/answers: concise and unambiguous; include algorithm steps where relevant.
- Explanations: 3–6 lines; call out common traps.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Follow the structure and indexing exactly for compatibility with the game engine.

Some numericals to include in live quizes which will have interactive 3d elements in order to solve them not needing pen and paper to visualize stuff:

Numerical/Interactive OS Topics for Live Quizzes

1. **CPU Scheduling Metrics**
   - Topics: FCFS, SJF/SRTF, Priority, Round Robin (RR)
   - Tasks: Compute waiting time (WT), turnaround time (TAT), response time; draw Gantt charts; include process arrivals and time-quantum.
   - Sources: GeeksforGeeks (×3)

2. **Page Replacement Faults**
   - Topics: FIFO, LRU, Optimal, MRU, Second-chance/Clock
   - Tasks: Count page faults for a given reference string and frame count; identify Belady’s anomaly cases.
   - Sources: GeeksforGeeks, workat.tech

3. **TLB/EAT Problems**
   - Topics: TLB hit ratio, access times, multi-level TLBs
   - Tasks: Calculate effective memory access time (EAT) with given TLB parameters.
   - Sources: GeeksforGeeks, Stack Overflow

4. **Page Table Calculations**
   - Topics: Page-table size, number of entries, multi-level paging bit splits, frames from RAM/page size
   - Tasks: Compute page-table size and related numericals.
   - Sources: GeeksforGeeks

5. **Demand Paging EAT with Page-Fault Rate**
   - Topics: Memory access time, page-fault service time, page-fault rate
   - Tasks: Calculate EAT by combining memory and page-fault service times; use numeric PF rates.
   - Sources: Matthews, Naukri

6. **Segmentation and Segmented-Paging Address Translation**
   - Topics: Logical to physical address translation, base/limit checks, mixed schemes
   - Tasks: Translate addresses, check bounds, handle segmentation and paging.
   - Sources: GeeksforGeeks

7. **Disk Scheduling Head Movement and Access Time**
   - Topics: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK
   - Tasks: Compute total seek movement; add seek, rotational, and transfer times.
   - Sources: GeeksforGeeks, takeUforward, TutorialsPoint

8. **Deadlocks: Banker's Algorithm and Detection**
   - Topics: Safe sequence feasibility, need matrix, detection with resource/allocation matrices
   - Tasks: Determine safe sequences and run deadlock detection.
   - Sources: GeeksforGeeks (×2)

9. **Internal Fragmentation and Buddy-System Steps**
   - Topics: Wasted bytes per allocation, buddy split/merge sequence
   - Tasks: Calculate internal fragmentation; trace buddy system operations.
   - Sources: GeeksforGeeks (×2)

10. **File-System Max File Size Numericals (Inode Direct/Indirect)**
    - Topics: Direct, single/double/triple-indirect pointers
    - Tasks: Compute maximum file size from inode structure.
    - Sources: GeeksforGeeks, Stack Overflow, cs162.org

11. **Working-Set Based Questions**
    - Topics: Working-set window size, thrashing rationale
    - Tasks: Identify working-set size over a window; relate to thrashing control.
    - Sources: GeeksforGeeks

12. **Practice MCQs with Numericals (India-focused)**
    - Topics: Scheduling, paging, disk, deadlocks
    - Tasks: Mixed concept MCQs with numericals.
    - Sources: IndiaBIX
