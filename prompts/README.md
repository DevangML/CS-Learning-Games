Prompts for generating interview‑grade game content in multiple domains.

How to use
- Replace {COUNT} with the number of levels to generate (e.g., 11 for Essentials, 23 for Complete).
- Feed the entire prompt file to your content generator.
- Require the generator to output only JSON (no code fences), following the schema and constraints.
- For DBMS content, use the specialized DBMS.md prompt that includes SQL practice components.

Shared Schema and Constraints (Updated)
- Output: a JSON object whose top‑level keys are stringified level numbers starting at "1".
- Level object:
  - title: string
  - description: string (1–2 sentences)
  - difficulty: one of ["Beginner","Intermediate","Advanced","Expert"]
  - objectives: string[] (3–5 bullets)
  - prerequisites: string[] (0–4 bullets)
  - theory: Theory[] (2–3 concise theory topics per level)
  - quizzes: Quiz[] (4–6 questions per level, mixed types)
  - practice: Practice[] (optional; for LLD/HLD include 1–2 design tasks per level)
  - missionCandidates (optional): string[] of three items, each "levelId-quizId" referencing quizzes only
- Theory object:
  - id: integer starting at 0 within the level
  - title: string
  - summary: string (1–2 sentences)
  - content: string (120–180 words)
  - keyPoints: string[] (3–5)
  - pitfalls: string[] (2–4)
- Quiz object:
  - id: integer starting at 0 within the level (quiz_id)
  - type: one of ["mcq_single","mcq_multi","true_false","numeric","short_answer"]
  - question: string
  - choices: string[] (required for mcq_*; omit for others)
  - correctAnswer: string | string[] (array for multi‑select); for numeric add optional tolerance
  - hints: { t1: string, t2: string, t3: string } (three tiers)
  - explanation: string (3–6 lines, addresses misconceptions)
  - tags: string[] (3–6)
  - verified: boolean OR sources: { name: string }[] (at least one must be present; no links)
- Practice object (optional; recommended for LLD/HLD):
  - id: integer starting at 0 within the level
  - prompt: string (scenario/design task)
  - acceptanceCriteria: string[]
  - rubric: string (what a strong answer must include)
  - expectedArtifacts: string[] (e.g., class sketch, API outline)
- Indexing:
  - levels start at 1 (as strings); quiz_id and theory_id both start at 0 within each level
- Difficulty ramp: Beginner → Intermediate → Advanced → Expert across the set (for 11‑level Essentials: 3/5/2/1).
- Hints: three tiers (conceptual → tactical → near‑solution).
- Explanations: concise, misconception‑aware.
- Tags: 3–6 per quiz for filtering and spaced repetition.
- Research‑driven: The generator should research and select up‑to‑date, high‑leverage topics from reputable sources similar to our historical curation (e.g., recent interview experiences on GFG, structured learning paths, TUF+ resources, and widely accepted references). Do not explicitly list topics in the prompt text; let the generator pick them based on research.
- No external links or copyrighted text in the output.

Files
- CN.md: Computer Networks
- OS.md: Operating Systems  
- OOP.md: Object‑Oriented Programming
- LLD.md: Low‑Level Design
- HLD.md: High‑Level Design
- Aptitude.md: Logical, Quantitative, Verbal Aptitude
- DBMS.md: Database Management Systems with SQL Practice (specialized format)
