const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const sqliteDB = require('./sqlite-db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database for user data
const userDb = new sqlite3.Database('./user_data.db');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sql-mastery-quest-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists in SQLite
        const user = await getUserById(profile.id);
        if (user) {
            // Update last login
            await updateUserLogin(profile.id);
            return done(null, user);
        } else {
            // Create new user
            const newUser = await createUser({
                google_id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            });
            return done(null, newUser);
        }
    } catch (error) {
        return done(error, null);
    }
}));

    passport.serializeUser((user, done) => {
        done(null, user.google_id);
    });

    passport.deserializeUser(async (google_id, done) => {
        try {
            const user = await getUserById(google_id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
} else {
    console.log('⚠️  Google OAuth credentials not found. Authentication will be disabled.');
}

// Removed mysqlConnection variable - now using dbPool

// Initialize SQLite tables for user data and gamification
const initUserDatabase = () => {
    return new Promise((resolve, reject) => {
        userDb.serialize(() => {
            // Users table
            userDb.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                google_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                avatar TEXT,
                total_xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                current_streak INTEGER DEFAULT 0,
                max_streak INTEGER DEFAULT 0,
                last_login DATE,
                streak_shields INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // User progress table
            userDb.run(`CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                level_id INTEGER,
                question_id INTEGER,
                completed BOOLEAN DEFAULT FALSE,
                attempts INTEGER DEFAULT 0,
                hints_used INTEGER DEFAULT 0,
                xp_earned INTEGER DEFAULT 0,
                completed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Daily missions table
            userDb.run(`CREATE TABLE IF NOT EXISTS daily_missions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                mission_date DATE,
                question_1_id INTEGER,
                question_2_id INTEGER,
                question_3_id INTEGER,
                completed_count INTEGER DEFAULT 0,
                locked_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Spaced repetition table
            userDb.run(`CREATE TABLE IF NOT EXISTS spaced_repetition (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                level_id INTEGER,
                question_id INTEGER,
                quality INTEGER DEFAULT 0,
                repetitions INTEGER DEFAULT 0,
                ease_factor REAL DEFAULT 2.5,
                interval_days INTEGER DEFAULT 1,
                due_date DATE,
                last_reviewed DATE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // User sessions table (for session tracking)
            userDb.run(`CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_start DATETIME,
                session_end DATETIME,
                xp_earned INTEGER DEFAULT 0,
                questions_completed INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Weekly quests table
            userDb.run(`CREATE TABLE IF NOT EXISTS weekly_quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                week_start DATE,
                missions_target INTEGER DEFAULT 12,
                missions_completed INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                reward_claimed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // User insights/rewards table
            userDb.run(`CREATE TABLE IF NOT EXISTS user_rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                reward_type TEXT, -- 'insight_card', 'bonus_quiz', 'shield_fragment'
                content TEXT,
                earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                used BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Daily reflections table
            userDb.run(`CREATE TABLE IF NOT EXISTS daily_reflections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                reflection_date DATE,
                takeaway TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            // Streak recovery table
            userDb.run(`CREATE TABLE IF NOT EXISTS streak_recovery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                broken_streak INTEGER,
                recovery_deadline DATE,
                recovery_missions_needed INTEGER DEFAULT 5,
                recovery_missions_completed INTEGER DEFAULT 0,
                recovery_used BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            console.log('User database initialized successfully');
            resolve();
        });
    });
};

// User database helper functions
const getUserById = (google_id) => {
    return new Promise((resolve, reject) => {
        userDb.get('SELECT * FROM users WHERE google_id = ?', [google_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const createUser = (userData) => {
    return new Promise((resolve, reject) => {
        const { google_id, name, email, avatar } = userData;
        const today = new Date().toISOString().split('T')[0];
        
        userDb.run(
            'INSERT INTO users (google_id, name, email, avatar, last_login) VALUES (?, ?, ?, ?, ?)',
            [google_id, name, email, avatar, today],
            function(err) {
                if (err) reject(err);
                else {
                    getUserById(google_id).then(resolve).catch(reject);
                }
            }
        );
    });
};

const updateUserLogin = (google_id) => {
    return new Promise((resolve, reject) => {
        const today = new Date().toISOString().split('T')[0];
        
        userDb.get('SELECT last_login, current_streak, streak_shields FROM users WHERE google_id = ?', [google_id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            let newStreak = row.current_streak;
            let newShields = row.streak_shields;
            
            if (row.last_login) {
                const lastLogin = new Date(row.last_login);
                const todayDate = new Date(today);
                const daysDiff = Math.floor((todayDate - lastLogin) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    // Consecutive day - increment streak
                    newStreak += 1;
                    
                    // Award streak shield every 7 clean days (max 1)
                    if (newStreak % 7 === 0 && newShields < 1) {
                        newShields += 1;
                    }
                } else if (daysDiff > 2) {
                    // Break streak if gap > 2 days and no shields
                    if (newShields > 0) {
                        // Use shield to protect streak
                        newShields -= 1;
                    } else {
                        // Streak broken - offer recovery if eligible
                        const brokenStreak = newStreak;
                        if (brokenStreak >= 7) {
                            createStreakRecovery(google_id, brokenStreak);
                        }
                        newStreak = 1; // Reset to 1 for today's login
                    }
                } else if (daysDiff === 0) {
                    // Same day login - no change
                } else {
                    // daysDiff === 2 - within grace period if has shield
                    if (newShields === 0) {
                        const brokenStreak = newStreak;
                        if (brokenStreak >= 7) {
                            createStreakRecovery(google_id, brokenStreak);
                        }
                        newStreak = 1; // Reset without shield protection
                    }
                    // With shield, streak continues
                }
            } else {
                newStreak = 1; // First login
            }
            
            userDb.run(
                'UPDATE users SET last_login = ?, current_streak = ?, max_streak = MAX(max_streak, ?), streak_shields = ?, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?',
                [today, newStreak, newStreak, newShields, google_id],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });
};

// Streak recovery helper function
const createStreakRecovery = (google_id, brokenStreak) => {
    const recoveryDeadline = new Date();
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 2); // 48 hours
    
    // Check if user used recovery in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    userDb.get(
        'SELECT * FROM streak_recovery WHERE user_id = (SELECT id FROM users WHERE google_id = ?) AND created_at > ? AND recovery_used = 1',
        [google_id, thirtyDaysAgo.toISOString()],
        (err, existing) => {
            if (!existing) {
                // User eligible for recovery
                userDb.run(
                    'INSERT INTO streak_recovery (user_id, broken_streak, recovery_deadline) VALUES ((SELECT id FROM users WHERE google_id = ?), ?, ?)',
                    [google_id, brokenStreak, recoveryDeadline.toISOString().split('T')[0]]
                );
            }
        }
    );
};

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

// SQLite database connection
let dbPool;

const connectDatabase = async () => {
    try {
        console.log('🗄️  Initializing SQLite database...');
        dbPool = sqliteDB.createPool();
        console.log('✅ SQLite database initialized successfully');
    } catch (error) {
        console.error('❌ SQLite database initialization failed:', error.message);
        throw error;
    }
};

// Authentication routes
app.get('/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

app.get('/auth/google/callback', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.redirect('/?error=oauth_not_configured');
    }
    passport.authenticate('google', { failureRedirect: '/login-failed' })(req, res, () => {
        // Redirect with a one-time flag to show welcome animation
        res.redirect('/?welcome=1');
    });
});

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

app.post('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Demo mode endpoint for testing without OAuth
app.post('/auth/demo', async (req, res) => {
    try {
        // Create or get demo user
        let demoUser = await getUserById('demo_user_123');
        
        if (!demoUser) {
            demoUser = await createUser({
                google_id: 'demo_user_123',
                name: 'Demo User',
                email: 'demo@sqlquest.com',
                avatar: 'https://via.placeholder.com/40'
            });
        }
        
        // Simulate login
        req.login(demoUser, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Demo login failed' });
            }
            res.json({ user: demoUser, message: 'Demo mode activated' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Demo setup failed' });
    }
});

// Virtual database is automatically initialized with all required tables and data

// Gamification API endpoints
app.get('/api/user/profile', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/user/stats', requireAuth, (req, res) => {
    const userId = req.user.id;
    
    userDb.all(`
        SELECT 
            (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1) as completed_questions,
            (SELECT total_xp FROM users WHERE id = ?) as total_xp,
            (SELECT current_streak FROM users WHERE id = ?) as current_streak,
            (SELECT max_streak FROM users WHERE id = ?) as max_streak,
            (SELECT streak_shields FROM users WHERE id = ?) as streak_shields,
            (SELECT level FROM users WHERE id = ?) as level
    `, [userId, userId, userId, userId, userId, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows[0] || {});
    });
});

// Get user progress
app.get('/api/user/progress', requireAuth, (req, res) => {
    const userId = req.user.id;
    
    userDb.all(
        'SELECT level_id, question_id, completed, xp_earned, hints_used, completed_at FROM user_progress WHERE user_id = ? ORDER BY level_id, question_id',
        [userId],
        (err, progress) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ progress: progress || [] });
        }
    );
});

app.post('/api/user/progress', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { level_id, question_id, completed, xp_earned, hints_used } = req.body;
    
    try {
        // Check if progress exists
        const existingProgress = await new Promise((resolve, reject) => {
            userDb.get(
                'SELECT * FROM user_progress WHERE user_id = ? AND level_id = ? AND question_id = ?',
                [userId, level_id, question_id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
        
        if (existingProgress) {
            // Update existing progress
            userDb.run(
                'UPDATE user_progress SET completed = ?, attempts = attempts + 1, hints_used = hints_used + ?, xp_earned = xp_earned + ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?',
                [completed, hints_used, xp_earned, completed, existingProgress.id],
                async function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    // After update, refresh and return user totals
                    await updateAndReturnUserTotals(userId, completed, xp_earned, res);
                }
            );
        } else {
            // Create new progress entry
            userDb.run(
                'INSERT INTO user_progress (user_id, level_id, question_id, completed, attempts, hints_used, xp_earned, completed_at) VALUES (?, ?, ?, ?, 1, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)',
                [userId, level_id, question_id, completed, hints_used, xp_earned, completed],
                async function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    // After insert, refresh and return user totals
                    await updateAndReturnUserTotals(userId, completed, xp_earned, res);
                }
            );
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper to update user totals and respond consistently
const updateAndReturnUserTotals = (userId, completed, xp_earned, res) => {
    return new Promise((resolve) => {
        // If the action earned XP, increment user's total and update level
        if (completed && xp_earned > 0) {
            userDb.run(
                'UPDATE users SET total_xp = total_xp + ?, level = CAST(0.1 * SQRT(total_xp + ?) + 1 AS INTEGER), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [xp_earned, xp_earned, userId],
                (/* err */) => {
                    // Regardless of update error, try to fetch fresh stats to return
                    userDb.get('SELECT total_xp, level FROM users WHERE id = ?', [userId], (e2, row) => {
                        if (e2 || !row) {
                            res.json({ success: true });
                            return resolve();
                        }
                        res.json({ success: true, total_xp: row.total_xp, level: row.level });
                        resolve();
                    });
                }
            );
        } else {
            // No XP change; still return current totals for consistency
            userDb.get('SELECT total_xp, level FROM users WHERE id = ?', [userId], (e2, row) => {
                if (e2 || !row) {
                    res.json({ success: true });
                    return resolve();
                }
                res.json({ success: true, total_xp: row.total_xp, level: row.level });
                resolve();
            });
        }
    });
};

// Weekly quest API
app.get('/api/weekly-quest', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    userDb.get(
        'SELECT * FROM weekly_quests WHERE user_id = ? AND week_start = ?',
        [userId, weekStart],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                // Create new weekly quest
                userDb.run(
                    'INSERT INTO weekly_quests (user_id, week_start, missions_target, missions_completed) VALUES (?, ?, 12, 0)',
                    [userId, weekStart],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({
                            id: this.lastID,
                            user_id: userId,
                            week_start: weekStart,
                            missions_target: 12,
                            missions_completed: 0,
                            completed: false,
                            reward_claimed: false
                        });
                    }
                );
            } else {
                res.json(row);
            }
        }
    );
});

app.post('/api/weekly-quest/complete', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    userDb.run(
        'UPDATE weekly_quests SET missions_completed = missions_completed + 1, completed = CASE WHEN missions_completed + 1 >= missions_target THEN 1 ELSE 0 END WHERE user_id = ? AND week_start = ?',
        [userId, weekStart],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Check if quest completed and award reward
            userDb.get(
                'SELECT * FROM weekly_quests WHERE user_id = ? AND week_start = ? AND completed = 1 AND reward_claimed = 0',
                [userId, weekStart],
                (err, quest) => {
                    if (quest) {
                        // Award weekly reward: 1 shield or 200 XP
                        const rewardType = Math.random() < 0.5 ? 'shield' : 'xp';
                        
                        if (rewardType === 'shield') {
                            userDb.run('UPDATE users SET streak_shields = streak_shields + 1 WHERE id = ?', [userId]);
                        } else {
                            userDb.run('UPDATE users SET total_xp = total_xp + 200, level = CAST(0.1 * SQRT(total_xp + 200) + 1 AS INTEGER) WHERE id = ?', [userId]);
                        }
                        
                        // Mark reward as claimed
                        userDb.run('UPDATE weekly_quests SET reward_claimed = 1 WHERE id = ?', [quest.id]);
                        
                        res.json({ 
                            success: true, 
                            completed: true, 
                            reward: rewardType === 'shield' ? '1 Streak Shield' : '200 XP',
                            message: 'Weekly quest completed!' 
                        });
                    } else {
                        res.json({ success: true, completed: false });
                    }
                }
            );
        }
    );
});

// Daily missions API
app.get('/api/daily-missions', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    userDb.get(
        'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
        [userId, today],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                // Generate new daily missions using spaced repetition
                generateDailyMissions(userId, today)
                    .then(missions => res.json(missions))
                    .catch(error => res.status(500).json({ error: error.message }));
            } else {
                res.json(row);
            }
        }
    );
});

// Complete a daily mission
app.post('/api/daily-missions/complete', requireAuth, (req, res) => {
    const userId = req.user.id;
    const { level_id, question_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's missions
    userDb.get(
        'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
        [userId, today],
        (err, missions) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!missions) {
                return res.status(404).json({ error: 'No missions found for today' });
            }
            
            const questionKey = `${level_id}-${question_id}`;
            let newCompletedCount = missions.completed_count;
            
            // Check which mission this question belongs to and mark as complete
            if (missions.question_1_id === questionKey && missions.completed_count < 1) {
                newCompletedCount = 1;
            } else if (missions.question_2_id === questionKey && missions.completed_count < 2) {
                newCompletedCount = 2;
            } else if (missions.question_3_id === questionKey && missions.completed_count < 3) {
                newCompletedCount = 3;
            }
            
            if (newCompletedCount > missions.completed_count) {
                // Update mission progress
                userDb.run(
                    'UPDATE daily_missions SET completed_count = ? WHERE user_id = ? AND mission_date = ?',
                    [newCompletedCount, userId, today],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        
                        // Also update weekly quest progress
                        const today = new Date();
                        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()).toISOString().split('T')[0];
                        userDb.run(
                            'UPDATE weekly_quests SET missions_completed = missions_completed + 1, completed = CASE WHEN missions_completed + 1 >= missions_target THEN 1 ELSE 0 END WHERE user_id = ? AND week_start = ?',
                            [userId, weekStart],
                            (err) => {
                                if (err) {
                                    console.error('Failed to update weekly quest:', err);
                                }
                                res.json({ success: true, completed_count: newCompletedCount });
                            }
                        );
                    }
                );
            } else {
                res.json({ success: true, completed_count: missions.completed_count });
            }
        }
    );
});

const generateDailyMissions = async (userId, date) => {
    return new Promise((resolve, reject) => {
        // Get questions due for review or random questions if none due
        userDb.all(`
            SELECT sr.level_id, sr.question_id, sr.due_date
            FROM spaced_repetition sr
            WHERE sr.user_id = ? AND sr.due_date <= ?
            ORDER BY sr.due_date ASC, RANDOM()
            LIMIT 3
        `, [userId, date], (err, dueQuestions) => {
            if (err) {
                reject(err);
                return;
            }
            
            // If we don't have 3 due questions, fill with random ones
            if (dueQuestions.length < 3) {
                const remainingCount = 3 - dueQuestions.length;
                const excludeIds = dueQuestions.map(q => `${q.level_id}-${q.question_id}`).join(',');
                
                // For simplicity, use random level/question combinations
                // In practice, you'd want to use your actual question database
                const randomQuestions = [];
                for (let i = 0; i < remainingCount; i++) {
                    randomQuestions.push({
                        level_id: Math.floor(Math.random() * 11) + 1, // 1-11 for essentials
                        question_id: Math.floor(Math.random() * 4)      // 0-3 for questions per level
                    });
                }
                dueQuestions.push(...randomQuestions);
            }
            
            // Create daily mission record
            const missions = dueQuestions.slice(0, 3);
            userDb.run(
                'INSERT INTO daily_missions (user_id, mission_date, question_1_id, question_2_id, question_3_id) VALUES (?, ?, ?, ?, ?)',
                [userId, date, 
                 `${missions[0].level_id}-${missions[0].question_id}`,
                 `${missions[1].level_id}-${missions[1].question_id}`,
                 `${missions[2].level_id}-${missions[2].question_id}`],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            user_id: userId,
                            mission_date: date,
                            question_1_id: `${missions[0].level_id}-${missions[0].question_id}`,
                            question_2_id: `${missions[1].level_id}-${missions[1].question_id}`,
                            question_3_id: `${missions[2].level_id}-${missions[2].question_id}`,
                            completed_count: 0,
                            locked_at: null
                        });
                    }
                }
            );
        });
    });
};

