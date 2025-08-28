// Game State Management Module
class GameStateManager {
    constructor(authManager = null) {
        this.authManager = authManager;
        this.gameState = {
            score: 0,
            currentLevel: null,
            currentQuestionIndex: 0,
            currentQuestion: null,
            streak: 0,
            hintsUsed: 0,
            completedLevels: new Set(),
            completedQuestions: new Set(),
            achievements: [],
            totalXP: 0
        };
        
        // Only load from localStorage if not authenticated
        if (!this.authManager || !this.authManager.currentUser) {
            this.loadProgress();
        }
    }

    updateScore(points) {
        this.gameState.score += points;
        this.updateDisplay();
        this.saveProgress();
    }

    updateStreak(correct) {
        if (correct) {
            this.gameState.streak++;
        } else {
            this.gameState.streak = 0;
        }
        this.updateDisplay();
        this.saveProgress();
    }

    useHint() {
        this.gameState.hintsUsed++;
        this.updateDisplay();
        this.saveProgress();
    }

    completeLevel(levelId) {
        this.gameState.completedLevels.add(levelId);
        this.saveProgress();
    }

    addAchievement(achievement) {
        this.gameState.achievements.push(achievement);
        this.saveProgress();
    }

    async saveProgress() {
        // If user is authenticated, save to database
        if (this.authManager && this.authManager.currentUser) {
            // Database persistence is handled by individual progress calls
            return;
        }
    }
    
