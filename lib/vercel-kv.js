import { kv } from '@vercel/kv';

// Configure KV to use the specific Redis store
// This will automatically use the environment variables from your Vercel project:
// KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN

// Redis key patterns for user data
const KEYS = {
  USER: (googleId) => `users:${googleId}`,
  USER_PROGRESS: (userId, levelId, questionId) => `progress:${userId}:${levelId}:${questionId}`,
  DAILY_MISSIONS: (userId, date) => `missions:${userId}:${date}`,
  WEEKLY_QUEST: (userId, weekStart) => `weekly_quest:${userId}:${weekStart}`,
  STREAK_RECOVERY: (userId) => `streak_recovery:${userId}`,
  DAILY_REFLECTION: (userId, date) => `reflection:${userId}:${date}`,
  USER_SESSIONS: (userId, sessionId) => `sessions:${userId}:${sessionId}`,
  USER_REWARDS: (userId, rewardId) => `rewards:${userId}:${rewardId}`,
  SPACED_REPETITION: (userId, levelId, questionId) => `spaced:${userId}:${levelId}:${questionId}`,
};

// Helper functions
const getToday = () => new Date().toISOString().split('T')[0];
const getWeekStart = () => {
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  return startOfWeek.toISOString().split('T')[0];
};

// User management functions
async function getUserById(googleId) {
  try {
    const user = await kv.get(KEYS.USER(googleId));
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

async function createUser({ google_id, name, email, avatar }) {
  try {
    const today = getToday();
    const user = {
      id: google_id, // Use google_id as the primary key
      google_id,
      name,
      email,
      avatar,
      total_xp: 0,
      level: 1,
      current_streak: 1,
      max_streak: 1,
      last_login: today,
      streak_shields: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(KEYS.USER(google_id), user);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUserLogin(googleId) {
  try {
    const user = await getUserById(googleId);
    if (!user) return;

    const today = getToday();
    let newStreak = user.current_streak || 1;
    let newShields = user.streak_shields || 0;

    if (user.last_login) {
      const lastLogin = new Date(user.last_login);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - lastLogin) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        newStreak += 1;
        if (newStreak % 7 === 0 && newShields < 1) newShields += 1;
      } else if (daysDiff > 2) {
        if (newShields > 0) newShields -= 1;
        else {
          const brokenStreak = newStreak;
          if (brokenStreak >= 7) await createStreakRecovery(googleId, brokenStreak);
          newStreak = 1;
        }
      } else if (daysDiff === 2) {
        if (newShields === 0) {
          const brokenStreak = newStreak;
          if (brokenStreak >= 7) await createStreakRecovery(googleId, brokenStreak);
          newStreak = 1;
        }
      }
    }

    const updatedUser = {
      ...user,
      last_login: today,
      current_streak: newStreak,
      max_streak: Math.max(user.max_streak || 1, newStreak),
      streak_shields: newShields,
      updated_at: new Date().toISOString(),
    };

    await kv.set(KEYS.USER(googleId), updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user login:', error);
    throw error;
  }
}

async function createStreakRecovery(googleId, brokenStreak) {
  try {
    const recoveryDeadline = new Date();
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 2);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check for existing recovery in last 30 days
    const existingRecovery = await kv.get(KEYS.STREAK_RECOVERY(googleId));
    if (existingRecovery && existingRecovery.recovery_used && 
        new Date(existingRecovery.created_at) > thirtyDaysAgo) {
      return; // Already used recovery recently
    }

    const recovery = {
      user_id: googleId,
      broken_streak: brokenStreak,
      recovery_deadline: recoveryDeadline.toISOString().split('T')[0],
      recovery_missions_needed: 5,
      recovery_missions_completed: 0,
      recovery_used: false,
      created_at: new Date().toISOString(),
    };

    await kv.set(KEYS.STREAK_RECOVERY(googleId), recovery);
  } catch (error) {
    console.error('Error creating streak recovery:', error);
  }
}

// User stats and progress functions
async function getUserStats(userId) {
  try {
    const user = await getUserById(userId);
    if (!user) return {};

    // Get completed questions count
    const progressKeys = await kv.keys(`progress:${userId}:*`);
    const completedQuestions = progressKeys.length;

    return {
      completed_questions: completedQuestions,
      total_xp: user.total_xp || 0,
      current_streak: user.current_streak || 0,
      max_streak: user.max_streak || 0,
      streak_shields: user.streak_shields || 0,
      level: user.level || 1,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {};
  }
}

async function getUserProgress(userId) {
  try {
    const progressKeys = await kv.keys(`progress:${userId}:*`);
    const progress = [];

    for (const key of progressKeys) {
      const progressData = await kv.get(key);
      if (progressData) {
        progress.push(progressData);
      }
    }

    return progress.sort((a, b) => {
      if (a.level_id !== b.level_id) return a.level_id - b.level_id;
      return a.question_id - b.question_id;
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
}

async function updateAndReturnUserTotals(userId, completed, xpEarned) {
  try {
    const user = await getUserById(userId);
    if (!user) return { total_xp: 0, level: 1 };

    if (completed && xpEarned > 0) {
      const newTotalXp = (user.total_xp || 0) + xpEarned;
      const newLevel = Math.floor(0.1 * Math.sqrt(newTotalXp) + 1);

      const updatedUser = {
        ...user,
        total_xp: newTotalXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      };

      await kv.set(KEYS.USER(userId), updatedUser);
      return { total_xp: newTotalXp, level: newLevel };
    }

    return { total_xp: user.total_xp || 0, level: user.level || 1 };
  } catch (error) {
    console.error('Error updating user totals:', error);
    return { total_xp: 0, level: 1 };
  }
}

async function upsertUserProgress(userId, { level_id, question_id, completed, xp_earned, hints_used }) {
  try {
    const key = KEYS.USER_PROGRESS(userId, level_id, question_id);
    const existing = await kv.get(key);

    if (existing) {
      const updatedProgress = {
        ...existing,
        completed: completed,
        attempts: (existing.attempts || 0) + 1,
        hints_used: (existing.hints_used || 0) + hints_used,
        xp_earned: (existing.xp_earned || 0) + xp_earned,
        completed_at: completed ? new Date().toISOString() : existing.completed_at,
      };
      await kv.set(key, updatedProgress);
    } else {
      const newProgress = {
        user_id: userId,
        level_id,
        question_id,
        completed,
        attempts: 1,
        hints_used,
        xp_earned,
        completed_at: completed ? new Date().toISOString() : null,
      };
      await kv.set(key, newProgress);
    }

    return updateAndReturnUserTotals(userId, completed, xp_earned);
  } catch (error) {
    console.error('Error upserting user progress:', error);
    throw error;
  }
}

// Weekly quest functions
async function getWeeklyQuest(userId) {
  try {
    const weekStart = getWeekStart();
    const key = KEYS.WEEKLY_QUEST(userId, weekStart);
    let quest = await kv.get(key);

    if (!quest) {
      quest = {
        id: `${userId}-${weekStart}`,
        user_id: userId,
        week_start: weekStart,
        missions_target: 12,
        missions_completed: 0,
        completed: false,
        reward_claimed: false,
      };
      await kv.set(key, quest);
    }

    return quest;
  } catch (error) {
    console.error('Error getting weekly quest:', error);
    return null;
  }
}

async function completeWeeklyQuest(userId) {
  try {
    const weekStart = getWeekStart();
    const key = KEYS.WEEKLY_QUEST(userId, weekStart);
    const quest = await kv.get(key);

    if (!quest) return { reward: null };

    const updatedQuest = {
      ...quest,
      missions_completed: quest.missions_completed + 1,
      completed: quest.missions_completed + 1 >= quest.missions_target,
    };

    await kv.set(key, updatedQuest);

    let reward = null;
    if (updatedQuest.completed && !updatedQuest.reward_claimed) {
      const rewardType = Math.random() < 0.5 ? 'shield' : 'xp';
      
      if (rewardType === 'shield') {
        const user = await getUserById(userId);
        const updatedUser = {
          ...user,
          streak_shields: (user.streak_shields || 0) + 1,
          updated_at: new Date().toISOString(),
        };
        await kv.set(KEYS.USER(userId), updatedUser);
        reward = '1 Streak Shield';
      } else {
        const user = await getUserById(userId);
        const newTotalXp = (user.total_xp || 0) + 200;
        const newLevel = Math.floor(0.1 * Math.sqrt(newTotalXp) + 1);
        const updatedUser = {
          ...user,
          total_xp: newTotalXp,
          level: newLevel,
          updated_at: new Date().toISOString(),
        };
        await kv.set(KEYS.USER(userId), updatedUser);
        reward = '200 XP';
      }

      updatedQuest.reward_claimed = true;
      await kv.set(key, updatedQuest);
    }

    return { reward };
  } catch (error) {
    console.error('Error completing weekly quest:', error);
    return { reward: null };
  }
}

// Daily missions functions
async function getDailyMissions(userId, date) {
  try {
    const key = KEYS.DAILY_MISSIONS(userId, date);
    let missions = await kv.get(key);

    if (!missions) {
      // Generate new missions
      const selected = [];
      while (selected.length < 3) {
        selected.push({
          level_id: Math.floor(Math.random() * 11) + 1,
          question_id: Math.floor(Math.random() * 4) + 1,
        });
      }

      missions = {
        user_id: userId,
        mission_date: date,
        question_1_id: `${selected[0].level_id}-${selected[0].question_id}`,
        question_2_id: `${selected[1].level_id}-${selected[1].question_id}`,
        question_3_id: `${selected[2].level_id}-${selected[2].question_id}`,
        completed_count: 0,
      };

      await kv.set(key, missions);
    }

    return missions;
  } catch (error) {
    console.error('Error getting daily missions:', error);
    return null;
  }
}

async function completeDailyMission(userId, levelId, questionId, date) {
  try {
    const missions = await getDailyMissions(userId, date);
    if (!missions) return { completed_count: 0 };

    const questionKey = `${levelId}-${questionId}`;
    let newCompleted = missions.completed_count;

    if (missions.question_1_id === questionKey && missions.completed_count < 1) {
      newCompleted = 1;
    } else if (missions.question_2_id === questionKey && missions.completed_count < 2) {
      newCompleted = 2;
    } else if (missions.question_3_id === questionKey && missions.completed_count < 3) {
      newCompleted = 3;
    }

    if (newCompleted > missions.completed_count) {
      missions.completed_count = newCompleted;
      await kv.set(KEYS.DAILY_MISSIONS(userId, date), missions);

      // Update weekly quest
      const weekStart = getWeekStart();
      const questKey = KEYS.WEEKLY_QUEST(userId, weekStart);
      const quest = await kv.get(questKey);
      if (quest) {
        quest.missions_completed = quest.missions_completed + 1;
        quest.completed = quest.missions_completed >= quest.missions_target;
        await kv.set(questKey, quest);
      }
    }

    return { completed_count: Math.max(newCompleted, missions.completed_count) };
  } catch (error) {
    console.error('Error completing daily mission:', error);
    return { completed_count: 0 };
  }
}

// Streak recovery functions
async function getStreakRecovery(userId) {
  try {
    const recovery = await kv.get(KEYS.STREAK_RECOVERY(userId));
    if (!recovery) return null;

    const deadline = new Date(recovery.recovery_deadline);
    const today = new Date();
    
    if (recovery.recovery_used || deadline < today) {
      return null;
    }

    return recovery;
  } catch (error) {
    console.error('Error getting streak recovery:', error);
    return null;
  }
}

async function completeStreakRecoveryMission(userId) {
  try {
    const recovery = await getStreakRecovery(userId);
    if (!recovery) return { completed: false };

    recovery.recovery_missions_completed = recovery.recovery_missions_completed + 1;
    await kv.set(KEYS.STREAK_RECOVERY(userId), recovery);

    if (recovery.recovery_missions_completed >= 5) {
      const restored = Math.floor(recovery.broken_streak / 2);
      const user = await getUserById(userId);
      const updatedUser = {
        ...user,
        current_streak: restored,
        updated_at: new Date().toISOString(),
      };
      await kv.set(KEYS.USER(userId), updatedUser);

      recovery.recovery_used = true;
      await kv.set(KEYS.STREAK_RECOVERY(userId), recovery);

      return { completed: true, restored_streak: restored };
    }

    return { completed: false };
  } catch (error) {
    console.error('Error completing streak recovery mission:', error);
    return { completed: false };
  }
}

// Daily reflection functions
async function getDailyReflection(userId, date) {
  try {
    return await kv.get(KEYS.DAILY_REFLECTION(userId, date));
  } catch (error) {
    console.error('Error getting daily reflection:', error);
    return null;
  }
}

async function saveDailyReflection(userId, takeaway, date) {
  try {
    const reflection = {
      user_id: userId,
      reflection_date: date,
      takeaway,
      created_at: new Date().toISOString(),
    };
    await kv.set(KEYS.DAILY_REFLECTION(userId, date), reflection);
  } catch (error) {
    console.error('Error saving daily reflection:', error);
    throw error;
  }
}

async function getWeeklyRecap(userId) {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const reflectionKeys = await kv.keys(`reflection:${userId}:*`);
    const reflections = [];

    for (const key of reflectionKeys) {
      const reflection = await kv.get(key);
      if (reflection && reflection.reflection_date >= weekAgo) {
        reflections.push(reflection);
      }
    }

    return reflections.sort((a, b) => new Date(b.reflection_date) - new Date(a.reflection_date));
  } catch (error) {
    console.error('Error getting weekly recap:', error);
    return [];
  }
}

// Export all functions
module.exports = {
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