// Streak recovery API
app.get('/api/streak-recovery', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    userDb.get(
        'SELECT * FROM streak_recovery WHERE user_id = ? AND recovery_deadline >= ? AND recovery_used = 0 ORDER BY created_at DESC LIMIT 1',
        [userId, today],
        (err, recovery) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(recovery || null);
        }
    );
});

app.post('/api/streak-recovery/mission', requireAuth, (req, res) => {
    const userId = req.user.id;
    
    userDb.run(
        'UPDATE streak_recovery SET recovery_missions_completed = recovery_missions_completed + 1 WHERE user_id = ? AND recovery_used = 0 AND recovery_deadline >= date("now")',
        [userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Check if recovery completed (5 missions)
            userDb.get(
                'SELECT * FROM streak_recovery WHERE user_id = ? AND recovery_missions_completed >= 5 AND recovery_used = 0',
                [userId],
                (err, recovery) => {
                    if (recovery) {
                        // Restore half the streak (rounded down)
                        const restoredStreak = Math.floor(recovery.broken_streak / 2);
                        
                        userDb.run(
                            'UPDATE users SET current_streak = ? WHERE id = ?',
                            [restoredStreak, userId]
                        );
                        
                        userDb.run(
                            'UPDATE streak_recovery SET recovery_used = 1 WHERE id = ?',
                            [recovery.id]
                        );
                        
                        res.json({
                            success: true,
                            completed: true,
                            restored_streak: restoredStreak,
                            message: `Streak recovered! Your ${recovery.broken_streak}-day streak has been restored to ${restoredStreak} days.`
                        });
                    } else {
                        res.json({ success: true, completed: false });
                    }
                }
            );
        }
    );
});

