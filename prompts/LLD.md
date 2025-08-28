Low‑Level Design (LLD) — Game Content Generator Prompt

Instruction
Produce {COUNT} levels of LLD interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Research the most asked and high‑yield LLD problems and patterns using up‑to‑date sources similar to our game’s curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable design references. Select representative systems/patterns without explicitly enumerating them here.
- Reflect practical constraints, concurrency concerns, and data integrity considerations common in interviews.

Question & Content Design
- Per level, include 2–3 concise theory topics and 4–6 quizzes, plus 1–2 practice design tasks.
- For design practice and any design‑type quiz, include: constraints, core classes/interfaces (names only), responsibilities, key interactions/sequence, and critical invariants. Avoid full code; provide a clean class sketch.

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
- Answers: bullet‑like clarity on classes, responsibilities, key methods, and invariants. Include trade‑offs if relevant.
- Explanations: 3–6 lines; call out design smells and common pitfalls.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Maintain exact structure and indexing for compatibility with the game engine.
