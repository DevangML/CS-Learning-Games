Aptitude (LA + QA + VA) — Game Content Generator Prompt

Instruction
Create {COUNT} levels of aptitude content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Balance each level across Logical Ability, Quantitative Aptitude, and Verbal Ability. Research commonly assessed patterns and question styles from up‑to‑date sources similar to our ongoing curation: recent interview/test experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable aptitude prep references. Do not explicitly enumerate topics here.
- Keep numbers realistic and solvable in 2–4 minutes for QA; craft original and concise VA passages.

Answer Requirements
- QA quizzes: provide the correct numeric result and acceptable tolerance (if any) in correctAnswer; include steps in the explanation.
- LA/VA quizzes: provide the correct option and brief reasoning in the explanation.

Game Content Structure (Output)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, objectives:[], prerequisites:[], theory:[Theory 2..3], quizzes:[Quiz 4..6], practice:[], missionCandidates?: string[3] }
- Theory: { id, title, summary, content (120–180 words), keyPoints: string[3..5], pitfalls: string[2..4] }
- Quiz: { id, type:"mcq_single"|"mcq_multi"|"true_false"|"numeric"|"short_answer", question, choices?, correctAnswer, tolerance?, hints:{t1,t2,t3}, explanation, tags: string[3..6], verified:true OR sources:{name}[] }
- Indexing: theory id and quiz id start at 0; missionCandidates reference quizzes only.

Difficulty Ramp
- 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert (scale accordingly for other counts).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Answers: QA—final numeric + steps; LA—valid deductions; VA—correct option + key justification.
- Explanations: 3–6 lines; address common traps.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- Do not include copyrighted passages or external links; craft original VA passages.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Conform to the structure and indexing required by the game engine.
