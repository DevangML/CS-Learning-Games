# SQL Mastery Quest

An interactive, browser‑based SQL learning game. Practice real SQL against a live MySQL database, progress through curated levels, and reinforce learning with a theory hub and quizzes. Built with Node.js + Express, vanilla JS, SQLite for user data, and MySQL for the tutorial dataset.

## Table of Contents
- Overview
- Features
- Quick Start
- Full Setup
- Configuration (.env)
- Project Structure
- How It Works
- Routes
- API (server)
- Authentic Knowledge Rule
- Content Prompts & Validation
- Troubleshooting
- Contributing & License

## Overview
SQL Mastery Quest blends hands‑on SQL execution with gamified progression and spaced repetition.
- Practice Flow: Essentials (11 levels) or Complete (23 levels) of SQL challenges powered by a local MySQL database.
- Theory Flow: A theory hub with topic pages and auto‑starting practice quizzes.
- Persistence: User progress, streaks, missions, and rewards stored in SQLite; learning dataset in MySQL.
- Authentication: Google OAuth or frictionless Demo Mode.

## Features
- Gameplay
  - Dual paths: Essentials (11) and Complete (23)
  - Real SQL execution (SELECT/CTE/INSERT/UPDATE/DELETE/CREATE/ALTER...)
  - Autonomous progression and level locking with clear status cues
  - Daily missions, weekly quests, streaks, shields, and recovery
- Theory & Quizzes
  - Theory topics with concise explanations and pitfalls
  - Practice quizzes with auto‑start and inline review
- UX
  - SPA routing with deep‑linkable routes (History API)
  - Responsive UI (no horizontal overflow), sticky nav, polished auth card
  - Logged‑out clean screen (only the centered auth card visible)
- Platform
  - SQLite for user data, MySQL for tutorial dataset
  - Google OAuth + Demo Mode
  - Environment‑based configuration

## Quick Start (Demo Mode)
Great for trying the app without OAuth/MySQL setup.
1. Node 18.x recommended (nvm use 18)
2. Install: `npm install`
3. Start: `npm start`
4. Open http://localhost:3000 and click “Try Demo Mode”

Notes:
- SQL execution uses real SQLite database - no external database setup required!
- All SQL queries are executed against the actual database

## Full Setup
### 1) SQLite Database (Automatic)
- No setup required! The app uses a built-in SQLite database
- All sample data is automatically loaded
- Real SQL queries are executed against the database

### 2) Google OAuth (optional, for persistent progress)

### 2) Google OAuth (optional, for persistent progress)
- Create OAuth credentials (Google Cloud Console)
- Set redirect URI: `http://localhost:3000/auth/google/callback`
- Add client ID/secret into `.env` (see below)

### 3) Install & Run
```
npm install
npm start
```
Visit http://localhost:3000. If MySQL isn’t configured yet, use the Setup card in the app (or set MYSQL_* in `.env`).

## Configuration (.env)
```
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Express Session
SESSION_SECRET=change_me

# App
NODE_ENV=development

# Note: No MySQL configuration needed - using SQLite database
# Note: PORT is set automatically by Vercel in production
```

## Project Structure
```
server.js                 # Express server, APIs, auth, SPA fallback
index.html                # Single page app shell
src/js/app.js             # Practice gameplay (levels, queries)
src/js/gameState.js       # Local game state & progress
src/js/auth.js            # Auth flows, UI gates, demo
src/js/router.js          # Client-side router (History API)
src/js/gameRouter.js      # Game <-> Blog view toggling
src/js/blog.js            # Theory hub & quizzes
src/css/styles.css        # Core styles (responsive, auth, game)
src/css/blog.css          # Blog/theory styles
src/data/*.js             # Level sets & theory content
prompts/*.md              # Prompt engineering for content generation
scripts/validate_content.js # Schema/authenticity validator for content JSON
```

## How It Works
- SQLite database provides sample data for SQL queries. Your SQL queries run against it.
- SQLite stores user data: users, progress, streaks, missions, quests, reflections.
- SPA routing uses the History API with explicit server fallback for deep links.
- Gated content: Practice levels require auth (Google or Demo). Theory/Quizzes are accessible without login if desired.

## Routes
Client (SPA)
- Practice
  - `/` → practice home (level selector)
  - `/mode/11` → Essentials
  - `/mode/23` → Complete
  - `/level/:mode/:level/:q` → specific question view
- Theory
  - `/blog` → Theory Hub (Practice tab active by default)
  - `/blog/topic/:topicId` → Topic with auto-open embedded quiz
  - `/blog/quiz/:quizId` → Auto-start quiz

Server
- `/auth/google`, `/auth/google/callback`
- `/auth/demo`
- `/execute-query` (POST)
- `/api/user/*` (profile, stats, progress)
- `/api/daily-missions`, `/api/weekly-quest`, `/api/streak-recovery`, `/api/daily-reflection`
- SPA fallback serves `index.html` for non‑API paths (e.g., `/game`, `/mode/*`, `/blog/*`)

