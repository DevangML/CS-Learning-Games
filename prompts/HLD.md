High‑Level Design (HLD) — Game Content Generator Prompt

Instruction
Generate {COUNT} levels of HLD interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate the most relevant HLD areas and archetypal systems from updated sources similar to our curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ materials, and reputable system design references. Select representative scenarios and core patterns without explicitly enumerating them here.
- Emphasize pragmatic trade‑offs and current industry practices.

Question & Content Design
- Per level, include 2–3 concise theory topics and 4–6 quizzes, plus 1–2 practice design tasks.
- For design items, include: core components, data flows, storage choices, API outlines (high‑level), capacity estimates (Fermi‑level), bottlenecks, and trade‑offs.

Game Content Structure (Output)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, objectives:[], prerequisites:[], theory:[Theory 2..3], quizzes:[Quiz 4..6], practice:[Practice 1..2], missionCandidates?: string[3] }
- Theory: { id, title, summary, content (120–180 words), keyPoints: string[3..5], pitfalls: string[2..4] }
- Quiz: { id, type:"mcq_single"|"mcq_multi"|"true_false"|"numeric"|"short_answer", question, choices?, correctAnswer, hints:{t1,t2,t3}, explanation, tags: string[3..6], verified:true OR sources:{name}[] }
- Practice: { id, prompt, acceptanceCriteria: string[], rubric: string, expectedArtifacts: string[] }
- Indexing: theory/practice/quiz ids start at 0; missionCandidates reference quizzes only.

Difficulty Ramp
- For 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert (scale accordingly).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Answers: concrete and concise; include trade‑offs and back‑of‑the‑envelope calculations.
- Explanations: 3–6 lines; note common misconceptions.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Follow the structure and indexing exactly for the game engine.
