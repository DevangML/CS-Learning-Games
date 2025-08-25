const express = require('express');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
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

let mysqlConnection;

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

// MySQL connection (for SQL queries)
const connectMySQL = async () => {
    try {
        mysqlConnection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'sql_tutor_user',
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE || 'sql_tutor'
        });
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('MySQL connection failed:', error);
        // Don't exit - allow setup route to handle this
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
        res.redirect('/');
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

// MySQL setup route (for first-time users)
app.post('/setup-mysql', async (req, res) => {
    try {
        const { host, port, user, password, database } = req.body;
        
        // Test connection with provided credentials
        const testConnection = await mysql.createConnection({
            host: host || 'localhost',
            port: port || 3306,
            user: user,
            password: password
        });
        
        // Create database if it doesn't exist
        await testConnection.execute(`CREATE DATABASE IF NOT EXISTS ${database}`);
        await testConnection.end();
        
        // Connect to the new database
        mysqlConnection = await mysql.createConnection({
            host: host || 'localhost',
            port: port || 3306,
            user: user,
            password: password,
            database: database
        });
        
        // Create tables
        await createMySQLTables();
        
        res.json({ success: true, message: 'MySQL setup completed successfully' });
    } catch (error) {
        console.error('MySQL setup error:', error);
        res.status(500).json({ error: 'MySQL setup failed', message: error.message });
    }
});

// Create MySQL tables (same as before but extracted)
const createMySQLTables = async () => {
    const sqlStatements = [
        `CREATE TABLE IF NOT EXISTS departments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            manager_id INT
        )`,
        
        `CREATE TABLE IF NOT EXISTS employees (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            department_id INT,
            salary DECIMAL(10,2),
            hire_date DATE
        )`,

        `CREATE TABLE IF NOT EXISTS projects (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            budget DECIMAL(15,2),
            start_date DATE,
            end_date DATE
        )`,

        `CREATE TABLE IF NOT EXISTS employee_projects (
            employee_id INT,
            project_id INT,
            role VARCHAR(50),
            PRIMARY KEY (employee_id, project_id),
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )`,

        `INSERT IGNORE INTO departments (id, name, manager_id) VALUES
        (1, 'Engineering', 1),
        (2, 'Marketing', 2),
        (3, 'Sales', 3),
        (4, 'HR', 4)`,

        `INSERT IGNORE INTO employees (id, name, department_id, salary, hire_date) VALUES
        (1, 'John Doe', 1, 75000.00, '2020-01-15'),
        (2, 'Jane Smith', 2, 65000.00, '2019-03-22'),
        (3, 'Mike Johnson', 1, 80000.00, '2021-06-10'),
        (4, 'Sarah Wilson', 3, 55000.00, '2022-02-01'),
        (5, 'David Brown', 1, 70000.00, '2020-09-15'),
        (6, 'Lisa Davis', 2, 60000.00, '2021-11-30'),
        (7, 'Tom Anderson', 4, 50000.00, '2023-01-20'),
        (8, 'Emily White', 3, 58000.00, '2022-08-15')`,

        `INSERT IGNORE INTO projects (id, name, budget, start_date, end_date) VALUES
        (1, 'Website Redesign', 100000.00, '2023-01-01', '2023-06-30'),
        (2, 'Mobile App', 150000.00, '2023-03-15', '2023-12-31'),
        (3, 'Database Migration', 80000.00, '2023-02-01', '2023-08-31')`,

        `INSERT IGNORE INTO employee_projects (employee_id, project_id, role) VALUES
        (1, 1, 'Lead Developer'),
        (3, 1, 'Frontend Developer'),
        (5, 2, 'Backend Developer'),
        (1, 3, 'Database Architect'),
        (2, 1, 'UI/UX Designer')`,

        // Additional tables for LeetCode patterns
        `CREATE TABLE IF NOT EXISTS logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            num INT
        )`,

        `INSERT IGNORE INTO logs (id, num) VALUES
        (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2)`,

        `CREATE TABLE IF NOT EXISTS weather (
            id INT PRIMARY KEY AUTO_INCREMENT,
            record_date DATE,
            temperature INT
        )`,

        `INSERT IGNORE INTO weather (id, record_date, temperature) VALUES
        (1, '2015-01-01', 10), (2, '2015-01-02', 25), (3, '2015-01-03', 20), (4, '2015-01-04', 30)`,

        `CREATE TABLE IF NOT EXISTS activity (
            user_id INT,
            session_id INT,
            activity_date DATE,
            activity_type VARCHAR(50),
            PRIMARY KEY(user_id, session_id, activity_date)
        )`,

        `INSERT IGNORE INTO activity (user_id, session_id, activity_date, activity_type) VALUES
        (1, 1, '2019-07-20', 'open_session'),
        (1, 1, '2019-07-20', 'scroll_down'),
        (1, 1, '2019-07-20', 'end_session'),
        (1, 2, '2019-07-21', 'open_session'),
        (1, 2, '2019-07-21', 'send_message'),
        (1, 2, '2019-07-21', 'end_session'),
        (2, 4, '2019-07-21', 'open_session'),
        (2, 4, '2019-07-21', 'send_message'),
        (2, 4, '2019-07-21', 'end_session')`
    ];

    for (const sql of sqlStatements) {
        await mysqlConnection.execute(sql);
    }
    
    console.log('MySQL tables created and populated');
};