## API (server)
- POST `/execute-query`
  - Body: `{ query: string, expectedQuery?: string }`
  - Allows: `SELECT`, `WITH (CTE)`, `EXPLAIN`, `SHOW`, `DESC/DESCRIBE`, `INSERT`, `UPDATE`, `DELETE`, `CREATE (VIEW/INDEX/TABLE/TEMPORARY TABLE)`, `ALTER TABLE`, `DROP (VIEW/INDEX)`
  - Returns: `{ success, results, rowCount, comparison? }`
  - If the expected query cannot run, comparison is omitted (no warning shown).
- GET `/api/user/stats` → `{ completed_questions, total_xp, current_streak, max_streak, streak_shields, level }`
- GET/POST `/api/user/progress` → read/record progress with XP updates

## Authentic Knowledge Rule
We verify and label knowledge to maintain trust:
- SQL correctness is verified by executing the learner’s query and comparing to a canonical solution result set (when available). If canonical execution isn’t available, we suppress comparison instead of showing noisy warnings.
- Theory/quiz content requires either `verified: true` or a list of reputable `sources: [{ name }]` metadata before broad surfacing.
- Use the validator to check content: `npm run validate-content path/to/content.json`

## Content Prompts & Validation
- Prompts live in `prompts/` and are research‑driven (GFG interview experiences, paths, TUF+, reputable references). They define structured outputs for levels, theory, quizzes, and optional practice tasks.
- Validate generated JSON with `scripts/validate_content.js`:
```
npm run validate-content path/to/file.json
```
The validator checks schema and the authenticity metadata for quizzes.

## Troubleshooting
- Node & sqlite3 build
  - Use Node 18.x. On Apple Silicon: `npm rebuild sqlite3` if you hit ABI/arch errors.
- MySQL connection
  - Verify credentials in `.env` and try `/test-connection` in the browser. Use the in‑app Setup card if needed.
- Port 3000 in use
  - The server auto‑kills conflicting processes on start. If it fails, free the port manually and retry.
- “Levels locked” when logged out
  - Practice levels require auth. Use Demo Mode (no account) to unlock. Theory hub is available without login.
- “Welcome back” showing on every reload
  - We only show the welcome animation on successful Google login via `?welcome=1` and strip the flag immediately after.
- DDL blocked
  - Dangerous DDL (`DROP TABLE`, `TRUNCATE`) is intentionally blocked. Views/indices and table creation are allowed.

## Contributing & License
- Issues and PRs welcome. Keep changes focused and minimal.
- Follow existing code style; do not introduce new frameworks without discussion.
- This project is MIT licensed unless otherwise stated.

Happy querying! 🎯

## 📈 Analytics & Metrics

The platform tracks:
- User engagement (session time, return rate)
- Learning progress (completion rate, difficulty progression)
- Gamification effectiveness (streak maintenance, XP progression)
- Feature usage (hint usage, mission completion, reflection participation)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Gamification Design**: Inspired by Duolingo, Khan Academy, and modern learning platforms
- **UI/UX**: Modern glassmorphism trends with smooth gradients
- **Learning Theory**: Spaced repetition algorithms and habit formation research

---

**Ready to Master SQL? Start your quest today!** 🚀
## 🔎 Authentic Knowledge Rule

To maintain content integrity and learner trust across all learning modes:

### SQL Practice Verification
- **Canonical Execution**: SQL challenges are verified by comparing learner query results with expected solution results on actual database
- **Real-time Validation**: Server executes both queries and compares outputs for exact matching
- **Authenticity Indicators**: UI displays "🔎 Verified by canonical execution" when results match perfectly

### Theory Content Verification  
- **Source Authority**: All DBMS theory topics must reference GeeksforGeeks as authoritative source
- **Verification Flags**: Content marked `verified: true` with `sources: []` metadata including reputable references
- **Reference Links**: Direct links to GeeksforGeeks articles for learner verification
- **Content Alignment**: Definitions and examples must match authoritative sources exactly

### Multi-Domain Content Standards
- **Theory/MCQ Content**: CN/OS/OOP/LLD/HLD/Aptitude domains require `verified: true` or reputable `sources: []` metadata
- **Validation Pipeline**: `npm run validate-content <content.json>` enforces verification standards
- **Transparent Sourcing**: All theoretical claims must be traceable to authoritative educational sources

### Implementation
- **DBMS Theory Hub**: Interactive theory pages with embedded GeeksforGeeks references
- **Quiz Verification**: Theory-based quizzes include source attribution and verification badges  
- **Practice Integration**: SQL levels combine verified theory concepts with hands-on query execution
- **Content Integrity**: System prevents unverified knowledge from being presented as authoritative

This comprehensive rule ensures learners receive accurate, trustworthy information across both theoretical understanding and practical SQL skills, with clear verification indicators and transparent sourcing throughout the learning experience.
