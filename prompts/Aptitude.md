Aptitude (LA + QA + VA) — Game Content Generator Prompt

Instruction
Create {COUNT} levels of aptitude content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1". Each level has: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question has: question, hint (3 tiers), solution, concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Balance each level across Logical Ability, Quantitative Aptitude, and Verbal Ability. Research commonly assessed patterns and question styles from up‑to‑date sources similar to our ongoing curation: recent interview/test experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable aptitude prep references. Do not explicitly enumerate topics here.
- Keep numbers realistic and solvable in 2–4 minutes for QA; craft original and concise VA passages.

Answer Requirements
- QA: provide the correct numeric result and acceptable tolerance (if any) in the solution.
- LA/VA: provide the correct option and brief reasoning.

Output Format (JSON Schema)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, questions: [Question x4] }
- Question: { question, hint, solution, concept: { title, content }, tags }
- question_id = index 0..3. No explicit id field.
- Optional: missionCandidates: [ "levelId-questionId", ... ]

Difficulty Ramp
- 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert (scale accordingly for other counts).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Solutions: QA—show steps and final numeric; LA—state valid deductions; VA—state correct option and key justification.
- Explanations: 3–6 lines; address common traps.
- Tags: 3–6 per question.
- Do not include copyrighted passages or external links; craft original VA passages.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Conform to the structure and indexing required by the game engine.