// Daily reflection API
app.get('/api/daily-reflection', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    userDb.get(
        'SELECT * FROM daily_reflections WHERE user_id = ? AND reflection_date = ?',
        [userId, today],
        (err, reflection) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(reflection || null);
        }
    );
});

app.post('/api/daily-reflection', requireAuth, (req, res) => {
    const userId = req.user.id;
    const { takeaway } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (!takeaway || takeaway.trim().length === 0) {
        return res.status(400).json({ error: 'Takeaway is required' });
    }
    
    userDb.run(
        'INSERT OR REPLACE INTO daily_reflections (user_id, reflection_date, takeaway) VALUES (?, ?, ?)',
        [userId, today, takeaway.trim()],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Daily reflection saved!' });
        }
    );
});

app.get('/api/weekly-recap', requireAuth, (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    userDb.all(
        'SELECT * FROM daily_reflections WHERE user_id = ? AND reflection_date >= ? ORDER BY reflection_date DESC',
        [userId, weekAgo.toISOString().split('T')[0]],
        (err, reflections) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(reflections);
        }
    );
});

// Execute SQL query with gamification
app.post('/execute-query', requireAuth, async (req, res) => {
    try {
        const { query, expectedQuery } = req.body;
        
        if (!dbPool) {
            return res.status(500).json({ error: 'SQLite database not initialized.' });
        }
        
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        const sanitizedQuery = query.trim();
        
        // Allow common DQL/DML/DDL for learning (safe subset)
        // Notes:
        // - DDL destructive ops like DROP TABLE/TRUNCATE are limited to avoid blowing away seed tables
        // - We do allow DROP VIEW/INDEX as they are reversible
        const ql = sanitizedQuery.toLowerCase();
        const allowedPatterns = [
            /^select\b/,
            /^with\b/,              // CTEs
            /^explain\b/,
            /^show\b/,
            /^(desc|describe)\b/,
            /^insert\b/,
            /^update\b/,
            /^delete\b/,
            /^create\s+(view|index|table|temporary\s+table)\b/,
            /^alter\s+table\b/,
            /^drop\s+(view|index)\b/
        ];
        const isAllowed = allowedPatterns.some((re) => re.test(ql));
        
        if (!isAllowed) {
            return res.status(400).json({ 
                error: 'Query type not allowed',
                message: 'Allowed: SELECT, WITH (CTE), EXPLAIN, SHOW, DESCRIBE/DESC, INSERT, UPDATE, DELETE, CREATE (VIEW/INDEX/TABLE), ALTER TABLE, DROP (VIEW/INDEX)'
            });
        }

        const [rows] = await dbPool.execute(sanitizedQuery);

        let comparison = null;
        if (expectedQuery && typeof expectedQuery === 'string') {
            try {
                const expTrim = expectedQuery.trim();
                const expAllowed = allowedPatterns.some((re) => re.test(expTrim.toLowerCase()));
                if (expAllowed) {
                    const [expectedRows] = await dbPool.execute(expTrim);
                    comparison = compareResultSets(rows, expectedRows);
                }
            } catch (cmpErr) {
                // Suppress comparison if expected solution cannot be executed
                comparison = null;
            }
        }

        res.json({
            success: true,
            results: rows,
            rowCount: rows.length,
            comparison
        });

    } catch (error) {
        console.error('Query execution error:', error);
        res.status(500).json({ 
            error: 'Query execution failed',
            message: error.message 
        });
    }
});

