Computer Networks (CN) — Game Content Generator Prompt

Instruction
You are designing interview‑grade Computer Networks content for a gamified learning app. Produce {COUNT} levels of progressively harder content. Output valid JSON only, where the top‑level keys are stringified level numbers starting at "1". Each level contains: title, description, difficulty, and exactly 4 questions (indexed 0..3). Each question contains: question, hint (3 tiers inside one field or clearly delineated), solution (concise and unambiguous), concept { title, content }, and tags[].

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate coverage from up‑to‑date, reputable sources similar to our historical curation for this game: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and high‑quality networking references. Select the most commonly asked and high‑leverage concepts and patterns without explicitly listing them in the output prompt.
- Ensure progression mirrors real interview expectations and current industry practices.

Question Design
- Mix per level: scenario/trace (e.g., packet flow/state sequence), MCQ on protocol behavior, short calculation (e.g., addressing), and compare/contrast where appropriate.
- Include realistic pitfalls and misconceptions typical of interviews; address them in the explanation.

Output Format (JSON Schema)
- Top‑level: { "1": Level, "2": Level, ... }
- Level: { title, description, difficulty, questions: [Question, Question, Question, Question] }
- Question: {
  question: string,
  hint: string (with three tiers labeled 1/2/3),
  solution: string,
  concept: { title: string, content: string },
  tags: string[]
}
- question_id is the array index (0..3). Do not emit an explicit id field.
- Optional: missionCandidates: [ "levelId-questionId", "levelId-questionId", "levelId-questionId" ]

Difficulty Ramp
- Distribute difficulties across the set (Beginner → Intermediate → Advanced → Expert) with a smooth ramp. For 11‑level “Essentials”: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert. For larger sets, scale proportionally.

Quality Rules
- Hints: three tiers — conceptual nudge, tactical direction, near‑solution.
- Solutions: precise and short; for calculation questions, show formula and final numeric answer; for traces, list the correct state/flag transitions.
- Explanations: 3–6 lines that address common misconceptions.
- Tags: 3–6 per question.
- Do not include external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Use consistent indexing and keys so the game engine can consume it directly.
