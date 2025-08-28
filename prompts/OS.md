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
