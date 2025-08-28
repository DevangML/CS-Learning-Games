# CN Mastery Quest

An interactive, browser‑based Computer Networks learning game. Practice CN concepts through interactive challenges, progress through curated levels, and reinforce learning with a theory hub and quizzes. Built with Node.js + Express, vanilla JS, and SQLite for data persistence.

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
CN Mastery Quest blends hands‑on Computer Networks learning with gamified progression and spaced repetition.
- Practice Flow: Essentials (11 levels) or Complete (23 levels) of CN challenges with interactive simulations.
- Theory Flow: A theory hub with topic pages and auto‑starting practice quizzes.
- Persistence: User progress, streaks, missions, and rewards stored in SQLite.
- Authentication: Google OAuth or frictionless Demo Mode.

## Features
- Gameplay
  - Dual paths: Essentials (11) and Complete (23)
  - Interactive CN simulations and protocol demonstrations
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
  - SQLite for user data and CN topic content
  - Google OAuth + Demo Mode
  - Environment‑based configuration

## Quick Start (Demo Mode)
Great for trying the app without OAuth setup.
1. Node 18.x recommended (nvm use 18)
2. Install: `npm install`
3. Start: `npm start`
4. Open http://localhost:3000 and click “Try Demo Mode”

Notes:
- Full functionality available in Demo Mode for exploring UI, theory hub, and interactive simulations.

## Full Setup
### 1) Database Setup
- SQLite database is automatically configured
- No manual database setup required

### 2) Google OAuth (optional, for persistent progress)
- Create OAuth credentials (Google Cloud Console)
- Set redirect URI: `http://localhost:3000/auth/google/callback`
- Add client ID/secret into `.env` (see below)

### 3) Install & Run
```
npm install
npm start
```
Visit http://localhost:3000. Database is automatically initialized on first run.

## Configuration (.env)
```
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Express Session
SESSION_SECRET=change_me

# Database Configuration
DATABASE_PATH=./user_data.db

# App
PORT=3000
NODE_ENV=development
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
- SQLite database stores all data: users, progress, streaks, missions, quests, reflections, and CN content.
- SPA routing uses the History API with explicit server fallback for deep links.
- Gated content: Practice levels require auth (Google or Demo). Theory/Quizzes are accessible without login if desired.

## Routes
Client (SPA)
- Practice
  - `/` → practice home (level selector)
  - `/mode/11` → Essentials
  - `/mode/23` → Complete
  - `/level/:mode/:level/:q` → specific question view
  - `/setup` → Database setup card
- Theory
  - `/blog` → Theory Hub (Practice tab active by default)
  - `/blog/topic/:topicId` → Topic with auto-open embedded quiz
  - `/blog/quiz/:quizId` → Auto-start quiz

Server
- `/auth/google`, `/auth/google/callback`
- `/auth/demo`
- `/simulate-network` (POST)
- `/api/user/*` (profile, stats, progress)
- `/api/daily-missions`, `/api/weekly-quest`, `/api/streak-recovery`, `/api/daily-reflection`
- SPA fallback serves `index.html` for non‑API paths (e.g., `/game`, `/mode/*`, `/blog/*`)

## API (server)
- POST `/simulate-network`
  - Body: `{ scenario: string, configuration: object }`
  - Allows: Network topology setup, protocol simulation, packet tracing
  - Returns: `{ success, results, metrics, visualization? }`
  - Interactive network simulations with real-time feedback.
- GET `/api/user/stats` → `{ completed_questions, total_xp, current_streak, max_streak, streak_shields, level }`
- GET/POST `/api/user/progress` → read/record progress with XP updates

## Authentic Knowledge Rule
We verify and label knowledge to maintain trust:
- CN concepts are verified through interactive simulations and protocol demonstrations.
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
- Database connection
  - SQLite database is created automatically. Check file permissions if issues occur.
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

**Ready to Master Computer Networks? Start your quest today!** 🚀
## 🔎 Authentic Knowledge Rule

To maintain content integrity and learner trust across all learning modes:

### CN Practice Verification
- **Interactive Simulations**: CN challenges are verified through network protocol simulations and topology demonstrations
- **Real-time Validation**: Server validates network configurations and protocol implementations
- **Authenticity Indicators**: UI displays "🔎 Verified by simulation execution" when configurations work correctly

### Theory Content Verification  
- **Source Authority**: All CN theory topics must reference authoritative networking sources
- **Verification Flags**: Content marked `verified: true` with `sources: []` metadata including reputable references
- **Reference Links**: Direct links to authoritative networking resources for learner verification
- **Content Alignment**: Definitions and examples must match authoritative sources exactly

### Multi-Domain Content Standards
- **Theory/MCQ Content**: CN/OS/OOP/LLD/HLD/Aptitude domains require `verified: true` or reputable `sources: []` metadata
- **Validation Pipeline**: `npm run validate-content <content.json>` enforces verification standards
- **Transparent Sourcing**: All theoretical claims must be traceable to authoritative educational sources

### Implementation
- **CN Theory Hub**: Interactive theory pages with embedded networking references
- **Quiz Verification**: Theory-based quizzes include source attribution and verification badges  
- **Practice Integration**: CN levels combine verified theory concepts with hands-on network simulations
- **Content Integrity**: System prevents unverified knowledge from being presented as authoritative

This comprehensive rule ensures learners receive accurate, trustworthy information across both theoretical understanding and practical CN skills, with clear verification indicators and transparent sourcing throughout the learning experience.