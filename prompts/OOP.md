Object‑Oriented Programming (OOP) — Game Content Generator Prompt

Instruction
Generate {COUNT} levels of OOP interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate commonly assessed OOP areas from current interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable language references. Select high‑impact principles, patterns, and pitfalls based on these sources without explicitly enumerating them in this prompt.
- Keep content language‑consistent (pick one: Java, C++, or Python) and interview‑practical.

Question & Content Design
- Per level, include 2–3 concise theory topics and 4–6 quizzes. Mix: code reading, refactor/choice, MCQ, true/false, short design decisions.
- Provide compact, self‑contained code snippets in one chosen language (Java/C++/Python) and remain consistent.

Game Content Structure (Output)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, objectives:[], prerequisites:[], theory:[Theory 2..3], quizzes:[Quiz 4..6], practice:[], missionCandidates?: string[3] }
- Theory: { id, title, summary, content (120–180 words), keyPoints: string[3..5], pitfalls: string[2..4] }
- Quiz: { id, type:"mcq_single"|"mcq_multi"|"true_false"|"numeric"|"short_answer", question, choices?, correctAnswer, hints:{t1,t2,t3}, explanation, tags: string[3..6], verified:true OR sources:{name}[] }
- Indexing: theory id and quiz id start at 0; missionCandidates reference quizzes only.

Difficulty Ramp
- Smooth progression: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert for an 11‑level set (scale appropriately if {COUNT} differs).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Answers: minimal but precise; include corrected code or the correct option. If refactor is needed, describe the correct restructuring succinctly.
- Explanations: 3–6 lines, highlight common misconceptions.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Conform exactly to the structure and indexing expected by the game engine.
