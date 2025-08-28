Prompts for generating interview‑grade game content in multiple domains.

How to use
- Replace {COUNT} with the number of levels to generate (e.g., 11 for Essentials, 23 for Complete).
- Feed the entire prompt file to your content generator.
- Require the generator to output only JSON (no code fences), following the schema and constraints.

Shared Schema and Constraints
- Output: a JSON object whose top‑level keys are stringified level numbers starting at "1".
- Level: { title, description, difficulty, questions }
- Question: { question, hint, solution, concept: { title, content }, tags }
- Questions per level: 4 (indexed 0..3 as question_id)
- Difficulty ramp: Beginner → Intermediate → Advanced → Expert (ramp across the set).
- Hints: three tiers (conceptual, tactical, near‑solution).
- Explanations: include a concise, misconception‑aware explanation in each question.
- Tags: include 3–6 topic tags per question.
- Mission candidates (optional): an array of three balanced "levelId-questionId" strings.
- Research-driven: The generator should research and select up‑to‑date, high‑leverage topics from reputable sources similar to our historical curation (e.g., recent interview experiences on GFG, structured learning paths, TUF+ resources, and widely accepted references). Do not explicitly list topics in the prompt text; let the generator pick them based on research.
- No external links or copyrighted text in the output.

Files
- CN.md: Computer Networks
- OS.md: Operating Systems
- OOP.md: Object‑Oriented Programming
- LLD.md: Low‑Level Design
- HLD.md: High‑Level Design
- Aptitude.md: Logical, Quantitative, Verbal Aptitude
