Operating Systems (OS) — Game Content Generator Prompt

Instruction
Create {COUNT} levels of OS interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1". Each level has: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question has: question, hint (3 tiers), solution, concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Research commonly asked and up‑to‑date OS interview areas from reputable sources similar to our ongoing curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and widely accepted OS references. Select high‑leverage concepts without explicitly enumerating them here.
- Ensure coverage reflects practical interview expectations and current industry‑relevant kernels/tooling.

Question Design
- Use a mix of MCQ, scenario debugging, short execution traces, compare/contrast, and small numeric reasoning.
- Include realistic pitfalls and typical misconceptions; address them in the explanation.

Output Format (JSON Schema)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, questions: [Question x4] }
- Question: { question, hint, solution, concept: { title, content }, tags }
- question_id: array index 0..3 (no explicit id field)
- Optional: missionCandidates: [ "levelId-questionId", ... ]

Difficulty Ramp
- Use a smooth ramp: Beginner → Intermediate → Advanced → Expert. For 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert.

Quality Rules
- Hints: three tiers (conceptual, tactical, near‑solution).
- Solutions: concise and unambiguous; include algorithm steps where relevant.
- Explanations: 3–6 lines, call out common traps.
- Tags: 3–6 per question.
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Follow the structure and indexing exactly for compatibility with the game engine.