    // Save question/level completion to database
    async saveQuestionProgress(levelId, questionId, completed, xpEarned = 0, hintsUsed = 0) {
        if (!this.authManager || !this.authManager.currentUser) {
            // For unauthenticated users, just update local state
            if (completed) {
                this.gameState.completedQuestions.add(`${levelId}-${questionId}`);
                this.gameState.totalXP += xpEarned;
            }
            this.saveProgress();
            return;
        }
        
        try {
            const response = await fetch('/api/user/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    level_id: levelId,
                    question_id: questionId,
                    completed: completed,
                    xp_earned: xpEarned,
                    hints_used: hintsUsed
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                // Update local state with server response
                if (completed) {
                    this.gameState.completedQuestions.add(`${levelId}-${questionId}`);
                    this.gameState.totalXP += xpEarned;
                    
                    // Check if level is completed (all questions done)
                    if (this.isLevelFullyCompleted(levelId)) {
                        this.gameState.completedLevels.add(levelId);
                    }
                }
                
                // Update user stats from server if available
                if (this.authManager.userStats) {
                    this.authManager.userStats.total_xp = result.total_xp || this.authManager.userStats.total_xp;
                    this.authManager.userStats.level = result.level || this.authManager.userStats.level;
                    this.authManager.updateStatsDisplay();
                }
                
                // Check if this question is part of today's missions
                if (completed) {
                    this.checkMissionCompletion(levelId, questionId);
                }
                
                this.updateDisplay();
            }
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    // Load progress from database for authenticated users
    async loadUserProgress() {
        if (!this.authManager || !this.authManager.currentUser) {
            return;
        }
        
        try {
            const response = await fetch('/api/user/progress');
            if (response.ok) {
                const progressData = await response.json();
                
                // Reset state
                this.gameState.completedLevels.clear();
                this.gameState.completedQuestions.clear();
                
                // Load from server data
                if (progressData.progress) {
                    progressData.progress.forEach(item => {
                        if (item.completed) {
                            this.gameState.completedQuestions.add(`${item.level_id}-${item.question_id}`);
                            
                            // Mark level as completed if all questions are done
                            if (this.isLevelFullyCompleted(item.level_id)) {
                                this.gameState.completedLevels.add(item.level_id);
                            }
                        }
                    });
                }
                
                // Update XP and other stats from user stats
                if (this.authManager.userStats) {
                    this.gameState.totalXP = this.authManager.userStats.total_xp || 0;
                    this.gameState.streak = this.authManager.userStats.current_streak || 0;
                }
                
                this.updateDisplay();
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
        }
    }
    
    // Check if level is fully completed (helper method)
    isLevelFullyCompleted(levelId) {
        if (!window.LEARNING_LEVELS || !window.LEARNING_LEVELS[levelId]) {
            return false;
        }
        
        const level = window.LEARNING_LEVELS[levelId];
        const questionsCount = level.questions ? level.questions.length : 1;
        let completedCount = 0;
        
        for (let i = 0; i < questionsCount; i++) {
            if (this.gameState.completedQuestions.has(`${levelId}-${i}`)) {
                completedCount++;
            }
        }
        
        return completedCount === questionsCount;
    }
    
    // Check if completed question is part of today's missions
    async checkMissionCompletion(levelId, questionId) {
        if (!this.authManager || !this.authManager.currentUser) {
            return;
        }
        
        try {
            // Get today's missions
            const response = await fetch('/api/daily-missions');
            if (response.ok) {
                const missions = await response.json();
                const questionKey = `${levelId}-${questionId}`;
                
                // Check if this question matches any of today's missions
                if (missions.question_1_id === questionKey || 
                    missions.question_2_id === questionKey || 
                    missions.question_3_id === questionKey) {
                    
                    // Update mission progress
                    await fetch('/api/daily-missions/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            level_id: levelId,
                            question_id: questionId
                        })
                    });
                    
                    // Refresh missions display
                    if (this.authManager.loadDailyMissions) {
                        await this.authManager.loadDailyMissions();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check mission completion:', error);
        }
    }

    resetProgress() {
        this.gameState = {
            score: 0,
            currentLevel: null,
            currentQuestionIndex: 0,
            currentQuestion: null,
            streak: 0,
            hintsUsed: 0,
            completedLevels: new Set(),
            completedQuestions: new Set(),
            achievements: [],
            totalXP: 0
        };
        this.updateDisplay();
    }

    updateDisplay() {
        const elements = {
            hintsUsed: document.getElementById('hintsUsed'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            nextLevel: document.getElementById('nextLevel')
        };

        if (elements.hintsUsed) elements.hintsUsed.textContent = this.gameState.hintsUsed;
        
        // Calculate progress
        const totalLevels = window.LEARNING_LEVELS ? Object.keys(window.LEARNING_LEVELS).length : 11;
        const completedCount = this.gameState.completedLevels.size;
        const progressPercent = Math.round((completedCount / totalLevels) * 100);
        
        if (elements.progressBar) elements.progressBar.style.width = `${progressPercent}%`;
        if (elements.progressText) elements.progressText.textContent = `${progressPercent}% Complete`;
        
        // Show next level recommendation
        if (elements.nextLevel) {
            const nextLevel = this.getNextLevel(totalLevels);
            if (nextLevel <= totalLevels) {
                const levelInfo = window.LEARNING_LEVELS ? window.LEARNING_LEVELS[nextLevel] : null;
                const levelTitle = levelInfo ? levelInfo.title : `Level ${nextLevel}`;
                elements.nextLevel.textContent = levelTitle;
            } else {
                elements.nextLevel.textContent = "All Complete! 🎉";
            }
        }

        // If unauthenticated, update visible totals from local state
        if (!this.authManager || !this.authManager.currentUser) {
            const streakEl = document.getElementById('currentStreak');
            if (streakEl) streakEl.textContent = this.gameState.streak || 0;
            const xpEl = document.getElementById('totalXP');
            if (xpEl) xpEl.textContent = this.gameState.totalXP || 0;
        }
    }

    getNextLevel(totalLevels) {
        // Find first uncompleted level
        for (let i = 1; i <= totalLevels; i++) {
            if (!this.gameState.completedLevels.has(i)) {
                return i;
            }
        }
        return totalLevels + 1; // All completed
    }

    getCurrentState() {
        return this.gameState;
    }

    setCurrentLevel(levelId) {
        this.gameState.currentLevel = levelId;
        this.gameState.currentQuestionIndex = 0;
    }

    nextQuestion() {
        this.gameState.currentQuestionIndex++;
    }

    setQuestionIndex(index) {
        this.gameState.currentQuestionIndex = Math.max(0, parseInt(index, 10) || 0);
    }

    isLevelCompleted(levelId) {
        return this.gameState.completedLevels.has(levelId);
    }
}

// Export for use in other modules
window.GameStateManager = GameStateManager;
