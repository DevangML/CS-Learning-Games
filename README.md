# 🎮 SQL Mastery Quest

An interactive SQL learning platform with **gamification**, **real-time MySQL execution**, and **smooth user experience**. Master SQL from basics to advanced concepts through daily missions, streak systems, and XP progression!

## ✨ Features

### 🎯 **Gamification System**
- **XP & Level Progression**: Earn XP based on difficulty and performance
- **Daily Streaks**: Build habits with streak shields (7 clean days = 1 shield)
- **Daily Missions**: 3 AI-generated missions using spaced repetition
- **Weekly Quests**: Complete 12 missions per week for bonus rewards
- **Variable Rewards**: 20% chance for insight cards, bonus quiz, or shield fragments
- **Streak Recovery**: Comeback quest to restore broken streaks (5 missions in 48h)
- **Session Management**: Full XP for 25min → 50% XP until 40min → 0% after
- **Fail-Fast Hints**: Auto-reveal hints after 2 wrong answers

### 📚 **Learning Features**
- **Dual Learning Paths**: Choose Essentials (11 levels) or Complete (23 levels)
- **Real MySQL Execution**: Execute queries against live database
- **Progressive Difficulty**: Beginner → Intermediate → Advanced → Expert
- **Spaced Repetition**: SM-2-lite algorithm for optimal retention
- **Interactive Schema**: Visual database structure with relationships
- **Concept Explanations**: Built-in tutorials for each topic

### 🎨 **Smooth User Experience**
- **Animated Gradients**: Dynamic background with 15s color shifting
- **Onboarding Tour**: 4-step interactive introduction for new users
- **Frictionless Auth**: Google OAuth + Demo mode for instant access
- **Glassmorphism Design**: Modern UI with backdrop-filter blur effects
- **Micro-interactions**: Smooth animations on hover, click, and transitions
- **Responsive Design**: Works perfectly on desktop and mobile
- **Authentic Knowledge Rule**: Verification badges and checks for answers

### 🛡️ **User Management**
- **Google OAuth**: Secure authentication with progress sync
- **SQLite Storage**: User progress, streaks, and achievements
- **MySQL Auto-Setup**: Guided database configuration
- **Daily Reflections**: End-of-session learning takeaways
- **Progress Tracking**: Persistent stats across sessions

## 🚀 Quick Start

### Option 1: Demo Mode (Instant Access)
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open http://localhost:3000
5. Click **"🎮 Try Demo Mode"** to start immediately!

### Option 2: Full Setup (Google OAuth + MySQL)

#### 1. **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret to `.env` file

#### 2. **MySQL Setup**
```bash
# Install MySQL (macOS)
brew install mysql
brew services start mysql

# Create database and user
mysql -u root -p
CREATE DATABASE sql_tutor;
CREATE USER 'sql_tutor_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON sql_tutor.* TO 'sql_tutor_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. **Environment Configuration**
Create `.env` file:
```bash
# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Session Secret (use a strong random string)
SESSION_SECRET=sql-mastery-quest-super-secret-key-2024

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=sql_tutor_user
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=sql_tutor

# Application
PORT=3000
NODE_ENV=development
```

#### 4. **Start the Application**
```bash
npm install
npm start
```

The server will automatically:
- Create SQLite user database with gamification tables
- Connect to MySQL and create tutorial tables
- Populate sample data for learning
- Start on http://localhost:3000

## 📊 Architecture

### **Backend (Node.js + Express)**
- `server.js`: Main application with authentication and APIs
- **SQLite**: User data, progress, streaks, missions, reflections
- **MySQL**: Tutorial database for SQL execution
- **Passport.js**: Google OAuth authentication
- **Express Session**: 30-day persistent sessions

### **Frontend (Vanilla JS + Modern CSS)**
- `src/js/auth.js`: Authentication and user management
- `src/js/app.js`: Main application logic and SQL execution
- `src/js/gameState.js`: Local progress tracking
- `src/js/onboarding.js`: Interactive user onboarding
- `src/css/styles.css`: Modern UI with gradients and animations
- `src/data/`: Learning levels and tutorial content

### **Database Schema**
```sql
-- User Management (SQLite)
users (id, google_id, name, email, total_xp, level, current_streak, max_streak, streak_shields)
user_progress (user_id, level_id, question_id, completed, xp_earned, hints_used)
daily_missions (user_id, mission_date, question_1_id, question_2_id, question_3_id, completed_count)
weekly_quests (user_id, week_start, missions_target, missions_completed, completed, reward_claimed)
streak_recovery (user_id, broken_streak, recovery_deadline, recovery_missions_completed)
daily_reflections (user_id, reflection_date, takeaway)
spaced_repetition (user_id, level_id, question_id, quality, ease_factor, interval_days, due_date)

-- Tutorial Content (MySQL)
employees, departments, projects, employee_projects, logs, weather, activity
```

## 🎮 Gamification Rules

### **XP System**
- Base XP: 10 points per correct answer
- Difficulty multipliers: Beginner (1x), Intermediate (2x), Advanced (3x)
- Level formula: `level = floor(0.1 * sqrt(total_xp)) + 1`
- Hint penalty: 20% XP reduction per hint used

### **Daily Streaks**
- Increment: Today = last_login + 1 day
- Shield protection: 1-2 day gaps with shields don't break streak
- Shield earning: 1 shield per 7 clean days (max 1 shield)
- Recovery: 5 missions within 48h restores half streak (once per 30 days)

### **Session Management**
- **0-25 minutes**: Full XP (100%)
- **25-40 minutes**: Reduced XP (50%)
- **40+ minutes**: No XP (0%) + "Done for today" message

### **Weekly Quests**
- Fixed window: Monday-Sunday
- Target: Complete 12 missions per week
- Reward: 1 streak shield OR 200 XP (random)
- No carryover between weeks

## 🚢 Deployment

### **Railway (Recommended)**
1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### **Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Create app
heroku create sql-mastery-quest

# Add environment variables
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set SESSION_SECRET=your_secret

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Deploy
git push heroku main
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

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
