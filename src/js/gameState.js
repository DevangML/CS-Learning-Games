// Game State Management Module
class GameStateManager {
    constructor() {
        this.gameState = {
            score: 0,
            currentLevel: null,
            currentQuestionIndex: 0,
            streak: 0,
            hintsUsed: 0,
            completedLevels: new Set(),
            achievements: []
        };
        
        this.loadProgress();
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

    saveProgress() {
        localStorage.setItem('sqlQuestProgress', JSON.stringify({
            score: this.gameState.score,
            streak: this.gameState.streak,
            hintsUsed: this.gameState.hintsUsed,
            completedLevels: Array.from(this.gameState.completedLevels),
            achievements: this.gameState.achievements
        }));
    }

    loadProgress() {
        const saved = localStorage.getItem('sqlQuestProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.gameState.score = data.score || 0;
            this.gameState.streak = data.streak || 0;
            this.gameState.hintsUsed = data.hintsUsed || 0;
            this.gameState.completedLevels = new Set(data.completedLevels || []);
            this.gameState.achievements = data.achievements || [];
        }
        this.updateDisplay();
    }

    resetProgress() {
        this.gameState = {
            score: 0,
            currentLevel: null,
            currentQuestionIndex: 0,
            streak: 0,
            hintsUsed: 0,
            completedLevels: new Set(),
            achievements: []
        };
        localStorage.removeItem('sqlQuestProgress');
        this.updateDisplay();
    }

    updateDisplay() {
        const elements = {
            score: document.getElementById('score'),
            streak: document.getElementById('streak'),
            hintsUsed: document.getElementById('hintsUsed'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            nextLevel: document.getElementById('nextLevel')
        };

        if (elements.score) elements.score.textContent = this.gameState.score;
        if (elements.streak) elements.streak.textContent = this.gameState.streak;
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

    isLevelCompleted(levelId) {
        return this.gameState.completedLevels.has(levelId);
    }
}

// Export for use in other modules
window.GameStateManager = GameStateManager;