// Shallow result set comparison: columns and unordered rows
function compareResultSets(actualRows, expectedRows) {
    const summary = { matches: true, differences: [] };
    const toKeys = rows => (rows && rows[0]) ? Object.keys(rows[0]) : [];
    const actualCols = toKeys(actualRows);
    const expectedCols = toKeys(expectedRows);

    // Compare column sets (order-insensitive)
    const setEq = (a, b) => a.length === b.length && a.every(k => b.includes(k));
    if (!setEq(actualCols, expectedCols)) {
        summary.matches = false;
        summary.differences.push(`Column mismatch: got [${actualCols.join(', ')}], expected [${expectedCols.join(', ')}]`);
    }

    // Row count
    if ((actualRows?.length || 0) !== (expectedRows?.length || 0)) {
        summary.matches = false;
        summary.differences.push(`Row count differs: got ${(actualRows||[]).length}, expected ${(expectedRows||[]).length}`);
    }

    // Normalize rows by sorting keys and stringifying; compare as sets
    const normalize = (rows, cols) => (rows||[]).map(r => JSON.stringify(cols.reduce((o, c) => { o[c] = r[c]; return o; }, {}))).sort();
    const aNorm = normalize(actualRows, expectedCols.length ? expectedCols : actualCols);
    const eNorm = normalize(expectedRows, expectedCols.length ? expectedCols : actualCols);
    if (aNorm.length !== eNorm.length || aNorm.some((v, i) => v !== eNorm[i])) {
        summary.matches = false;
        summary.differences.push('Row set differs from expected.');
    }

    return summary;
}

