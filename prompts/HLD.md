High‑Level Design (HLD) — Game Content Generator Prompt

Instruction
Generate {COUNT} levels of HLD interview content. Output valid JSON only, with top‑level keys as stringified level numbers starting at "1". Each level contains: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question contains: question (scenario), hint (3 tiers), solution (key components, data flows, APIs, capacity estimates, bottlenecks/trade‑offs), concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate the most relevant HLD areas and archetypal systems from updated sources similar to our curation: recent interview experiences (e.g., GFG), structured learning paths, TUF+ materials, and reputable system design references. Select representative scenarios and core patterns without explicitly enumerating them here.
- Emphasize pragmatic trade‑offs and current industry practices.

Question Design
- Scenario‑driven tasks to design or scale a system. Solutions should list core components, data flows, storage choices, API outlines (high‑level), capacity estimates (Fermi‑level), bottlenecks, and trade‑offs.

Output Format (JSON Schema)
- Top‑level: { "1": Level, ... }
- Level: { title, description, difficulty, questions: [Question x4] }
- Question: { question, hint, solution, concept: { title, content }, tags }
- question_id = index 0..3. No explicit id field.
- Optional: missionCandidates: [ "levelId-questionId", ... ]

Difficulty Ramp
- For 11 levels: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert (scale accordingly).

Quality Rules
- Hints: three tiers (conceptual → tactical → near‑solution).
- Solutions: concrete and concise; include trade‑offs and back‑of‑the‑envelope calculations.
- Explanations: 3–6 lines; note common misconceptions.
- Tags: 3–6 per question.
- No external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Follow the structure and indexing exactly for the game engine.
