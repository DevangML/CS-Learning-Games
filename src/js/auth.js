// Authentication and User Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userStats = null;
        this.sessionStartTime = null;
        this.sessionXP = 0;
        this.sessionQuestions = 0;
        this.wrongAnswerCount = new Map(); // Track wrong answers per question
        this._initialized = false;
    }

    async init() {
        if (this._initialized) return;
        this._initialized = true;
        await this.checkAuthStatus();
        this.sessionStartTime = Date.now();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/user');
            const data = await response.json();
            
            if (data.user) {
                this.currentUser = data.user;
                await this.loadUserStats();
                this.showAuthenticatedUI();
                await this.checkMySQLConnection();

                // Show welcome animation only on explicit login (via one-time URL flag)
                const params = new URLSearchParams(window.location.search || '');
                if (params.get('welcome') === '1') {
                    this.showLoginSuccess();
                    // Remove the flag from the URL without reloading
                    params.delete('welcome');
                    const newSearch = params.toString();
                    const newUrl = window.location.pathname + (newSearch ? ('?' + newSearch) : '') + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                }
            } else {
                this.showAuthenticationUI();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showAuthenticationUI();
        }
    }

    showLoginSuccess() {
        // Show smooth welcome back animation
        const welcome = document.createElement('div');
        welcome.className = 'login-success-animation';
        welcome.innerHTML = `
            <div class="success-content">
                <div class="success-icon">👋</div>
                <h2>Welcome back, ${this.currentUser.name.split(' ')[0]}!</h2>
                <p>Your SQL journey continues...</p>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        setTimeout(() => {
            welcome.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(welcome)) {
                    document.body.removeChild(welcome);
                }
            }, 500);
        }, 2000);
    }

    async loadUserStats() {
        try {
            const response = await fetch('/api/user/stats');
            if (response.ok) {
                this.userStats = await response.json();
                this.updateStatsDisplay();
                
                // Load user progress into game state if available
                if (window.gameStateManager && window.gameStateManager.loadUserProgress) {
                    await window.gameStateManager.loadUserProgress();
                }
                // Refresh level selector and progress bar if app is mounted
                if (window.app && window.app.renderLevelSelector && window.app.updateProgressDisplay) {
                    window.app.renderLevelSelector();
                    window.app.updateProgressDisplay();
                }
            }
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }

    showAuthenticationUI() {
        // Show only the authentication section (centered)
        const auth = document.getElementById('authSection');
        if (auth) auth.style.display = 'flex';

        // Hide everything else for a clean logged-out view
        const hideIds = ['userProfile', 'gameStats', 'dailyMissions', 'roadmapHeader', 'levelSelector', 'gameArea'];
        hideIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const header = document.querySelector('.header');
        if (header) header.style.display = 'none';
        const modeSelector = document.querySelector('.mode-selector');
        if (modeSelector) modeSelector.style.display = 'none';
        const mainNav = document.querySelector('.main-navigation');
        if (mainNav) mainNav.style.display = 'none';
        const blog = document.getElementById('blog-main');
        if (blog) blog.style.display = 'none';

        // Offer Demo Mode for quick start
        this.injectDemoModeButton();
    }

    injectDemoModeButton() {
        // Demo mode button is now part of the HTML, so just ensure the function exists
        window.startDemoMode = () => this.signInDemo();
    }

    setupDemoModeButton() {
        const authCard = document.querySelector('.auth-card');
        if (authCard && !document.getElementById('demoModeBtn')) {
            const demoButton = document.createElement('button');
            demoButton.id = 'demoModeBtn';
            demoButton.className = 'btn-demo-mode';
            demoButton.innerHTML = '🎮 Try Demo Mode';
            demoButton.onclick = () => this.signInDemo();

            const existingButton = authCard.querySelector('.btn-google-signin');
            if (existingButton) {
                // Add separator and button after Google button
                const separator = document.createElement('div');
                separator.className = 'auth-separator';
                separator.innerHTML = '<span>or</span>';
                existingButton.parentNode.insertBefore(separator, existingButton.nextSibling);
                existingButton.parentNode.insertBefore(demoButton, separator.nextSibling);
            } else {
                authCard.appendChild(demoButton);
            }
        }
    }

    showGuestBanner() {
        if (document.getElementById('guestBanner')) return;
        const banner = document.createElement('div');
        banner.id = 'guestBanner';
        banner.style.cssText = 'margin:12px 0;padding:10px 12px;background:#fffbe6;border:1px solid #ffe58f;color:#614700;border-radius:8px;';
        banner.innerHTML = '👋 You are browsing in guest mode. Progress will not sync. Use <strong>Demo Mode</strong> for a quick start or <strong>Sign in</strong> to save your progress.';
        const container = document.querySelector('.container');
        if (container) container.insertBefore(banner, container.firstChild.nextSibling);
    }

    async signInDemo() {
        try {
            const response = await fetch('/auth/demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                this.currentUser = result.user;
                await this.loadUserStats();
                this.showAuthenticatedUI();
                await this.checkMySQLConnection();
                this.showDemoWelcome();
            } else {
                console.error('Demo login failed');
            }
        } catch (error) {
            console.error('Demo login error:', error);
        }
    }

    showDemoWelcome() {
        const welcome = document.createElement('div');
        welcome.className = 'demo-welcome-animation';
        welcome.innerHTML = `
            <div class="demo-content">
                <div class="demo-icon">🎮</div>
                <h2>Welcome to Demo Mode!</h2>
                <p>Experience all features with sample data</p>
                <small>Sign in with Google for real progress tracking</small>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        setTimeout(() => {
            welcome.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(welcome)) {
                    document.body.removeChild(welcome);
                }
            }, 500);
        }, 3000);
    }

    showAuthenticatedUI() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('userProfile').style.display = 'block';
        document.getElementById('gameStats').style.display = 'block';
        document.getElementById('dailyMissions').style.display = 'block';
        
        // Show mode selector and navigation now that user is authenticated
        const modeSelector = document.querySelector('.mode-selector');
        if (modeSelector) modeSelector.style.display = 'block';
        const mainNav = document.querySelector('.main-navigation');
        if (mainNav) mainNav.style.display = 'block';
        
        // Show roadmap and level list
        const roadmap = document.getElementById('roadmapHeader');
        if (roadmap) roadmap.style.display = 'block';
        const levels = document.getElementById('levelSelector');
        if (levels) levels.style.display = 'grid';
        
        // Remove guest banner
        const banner = document.getElementById('guestBanner');
        if (banner && banner.parentElement) banner.parentElement.removeChild(banner);

        // Update user profile
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userLevel').textContent = `Level ${this.currentUser.level || 1}`;
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.src = this.currentUser.avatar || '/assets/default-avatar.svg';
            avatar.onerror = () => { avatar.src = '/assets/default-avatar.svg'; };
        }
        
        this.loadDailyMissions();
        this.loadWeeklyQuest();
        this.checkStreakRecovery();
        this.showDailyReflectionPrompt();
    }

    async checkMySQLConnection() {
        try {
            const response = await fetch('/test-connection');
            const result = await response.json();
            
            if (!result.success) {
                this.showMySQLSetup();
            }
        } catch (error) {
            this.showMySQLSetup();
        }
    }

    showMySQLSetup() {
        document.getElementById('mysqlSetupSection').style.display = 'block';
        document.getElementById('roadmapHeader').style.display = 'none';
        document.getElementById('levelSelector').style.display = 'none';
    }

    hideMySQLSetup() {
        document.getElementById('mysqlSetupSection').style.display = 'none';
        document.getElementById('roadmapHeader').style.display = 'block';
        document.getElementById('levelSelector').style.display = 'grid';
    }

    updateStatsDisplay() {
        if (!this.userStats) return;

        document.getElementById('totalXP').textContent = this.userStats.total_xp || 0;
        document.getElementById('currentStreak').textContent = this.userStats.current_streak || 0;
        document.getElementById('streakShields').textContent = this.userStats.streak_shields || 0;
        document.getElementById('userLevel').textContent = `Level ${this.userStats.level || 1}`;
    }

    async loadDailyMissions() {
        try {
            const response = await fetch('/api/daily-missions');
            if (response.ok) {
                const missions = await response.json();
                this.displayDailyMissions(missions);
            }
        } catch (error) {
            console.error('Failed to load daily missions:', error);
        }
    }

    displayDailyMissions(missions) {
        const missionsList = document.getElementById('missionsList');
        if (!missions || !missions.question_1_id) {
            missionsList.innerHTML = '<p>Loading missions...</p>';
            return;
        }

        missionsList.innerHTML = `
            <div class="mission-item ${missions.completed_count >= 1 ? 'completed' : ''}">
                <span>📝 Mission 1: ${missions.question_1_id}</span>
                ${missions.completed_count >= 1 ? '<span class="mission-complete">✅</span>' : ''}
            </div>
            <div class="mission-item ${missions.completed_count >= 2 ? 'completed' : ''}">
                <span>📝 Mission 2: ${missions.question_2_id}</span>
                ${missions.completed_count >= 2 ? '<span class="mission-complete">✅</span>' : ''}
            </div>
            <div class="mission-item ${missions.completed_count >= 3 ? 'completed' : ''}">
                <span>📝 Mission 3: ${missions.question_3_id}</span>
                ${missions.completed_count >= 3 ? '<span class="mission-complete">✅</span>' : ''}
            </div>
            <div class="mission-progress">
                ${missions.completed_count}/3 completed today
            </div>
        `;
    }

    async loadWeeklyQuest() {
        try {
            const response = await fetch('/api/weekly-quest');
            if (response.ok) {
                const quest = await response.json();
                this.displayWeeklyQuest(quest);
            }
        } catch (error) {
            console.error('Failed to load weekly quest:', error);
        }
    }

    displayWeeklyQuest(quest) {
        const missionsElement = document.getElementById('dailyMissions');
        if (!quest) return;

        // Add weekly quest to missions display
        const weeklyQuestHtml = `
            <div class="weekly-quest">
                <h4>📅 Weekly Challenge</h4>
                <div class="quest-progress">
                    <span>Complete ${quest.missions_target} missions this week</span>
                    <div class="progress-bar mini">
                        <div class="progress-fill" style="width: ${(quest.missions_completed / quest.missions_target) * 100}%"></div>
                    </div>
                    <span>${quest.missions_completed}/${quest.missions_target}</span>
                </div>
            </div>
        `;
        
        missionsElement.insertAdjacentHTML('beforeend', weeklyQuestHtml);
    }

    async checkStreakRecovery() {
        try {
            const response = await fetch('/api/streak-recovery');
            if (response.ok) {
                const recovery = await response.json();
                if (recovery) {
                    this.showStreakRecoveryOption(recovery);
                }
            }
        } catch (error) {
            console.error('Failed to check streak recovery:', error);
        }
    }

    showStreakRecoveryOption(recovery) {
        const recoveryDiv = document.createElement('div');
        recoveryDiv.className = 'streak-recovery-popup';
        recoveryDiv.innerHTML = `
            <div class="recovery-content">
                <h3>🛡️ Comeback Quest Available!</h3>
                <p>Your ${recovery.broken_streak}-day streak was broken, but you can restore it!</p>
                <p>Complete <strong>5 missions</strong> within 48 hours to recover <strong>${Math.floor(recovery.broken_streak / 2)} days</strong> of your streak.</p>
                <div class="recovery-progress">
                    ${recovery.recovery_missions_completed}/5 missions completed
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(recovery.recovery_missions_completed / 5) * 100}%"></div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;

        document.body.appendChild(recoveryDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(recoveryDiv)) {
                document.body.removeChild(recoveryDiv);
            }
        }, 10000);
    }

    showDailyReflectionPrompt() {
        // Show reflection prompt at end of session (after 30 minutes or when closing)
        setTimeout(() => {
            this.promptDailyReflection();
        }, 30 * 60 * 1000); // 30 minutes

        // Also show on window beforeunload
        window.addEventListener('beforeunload', () => {
            this.promptDailyReflection();
        });
    }

    async promptDailyReflection() {
        try {
            const response = await fetch('/api/daily-reflection');
            const existingReflection = await response.json();
            
            if (!existingReflection) {
                const takeaway = prompt('🤔 What was your key takeaway from today\'s SQL learning?\n\n(This helps reinforce your learning and builds positive habits!)');
                
                if (takeaway && takeaway.trim()) {
                    await fetch('/api/daily-reflection', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ takeaway: takeaway.trim() })
                    });
                    
                    if (window.app && window.app.showFeedback) {
                        window.app.showFeedback('✅ Daily reflection saved! Great job reflecting on your learning.', 'success');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to handle daily reflection:', error);
        }
    }

    // Calculate XP based on difficulty and performance
    calculateXP(levelId, isCorrect, hintsUsed = 0) {
        if (!isCorrect) return 0;

        // Base XP: 10 points
        let xp = 10;
        
        // Difficulty multiplier based on level
        let difficultyMultiplier = 1;
        if (levelId <= 4) difficultyMultiplier = 1; // Beginner
        else if (levelId <= 10) difficultyMultiplier = 2; // Intermediate  
        else difficultyMultiplier = 3; // Advanced

        xp *= difficultyMultiplier;

        // Penalty for hints (reduce by 20% per hint)
        xp *= Math.pow(0.8, hintsUsed);

        // Session time bonus/penalty
        const sessionMinutes = (Date.now() - this.sessionStartTime) / (1000 * 60);
        if (sessionMinutes <= 25) {
            // Full XP for first 25 minutes
            xp *= 1.0;
        } else if (sessionMinutes <= 40) {
            // 50% XP between 25-40 minutes
            xp *= 0.5;
        } else {
            // 0% XP after 40 minutes
            xp = 0;
        }

        return Math.floor(xp);
    }

    // Track question attempts for fail-fast hints
    recordAnswer(levelId, questionId, isCorrect) {
        const questionKey = `${levelId}-${questionId}`;
        
        if (!isCorrect) {
            const currentCount = this.wrongAnswerCount.get(questionKey) || 0;
            this.wrongAnswerCount.set(questionKey, currentCount + 1);
            
            // Auto-reveal hint after 2 wrong answers
            if (currentCount + 1 >= 2) {
                this.showFailFastHint(levelId, questionId);
                return true; // Indicate hint was auto-shown
            }
        } else {
            // Reset count on correct answer
            this.wrongAnswerCount.delete(questionKey);
        }
        
        return false;
    }

    showFailFastHint(levelId, questionId) {
        // Award 5 XP for reading auto-revealed hint
        this.sessionXP += 5;
        
        // Show the hint automatically
        if (window.app && window.app.showHint) {
            window.app.showHint();
            window.app.showFeedback('💡 Hint auto-revealed after 2 incorrect attempts. +5 XP for reading!', 'info');
        }
    }

    // Check for variable rewards (20% chance per completed mission)
    async checkVariableRewards() {
        if (Math.random() < 0.2) { // 20% chance
            const rewardType = this.getRandomReward();
            await this.awardReward(rewardType);
        }
    }

    getRandomReward() {
        const rewards = ['insight_card', 'bonus_quiz', 'shield_fragment'];
        return rewards[Math.floor(Math.random() * rewards.length)];
    }

    async awardReward(rewardType) {
        let message = '';
        switch (rewardType) {
            case 'insight_card':
                message = '🎴 Insight Card earned! Check your collection for a SQL tip!';
                break;
            case 'bonus_quiz':
                message = '🎯 Bonus Quiz unlocked! Double XP if answered correctly!';
                break;
            case 'shield_fragment':
                message = '🛡️ Shield Fragment collected! Collect 2 to form a streak shield!';
                break;
        }
        
        if (window.app && window.app.showFeedback) {
            window.app.showFeedback(message, 'success');
        }
    }

    // Session end warning
    checkSessionTime() {
        const sessionMinutes = (Date.now() - this.sessionStartTime) / (1000 * 60);
        
        if (sessionMinutes >= 40) {
            if (window.app && window.app.showFeedback) {
                window.app.showFeedback("⏰ You're done for today. Come back tomorrow for fresh challenges!", 'info');
            }
            return true; // Session should end
        } else if (sessionMinutes >= 35) {
            if (window.app && window.app.showFeedback) {
                window.app.showFeedback("⚠️ 5 minutes remaining in today's session!", 'warning');
            }
        }
        
        return false;
    }

    async recordProgress(levelId, questionId, completed, hintsUsed = 0) {
        const xpEarned = this.calculateXP(levelId, completed, hintsUsed);
        
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
                this.sessionXP += xpEarned;
                if (completed) {
                    this.sessionQuestions += 1;
                    await this.checkVariableRewards();
                }
                
                // Reload user stats
                await this.loadUserStats();
            }
        } catch (error) {
            console.error('Failed to record progress:', error);
        }
    }
}

// Global authentication functions
window.authManager = new AuthManager();

window.signInWithGoogle = () => {
    window.location.href = '/auth/google';
};

// Global helper for demo mode button in HTML
window.startDemoMode = async () => {
    if (window.authManager && typeof window.authManager.signInDemo === 'function') {
        await window.authManager.signInDemo();
        // Navigate to game view
        if (window.gameRouter) {
            window.gameRouter.navigate('/');
        }
    }
};

window.logout = async () => {
    try {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

window.setupMySQL = async (event) => {
    event.preventDefault();
    
    const formData = {
        host: document.getElementById('mysqlHost').value,
        port: parseInt(document.getElementById('mysqlPort').value),
        user: document.getElementById('mysqlUser').value,
        password: document.getElementById('mysqlPassword').value,
        database: document.getElementById('mysqlDatabase').value
    };

    try {
        const response = await fetch('/setup-mysql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            authManager.hideMySQLSetup();
            if (window.app) {
                window.app.showFeedback('✅ MySQL setup completed successfully!', 'success');
            }
        } else {
            alert('MySQL setup failed: ' + result.message);
        }
    } catch (error) {
        console.error('MySQL setup error:', error);
        alert('MySQL setup failed: ' + error.message);
    }
};

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    authManager.init();
    
    // Setup MySQL form handler
    const mysqlForm = document.getElementById('mysqlSetupForm');
    if (mysqlForm) {
        mysqlForm.addEventListener('submit', setupMySQL);
    }
});
