Low‑Level Design (LLD) — Game Content Generator Prompt

Instruction
Produce {COUNT} levels of LLD interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1". Each level has: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question contains: question (problem statement), hint (3 tiers), solution (core classes, data structures, and invariants), concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Research the most asked and high‑yield LLD problems and patterns using up‑to‑date sources similar to our game’s curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and reputable design references. Select representative systems/patterns without explicitly enumerating them here.
- Reflect practical constraints, concurrency concerns, and data integrity considerations common in interviews.

Question Design
- For each question, include: constraints, core classes/interfaces (names only), responsibilities, key interactions/sequence at a high level, and critical invariants. Avoid full code; provide a clean class sketch.

Output Format (JSON Schema)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, questions: [Question x4] }
- Question: {
  question: string,
  hint: string,
  solution: string (describe classes, methods, data structures, invariants),
  concept: { title: string, content: string },
  tags: string[]
}
- question_id is 0..3. No explicit field for IDs.
- Optional: missionCandidates: [ "levelId-questionId", ... ]

Difficulty Ramp
- For 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert (scale accordingly).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Solutions: bullet‑like clarity on classes, responsibilities, key methods, and invariants. Include mention of tradeoffs if relevant.
- Explanations: 3–6 lines; call out design smells and common pitfalls.
- Tags: 3–6 per question.
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Maintain exact structure and indexing for compatibility with the game engine.
