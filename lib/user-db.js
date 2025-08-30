const Database = require('better-sqlite3');

let userDb;
let initialized = false;

function getDb() {
  if (!userDb) {
    // Use file in working dir; on serverless this is ephemeral
    userDb = new Database('./user_data.db');
  }
  if (!initialized) {
    initUserDatabase();
  }
  return userDb;
}

function run(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return Promise.resolve({ lastID: result.lastInsertRowid, changes: result.changes });
  } catch (err) {
    return Promise.reject(err);
  }
}

function get(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.get(params);
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

function all(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.all(params);
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

function initUserDatabase() {
  const db = userDb || new Database('./user_data.db');
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS users (
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

    db.exec(`CREATE TABLE IF NOT EXISTS user_progress (
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

    db.exec(`CREATE TABLE IF NOT EXISTS daily_missions (
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

    db.exec(`CREATE TABLE IF NOT EXISTS spaced_repetition (
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

    db.exec(`CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_start DATETIME,
      session_end DATETIME,
      xp_earned INTEGER DEFAULT 0,
      questions_completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS weekly_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      week_start DATE,
      missions_target INTEGER DEFAULT 12,
      missions_completed INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      reward_claimed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS user_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      reward_type TEXT,
      content TEXT,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS daily_reflections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      reflection_date DATE,
      takeaway TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS streak_recovery (
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
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
  initialized = true;
}

async function getUserById(google_id) {
  const db = getDb();
  return get(db, 'SELECT * FROM users WHERE google_id = ?', [google_id]);
}

async function createUser({ google_id, name, email, avatar }) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  await run(
    db,
    'INSERT INTO users (google_id, name, email, avatar, last_login) VALUES (?, ?, ?, ?, ?)',
    [google_id, name, email, avatar, today]
  );
  return getUserById(google_id);
}

async function createStreakRecovery(google_id, brokenStreak) {
  const db = getDb();
  const recoveryDeadline = new Date();
  recoveryDeadline.setDate(recoveryDeadline.getDate() + 2);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const existing = await get(
    db,
    'SELECT * FROM streak_recovery WHERE user_id = (SELECT id FROM users WHERE google_id = ?) AND created_at > ? AND recovery_used = 1',
    [google_id, thirtyDaysAgo.toISOString()]
  );
  if (!existing) {
    await run(
      db,
      'INSERT INTO streak_recovery (user_id, broken_streak, recovery_deadline) VALUES ((SELECT id FROM users WHERE google_id = ?), ?, ?)',
      [google_id, brokenStreak, recoveryDeadline.toISOString().split('T')[0]]
    );
  }
}

async function updateUserLogin(google_id) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const row = await get(
    db,
    'SELECT last_login, current_streak, streak_shields FROM users WHERE google_id = ?',
    [google_id]
  );
  let newStreak = row?.current_streak || 0;
  let newShields = row?.streak_shields || 0;
  if (row?.last_login) {
    const lastLogin = new Date(row.last_login);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate - lastLogin) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak += 1;
      if (newStreak % 7 === 0 && newShields < 1) newShields += 1;
    } else if (daysDiff > 2) {
      if (newShields > 0) newShields -= 1;
      else {
        const brokenStreak = newStreak;
        if (brokenStreak >= 7) await createStreakRecovery(google_id, brokenStreak);
        newStreak = 1;
      }
    } else if (daysDiff === 2) {
      if (newShields === 0) {
        const brokenStreak = newStreak;
        if (brokenStreak >= 7) await createStreakRecovery(google_id, brokenStreak);
        newStreak = 1;
      }
    }
  } else {
    newStreak = 1;
  }
  await run(
    db,
    'UPDATE users SET last_login = ?, current_streak = ?, max_streak = MAX(max_streak, ?), streak_shields = ?, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?',
    [today, newStreak, newStreak, newShields, google_id]
  );
}

async function getUserStats(userId) {
  const db = getDb();
  const rows = await all(
    db,
    `SELECT 
      (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1) as completed_questions,
      (SELECT total_xp FROM users WHERE id = ?) as total_xp,
      (SELECT current_streak FROM users WHERE id = ?) as current_streak,
      (SELECT max_streak FROM users WHERE id = ?) as max_streak,
      (SELECT streak_shields FROM users WHERE id = ?) as streak_shields,
      (SELECT level FROM users WHERE id = ?) as level`,
    [userId, userId, userId, userId, userId, userId]
  );
  return rows?.[0] || {};
}

async function getUserProgress(userId) {
  const db = getDb();
  return all(
    db,
    'SELECT level_id, question_id, completed, xp_earned, hints_used, completed_at FROM user_progress WHERE user_id = ? ORDER BY level_id, question_id',
    [userId]
  );
}

async function updateAndReturnUserTotals(userId, completed, xp_earned) {
  const db = getDb();
  if (completed && xp_earned > 0) {
    await run(
      db,
      'UPDATE users SET total_xp = total_xp + ?, level = CAST(0.1 * SQRT(total_xp + ?) + 1 AS INTEGER), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [xp_earned, xp_earned, userId]
    );
  }
  const row = await get(db, 'SELECT total_xp, level FROM users WHERE id = ?', [userId]);
  return { total_xp: row?.total_xp || 0, level: row?.level || 1 };
}

async function upsertUserProgress(userId, { level_id, question_id, completed, xp_earned, hints_used }) {
  const db = getDb();
  const existing = await get(
    db,
    'SELECT * FROM user_progress WHERE user_id = ? AND level_id = ? AND question_id = ?',
    [userId, level_id, question_id]
  );
  if (existing) {
    await run(
      db,
      'UPDATE user_progress SET completed = ?, attempts = attempts + 1, hints_used = hints_used + ?, xp_earned = xp_earned + ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?',
      [completed, hints_used, xp_earned, completed, existing.id]
    );
  } else {
    await run(
      db,
      'INSERT INTO user_progress (user_id, level_id, question_id, completed, attempts, hints_used, xp_earned, completed_at) VALUES (?, ?, ?, ?, 1, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)',
      [userId, level_id, question_id, completed, hints_used, xp_earned, completed]
    );
  }
  return updateAndReturnUserTotals(userId, completed, xp_earned);
}

async function getWeeklyQuest(userId) {
  const db = getDb();
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const weekStart = startOfWeek.toISOString().split('T')[0];
  let row = await get(db, 'SELECT * FROM weekly_quests WHERE user_id = ? AND week_start = ?', [userId, weekStart]);
  if (!row) {
    const ins = await run(
      db,
      'INSERT INTO weekly_quests (user_id, week_start, missions_target, missions_completed) VALUES (?, ?, 12, 0)',
      [userId, weekStart]
    );
    row = {
      id: ins.lastID,
      user_id: userId,
      week_start: weekStart,
      missions_target: 12,
      missions_completed: 0,
      completed: 0,
      reward_claimed: 0,
    };
  }
  return row;
}

async function completeWeeklyQuest(userId) {
  const db = getDb();
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const weekStart = startOfWeek.toISOString().split('T')[0];
  await run(
    db,
    'UPDATE weekly_quests SET missions_completed = missions_completed + 1, completed = CASE WHEN missions_completed + 1 >= missions_target THEN 1 ELSE 0 END WHERE user_id = ? AND week_start = ?',
    [userId, weekStart]
  );
  const quest = await get(
    db,
    'SELECT * FROM weekly_quests WHERE user_id = ? AND week_start = ? AND completed = 1 AND reward_claimed = 0',
    [userId, weekStart]
  );
  let reward = null;
  if (quest) {
    const rewardType = Math.random() < 0.5 ? 'shield' : 'xp';
    if (rewardType === 'shield') {
      await run(db, 'UPDATE users SET streak_shields = streak_shields + 1 WHERE id = ?', [userId]);
      reward = '1 Streak Shield';
    } else {
      await run(
        db,
        'UPDATE users SET total_xp = total_xp + 200, level = CAST(0.1 * SQRT(total_xp + 200) + 1 AS INTEGER) WHERE id = ?',
        [userId]
      );
      reward = '200 XP';
    }
    await run(db, 'UPDATE weekly_quests SET reward_claimed = 1 WHERE id = ?', [quest.id]);
  }
  return { reward };
}

async function getDailyMissions(userId, date) {
  const db = getDb();
  const todayRow = await get(
    db,
    'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
    [userId, date]
  );
  if (todayRow) return todayRow;
  // generate
  // Select up to 3 due questions from spaced_repetition; otherwise random combos
  const due = await all(
    db,
    `SELECT sr.level_id, sr.question_id, sr.due_date
     FROM spaced_repetition sr
     WHERE sr.user_id = ? AND sr.due_date <= ?
     ORDER BY sr.due_date ASC, RANDOM()
     LIMIT 3`,
    [userId, date]
  );
  const selected = [...due];
  while (selected.length < 3) {
    selected.push({
      level_id: Math.floor(Math.random() * 11) + 1,
      question_id: Math.floor(Math.random() * 4) + 1,
    });
  }
  const q1 = `${selected[0].level_id}-${selected[0].question_id}`;
  const q2 = `${selected[1].level_id}-${selected[1].question_id}`;
  const q3 = `${selected[2].level_id}-${selected[2].question_id}`;
  await run(
    db,
    'INSERT INTO daily_missions (user_id, mission_date, question_1_id, question_2_id, question_3_id, completed_count) VALUES (?, ?, ?, ?, ?, 0)',
    [userId, date, q1, q2, q3]
  );
  return get(db, 'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?', [userId, date]);
}

async function completeDailyMission(userId, level_id, question_id, date) {
  const db = getDb();
  const missions = await get(
    db,
    'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
    [userId, date]
  );
  if (!missions) return { completed_count: 0 };
  const questionKey = `${level_id}-${question_id}`;
  let newCompleted = missions.completed_count;
  if (missions.question_1_id === questionKey && missions.completed_count < 1) newCompleted = 1;
  else if (missions.question_2_id === questionKey && missions.completed_count < 2) newCompleted = 2;
  else if (missions.question_3_id === questionKey && missions.completed_count < 3) newCompleted = 3;
  if (newCompleted > missions.completed_count) {
    await run(
      db,
      'UPDATE daily_missions SET completed_count = ? WHERE user_id = ? AND mission_date = ?',
      [newCompleted, userId, date]
    );
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      .toISOString()
      .split('T')[0];
    await run(
      db,
      'UPDATE weekly_quests SET missions_completed = missions_completed + 1, completed = CASE WHEN missions_completed + 1 >= missions_target THEN 1 ELSE 0 END WHERE user_id = ? AND week_start = ?',
      [userId, weekStart]
    );
  }
  return { completed_count: Math.max(newCompleted, missions.completed_count) };
}

async function getStreakRecovery(userId) {
  const db = getDb();
  return get(
    db,
    'SELECT * FROM streak_recovery WHERE user_id = ? AND recovery_used = 0 AND recovery_deadline >= date("now") ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
}

async function completeStreakRecoveryMission(userId) {
  const db = getDb();
  await run(
    db,
    'UPDATE streak_recovery SET recovery_missions_completed = recovery_missions_completed + 1 WHERE user_id = ? AND recovery_used = 0 AND recovery_deadline >= date("now")',
    [userId]
  );
  const recovery = await get(
    db,
    'SELECT * FROM streak_recovery WHERE user_id = ? AND recovery_missions_completed >= 5 AND recovery_used = 0',
    [userId]
  );
  if (recovery) {
    const restored = Math.floor(recovery.broken_streak / 2);
    await run(db, 'UPDATE users SET current_streak = ? WHERE id = ?', [restored, userId]);
    await run(db, 'UPDATE streak_recovery SET recovery_used = 1 WHERE id = ?', [recovery.id]);
    return { completed: true, restored_streak: restored };
  }
  return { completed: false };
}

async function getDailyReflection(userId, date) {
  const db = getDb();
  return get(db, 'SELECT * FROM daily_reflections WHERE user_id = ? AND reflection_date = ?', [userId, date]);
}

async function saveDailyReflection(userId, takeaway, date) {
  const db = getDb();
  await run(
    db,
    'INSERT OR REPLACE INTO daily_reflections (user_id, reflection_date, takeaway) VALUES (?, ?, ?)',
    [userId, date, takeaway]
  );
}

async function getWeeklyRecap(userId) {
  const db = getDb();
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return all(
    db,
    'SELECT * FROM daily_reflections WHERE user_id = ? AND reflection_date >= ? ORDER BY reflection_date DESC',
    [userId, weekAgo]
  );
}

module.exports = {
  getDb,
  initUserDatabase,
  getUserById,
  createUser,
  updateUserLogin,
  getUserStats,
  getUserProgress,
  upsertUserProgress,
  getWeeklyQuest,
  completeWeeklyQuest,
  getDailyMissions,
  completeDailyMission,
  getStreakRecovery,
  completeStreakRecoveryMission,
  getDailyReflection,
  saveDailyReflection,
  getWeeklyRecap,
};