// Gamification API endpoints
app.get('/api/user/profile', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/user/stats', requireAuth, (req, res) => {
    const userId = req.user.id;
    
    userDb.all(`
        SELECT 
            (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1) as completed_questions,
            (SELECT COALESCE(SUM(xp_earned), 0) FROM user_progress WHERE user_id = ?) as total_xp,
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
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ success: true });
                }
            );
        } else {
            // Create new progress entry
            userDb.run(
                'INSERT INTO user_progress (user_id, level_id, question_id, completed, attempts, hints_used, xp_earned, completed_at) VALUES (?, ?, ?, ?, 1, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)',
                [userId, level_id, question_id, completed, hints_used, xp_earned, completed],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ success: true });
                }
            );
        }
        
        // Update user's total XP and level if question completed
        if (completed && xp_earned > 0) {
            userDb.run(
                'UPDATE users SET total_xp = total_xp + ?, level = CAST(0.1 * SQRT(total_xp + ?) + 1 AS INTEGER), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [xp_earned, xp_earned, userId]
            );
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
                        question_id: Math.floor(Math.random() * 4) + 1  // 1-4 questions per level
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
                            question_1_id: missions[0],
                            question_2_id: missions[1],
                            question_3_id: missions[2],
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
        const { query } = req.body;
        
        if (!mysqlConnection) {
            return res.status(500).json({ error: 'MySQL not configured. Please set up your database connection.' });
        }
        
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        const sanitizedQuery = query.trim();
        
        // Allow SELECT, EXPLAIN, and some DDL commands
        const allowedCommands = ['select', 'explain', 'create view', 'create index', 'create table', 'alter table'];
        const queryLower = sanitizedQuery.toLowerCase();
        const isAllowed = allowedCommands.some(cmd => queryLower.startsWith(cmd));
        
        if (!isAllowed) {
            return res.status(400).json({ error: 'Only SELECT, EXPLAIN, CREATE VIEW, CREATE INDEX, CREATE TABLE, and ALTER TABLE queries are allowed' });
        }

        const [rows] = await mysqlConnection.execute(sanitizedQuery);
        
        res.json({
            success: true,
            results: rows,
            rowCount: rows.length
        });

    } catch (error) {
        console.error('Query execution error:', error);
        res.status(500).json({ 
            error: 'Query execution failed',
            message: error.message 
        });
    }
});

app.get('/test-connection', async (req, res) => {
    try {
        if (!mysqlConnection) {
            return res.status(500).json({ success: false, error: 'MySQL not configured' });
        }
        await mysqlConnection.execute('SELECT 1');
        res.json({ success: true, message: 'Database connection is working' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
    try {
        await initUserDatabase();
        await connectMySQL(); // This won't fail if MySQL isn't configured
        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            if (!process.env.GOOGLE_CLIENT_ID) {
                console.log('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
            }
            if (!mysqlConnection) {
                console.log('⚠️  MySQL not configured. Users will be prompted to set it up.');
            }
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer().catch(console.error);