app.get('/test-connection', async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ success: false, error: 'SQLite database not initialized' });
        }
        await dbPool.execute('SELECT 1');
        res.json({ success: true, message: 'Database connection is working' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Explicit SPA entry routes for client router
app.get(['/game', '/mode/:mode', '/level/:mode/:level/:q', '/blog', '/blog/*'], (req, res) => {
    console.log(`Explicit SPA route serving index.html for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SPA fallback: serve index.html for non-API routes to enable client-side routing
app.get('*', (req, res, next) => {
    const ignorePrefixes = ['/api/', '/auth/', '/test-connection', '/execute-query', '/assets/', '/src/', '/node_modules/'];
    if (ignorePrefixes.some(p => req.path.startsWith(p))) {
        return next();
    }
    console.log(`SPA fallback serving index.html for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'index.html'));
});

const killProcessOnPort = async (port) => {
    const isWin = process.platform === "win32";
    const exec = require('child_process').exec;

    return new Promise((resolve, reject) => {
        if (isWin) {
            // Windows: use netstat to find PID, then taskkill
            exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
                if (err || !stdout) return resolve();
                const lines = stdout.trim().split('\n');
                const pids = new Set();
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5) {
                        pids.add(parts[4]);
                    }
                });
                if (pids.size === 0) return resolve();
                let killed = 0;
                pids.forEach(pid => {
                    exec(`taskkill /PID ${pid} /F`, () => {
                        killed++;
                        if (killed === pids.size) resolve();
                    });
                });
            });
        } else {
            // Unix: use lsof to find PID, then kill
            exec(`lsof -ti tcp:${port}`, (err, stdout) => {
                if (err || !stdout) return resolve();
                const pids = stdout.trim().split('\n').filter(Boolean);
                if (pids.length === 0) return resolve();
                let killed = 0;
                pids.forEach(pid => {
                    exec(`kill -9 ${pid}`, () => {
                        killed++;
                        if (killed === pids.length) resolve();
                    });
                });
            });
        }
    });
};

const startServer = async () => {
    try {
        await killProcessOnPort(PORT);
        await initUserDatabase();
        await connectDatabase(); // This will use virtual DB if MySQL isn't configured

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            if (!process.env.GOOGLE_CLIENT_ID) {
                console.log('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
            }
            console.log('✅ SQLite database ready for SQL queries');
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer().catch(console.error);
