Computer Networks (CN) — Game Content Generator Prompt

Instruction
You are designing interview‑grade Computer Networks content for a gamified learning app. Produce {COUNT} levels of progressively harder content. Output valid JSON only, where the top‑level keys are stringified level numbers starting at "1".

Content Sourcing (Do Not List Topics Explicitly)
- Research and curate coverage from up‑to‑date, reputable sources similar to our historical curation for this game: recent interview experiences (e.g., GFG), structured learning paths, TUF+ resources, and high‑quality networking references. Select the most commonly asked and high‑leverage concepts and patterns without explicitly listing them in the output prompt.
- Ensure progression mirrors real interview expectations and current industry practices.

Question & Content Design
- Per level, include 2–3 concise theory topics and 4–6 quizzes. Mix: scenario/trace, MCQ (single/multi), true/false, short calculation (e.g., addressing), and compare/contrast.
- Include realistic pitfalls and misconceptions; address them in explanations.

Game Content Structure (Output)
- Top‑level: { "1": Level, "2": Level, ... }
- Level: {
  title, description, difficulty,
  objectives: string[],
  prerequisites: string[],
  theory: Theory[2..3],
  quizzes: Quiz[4..6],
  practice: Practice[] (optional),
  missionCandidates?: string[3] ("levelId-quizId")
}
- Theory: { id, title, summary, content (120–180 words), keyPoints: string[3..5], pitfalls: string[2..4] }
- Quiz: {
  id,
  type: "mcq_single"|"mcq_multi"|"true_false"|"numeric"|"short_answer",
  question,
  choices? (for mcq),
  correctAnswer (string or string[]; numeric may include tolerance),
  hints: { t1, t2, t3 },
  explanation,
  tags: string[3..6],
  verified: true OR sources: { name }[]
}
- Indexing: theory id and quiz id start at 0. missionCandidates reference quizzes only.

Difficulty Ramp
- Distribute difficulties across the set (Beginner → Intermediate → Advanced → Expert) with a smooth ramp. For 11‑level “Essentials”: 3 Beginner, 5 Intermediate, 2 Advanced, 1 Expert. For larger sets, scale proportionally.

Quality Rules
- Hints: three tiers — conceptual nudge, tactical direction, near‑solution.
- Solutions/answers: precise and short; for calculation items, show formula and final numeric answer; for traces, list the correct state/flag transitions.
- Explanations: 3–6 lines that address common misconceptions.
- Tags: 3–6 per quiz.
- Authentic knowledge: every quiz must include verified: true OR sources[] (names only; no links).
- Do not include external links or copyrighted text.

Production Constraints
- Output valid JSON only (no code fences, no commentary).
- Use consistent indexing and keys so the game engine can consume it directly.
