Object‑Oriented Programming (OOP) — Game Content Generator Prompt

Instruction
Generate {COUNT} levels of OOP interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1". Each level includes: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question includes: question, hint (3 tiers), solution, concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate commonly assessed OOP areas from current interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable language references. Select high‑impact principles, patterns, and pitfalls based on these sources without explicitly enumerating them in this prompt.
- Keep content language‑consistent (pick one: Java, C++, or Python) and interview‑practical.

Question Design
- Use a mix of code reading, refactor/choice, MCQ, and short design decisions.
- Provide compact, self‑contained code snippets.

Output Format (JSON Schema)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, questions: [Question x4] }
- Question: { question, hint, solution, concept: { title, content }, tags }
- question_id = index 0..3 (no explicit id).
- Optional: missionCandidates: [ "levelId-questionId", ... ]

Difficulty Ramp
- Smooth progression: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert for an 11‑level set (scale appropriately if {COUNT} differs).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Solutions: minimal but precise; include corrected code or the correct option. If refactor is needed, describe the correct restructuring in a few lines.
- Explanations: 3–6 lines, highlight common misconceptions (e.g., “favor composition over inheritance” nuances).
- Tags: 3–6 per question.
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Conform exactly to the structure and indexing expected by the game engine.
