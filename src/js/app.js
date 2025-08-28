// Main Application Logic
class SQLTutorApp {
    constructor() {
        this.gameState = null;
        this.currentMode = 11; // Default to essentials mode
        this.currentLevels = window.ESSENTIALS_LEVELS;
    }

    // Initialize Application
    async init() {
        // Initialize or reuse global auth manager to avoid duplicate instances
        if (window.authManager) {
            this.authManager = window.authManager;
            // If not initialized yet, initialize now
            if (!this.authManager.currentUser && typeof this.authManager.init === 'function') {
                await this.authManager.init();
            }
        } else {
            this.authManager = new AuthManager();
            await this.authManager.init();
            window.authManager = this.authManager;
        }

        // Initialize game state with auth manager reference
        this.gameState = new GameStateManager(this.authManager);
        window.gameStateManager = this.gameState; // Make available for auth manager

        // If authenticated, load stats/progress again now that game state exists
        if (this.authManager && this.authManager.currentUser) {
            await this.authManager.loadUserStats();
        }

        this.renderLevelSelector();
        this.bindEvents();
        this.updateProgressDisplay();
        SchemaViewer.renderSchema();
    }

    // Render Level Selection
    renderLevelSelector() {
        const levelSelector = document.getElementById('levelSelector');
        const roadmapHeader = document.getElementById('roadmapHeader');
        if (!levelSelector) return;
        
        levelSelector.innerHTML = '';
        
        // Show roadmap header with contextual message
        if (roadmapHeader) {
            roadmapHeader.style.display = 'block';
            this.updateRoadmapMessage();
        }

        const isAuthed = !!(this.authManager && this.authManager.currentUser);
        if (!isAuthed) {
            // Do not show actual levels when not logged in or in demo
            const placeholderCount = 6;
            for (let i = 0; i < placeholderCount; i++) {
                const card = document.createElement('div');
                card.className = 'level-card locked-level';
                card.innerHTML = `
                    <div class="level-header">
                        <h3>Level ${i + 1}</h3>
                        <span class="difficulty-badge" style="background-color: #9e9e9e;">Locked</span>
                    </div>
                    <p>Sign in or try Demo Mode to unlock levels.</p>
                    <div style="margin-top: 15px; color:#888;">
                        <small>🔒 Content hidden</small>
                    </div>
                `;
                levelSelector.appendChild(card);
            }
            return;
        }
        
        Object.keys(this.currentLevels).forEach(levelNum => {
            const level = this.currentLevels[levelNum];
            const levelNumber = parseInt(levelNum);
            const isCompleted = this.gameState.isLevelCompleted(levelNumber);
            const isUnlocked = this.isLevelUnlocked(levelNumber);
            const isNextLevel = this.getNextLevel() === levelNumber;
            
            const card = document.createElement('div');
            let cardClass = 'level-card';
            if (isCompleted) cardClass += ' completed';
            if (!isUnlocked) cardClass += ' locked-level';
            if (isNextLevel) cardClass += ' next-level-hint';
            
            card.className = cardClass;
            if (isUnlocked) {
                card.onclick = () => this.startLevel(levelNumber);
            }
            
            // Add difficulty badge color
            const difficultyColors = {
                'Beginner': '#4CAF50',
                'Intermediate': '#FF9800', 
                'Advanced': '#F44336',
                'Expert': '#9C27B0'
            };
            
            const difficultyColor = difficultyColors[level.difficulty] || '#757575';
            
            const lockedBadge = !isUnlocked ? '<div title="Complete the previous level to unlock" style="color:#888; margin-top:8px;">🔒 Locked</div>' : '';
            const nextHint = isNextLevel && isUnlocked && !isCompleted ? '<div style="color:#2e7d32; margin-top:8px;">👉 Start here</div>' : '';
            card.innerHTML = `
                <div class="level-header">
                    <h3>${level.title}</h3>
                    <span class="difficulty-badge" style="background-color: ${difficultyColor};">${level.difficulty}</span>
                </div>
                <p>${level.description}</p>
                <div style="margin-top: 15px;">
                    <small>📚 ${level.questions.length} challenges</small>
                    ${this.gameState.isLevelCompleted(parseInt(levelNum)) ? '<span style="float: right;">✅ Completed</span>' : ''}
                </div>
                ${lockedBadge}
                ${nextHint}
            `;
            levelSelector.appendChild(card);
        });
    }

    // Update roadmap message based on progress
    updateRoadmapMessage() {
        const messageElement = document.getElementById('roadmapMessage');
        if (!messageElement) return;

        const currentState = this.gameState.getCurrentState();
        const completedCount = currentState.completedLevels.size;
        const nextLevel = this.getNextLevel();
        
        let message = "";
        
        if (completedCount === 0) {
            message = "🚀 Start with Level 1 - Arithmetic Operators to begin your SQL journey!";
        } else if (completedCount < 3) {
            message = "📚 Great start! Master the basics with beginner-level concepts.";
        } else if (completedCount < 7) {
            message = "⚡ You're making progress! Ready for intermediate SQL challenges?";
        } else if (completedCount < 10) {
            message = "🔥 Advanced territory! You're becoming a SQL expert!";
        } else if (completedCount === 10) {
            message = "🎯 Final challenge! Master LeetCode patterns to complete your journey!";
        } else {
            message = "🏆 Congratulations! You've mastered all SQL concepts. You're now a SQL expert!";
        }

        messageElement.textContent = message;
    }

    // Check if a level is unlocked (autonomous progression)
    isLevelUnlocked(levelNumber) {
        // Level 1 is always unlocked
        if (levelNumber === 1) return true;
        
        // Each level requires the previous level to be completed
        return this.gameState.isLevelCompleted(levelNumber - 1);
    }

    // Get the next recommended level for autonomous UI
    getNextLevel() {
        const totalLevels = Object.keys(this.currentLevels).length;
        
        // Find first uncompleted level
        for (let i = 1; i <= totalLevels; i++) {
            if (!this.gameState.isLevelCompleted(i)) {
                return i;
            }
        }
        
        // All levels completed, suggest reviewing advanced levels
        return totalLevels;
    }

    // Calculate overall progress percentage
    getProgressPercentage() {
        const totalLevels = Object.keys(this.currentLevels).length;
        const completedLevels = this.gameState.getCurrentState().completedLevels.size;
        return Math.round((completedLevels / totalLevels) * 100);
    }

    // Start a specific level
    startLevel(levelNum) {
        this.gameState.setCurrentLevel(levelNum);
        
        document.getElementById('levelSelector').style.display = 'none';
        document.getElementById('gameArea').classList.add('active');
        
        SchemaViewer.renderSchema();
        this.loadQuestion();
    }

    // Load current question
    loadQuestion() {
        const currentState = this.gameState.getCurrentState();
        const level = this.currentLevels[currentState.currentLevel];
        const question = level.questions[currentState.currentQuestionIndex];
        
        document.getElementById('currentQuestion').textContent = question.question;
        document.getElementById('sqlInput').value = '';
        document.getElementById('resultArea').innerHTML = '';
        
        // Show concept explanation
        const conceptDiv = document.getElementById('conceptExplanation');
        if (question.concept) {
            document.getElementById('conceptTitle').textContent = question.concept.title;
            document.getElementById('conceptContent').textContent = question.concept.content;
            conceptDiv.style.display = 'block';
        } else {
            conceptDiv.style.display = 'none';
        }
    }

    // Switch between learning modes
    switchMode(mode) {
        this.currentMode = mode;
        if (mode === 11) {
            this.currentLevels = window.ESSENTIALS_LEVELS;
        } else if (mode === 'theory') {
            this.currentLevels = window.THEORY_LEVELS;
        } else {
            this.currentLevels = window.LEARNING_LEVELS;
        }
        
        // Update UI to show active mode
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = mode === 'theory' ? document.getElementById('theory-mode') : document.getElementById(`mode${mode}`);
        if (targetBtn) targetBtn.classList.add('active');
        
        // Reinitialize with new levels
        this.renderLevelSelector();
        this.updateProgressDisplay();
    }

    // Update progress display for current mode
    updateProgressDisplay() {
        const totalLevels = Object.keys(this.currentLevels).length;
        const completedLevels = this.gameState.getCurrentState().completedLevels.size;
        const progressPercentage = Math.round((completedLevels / totalLevels) * 100);

        const progressBarEl = document.getElementById('progressBar');
        if (progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;

        const progressTextEl = document.getElementById('progressText');
        if (progressTextEl) progressTextEl.textContent = `${progressPercentage}% Complete`;

        const nextLevelEl = document.getElementById('nextLevel');
        if (nextLevelEl) nextLevelEl.textContent = `Level ${this.getNextLevel()}`;

        // Stats like totalXP and currentStreak are handled by AuthManager.updateStatsDisplay()
    }

    // Bind event handlers
    bindEvents() {
        // Make functions globally accessible for onclick handlers
        window.checkAnswer = () => this.checkAnswer();
        window.showHint = () => this.showHint();
        window.showSolution = () => this.showSolution();
        window.clearQuery = () => this.clearQuery();
        window.nextQuestion = () => this.nextQuestion();
        window.goBack = () => this.goBack();
        window.resetProgress = () => this.resetProgress();
        window.switchMode = (mode) => this.switchMode(mode);
    }
    
    // Calculate XP based on level difficulty and hints used
    calculateXP(levelId, isCorrect, hintsUsed = 0) {
        if (!isCorrect) return 0;
        
        let baseXP = 10;
        let difficultyMultiplier = 1;
        
        // Determine difficulty multiplier based on level
        if (levelId <= 4) difficultyMultiplier = 1; // Beginner
        else if (levelId <= 10) difficultyMultiplier = 2; // Intermediate  
        else difficultyMultiplier = 3; // Advanced
        
        let xp = baseXP * difficultyMultiplier;
        
        // Reduce XP for hints used (20% reduction per hint)
        for (let i = 0; i < hintsUsed; i++) {
            xp = Math.floor(xp * 0.8);
        }
        
        return Math.max(1, xp); // Minimum 1 XP
    }

    // Check user's answer
    async checkAnswer() {
        const userQuery = document.getElementById('sqlInput').value.trim();
        const currentState = this.gameState.getCurrentState();
        const level = this.currentLevels[currentState.currentLevel];
        const question = level.questions[currentState.currentQuestionIndex];
        
        if (!userQuery) {
            this.showFeedback('Please enter a SQL query!', 'error');
            return;
        }

        // Check session time limit
        if (window.authManager && window.authManager.checkSessionTime()) {
            return; // Session ended
        }
        
        // If MySQL is not configured, guide user to setup instead of failing
        const mysqlSetupVisible = document.getElementById('mysqlSetupSection') &&
            document.getElementById('mysqlSetupSection').style.display !== 'none';
        if (mysqlSetupVisible) {
            this.showFeedback('⚙️ Please set up your MySQL connection first (see the setup section above).', 'warning');
            if (this.authManager && typeof this.authManager.showMySQLSetup === 'function') {
                this.authManager.showMySQLSetup();
            }
            return;
        }

        // Execute query against MySQL database
        try {
            const response = await fetch('/execute-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: userQuery, expectedQuery: question.solution })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Prefer server-side result comparison when available
                let isCorrect = false;
                if (result.comparison && typeof result.comparison.matches === 'boolean') {
                    isCorrect = result.comparison.matches;
                } else {
                    // Fallback heuristic
                    const normalizedUser = this.normalizeQuery(userQuery);
                    const normalizedSolution = this.normalizeQuery(question.solution);
                    isCorrect = this.checkQueryCorrectness(normalizedUser, normalizedSolution, question);
                }
                
                // Record answer for fail-fast hints
                let autoHintShown = false;
                if (window.authManager) {
                    autoHintShown = window.authManager.recordAnswer(currentState.currentLevel, currentState.currentQuestionIndex, isCorrect);
                }
                
                if (isCorrect) {
                    const xpEarned = this.calculateXP(currentState.currentLevel, true, currentState.hintsUsed);
                    this.gameState.updateScore(xpEarned);
                    this.gameState.updateStreak(true);
                    this.showFeedback('🎉 Excellent! Your query is correct!', 'success');
                
                    // Save progress to database
                    await this.gameState.saveQuestionProgress(
                        currentState.currentLevel,
                        currentState.currentQuestionIndex,
                        true,
                        xpEarned,
                        currentState.hintsUsed
                    );
                } else {
                    this.gameState.updateStreak(false);
                    if (!autoHintShown) {
                        this.showFeedback('❌ Not quite right. Try again!', 'error');
                    }
                    
                    // Record failed attempt
                    await this.gameState.saveQuestionProgress(
                        currentState.currentLevel,
                        currentState.currentQuestionIndex,
                        false,
                        0,
                        currentState.hintsUsed
                    );
                }
                
                // Show actual query results
                this.showQueryResults(result, question.solution);
            
                this.checkAchievements();
            } else {
                this.showFeedback(`❌ Query failed: ${result.message}`, 'error');
            }
            
        } catch (error) {
            console.error('Error executing query:', error);
            this.showFeedback('❌ Connection error. Please check your setup.', 'error');
        }
    }

    // Show hint
    showHint() {
        const currentState = this.gameState.getCurrentState();
        const level = this.currentLevels[currentState.currentLevel];
        const question = level.questions[currentState.currentQuestionIndex];
        
        this.gameState.useHint();
        this.showFeedback(`💡 Hint: ${question.hint}`, 'info');
    }

    // Show solution
    showSolution() {
        const currentState = this.gameState.getCurrentState();
        const level = this.currentLevels[currentState.currentLevel];
        const question = level.questions[currentState.currentQuestionIndex];
        
        document.getElementById('sqlInput').value = question.solution;
        this.showFeedback(`🔍 Solution revealed: ${question.solution}`, 'info');
    }

    // Clear the query input
    clearQuery() {
        document.getElementById('sqlInput').value = '';
        document.getElementById('resultArea').innerHTML = '';
    }

    // Next question
    nextQuestion() {
        const currentState = this.gameState.getCurrentState();
        const level = this.currentLevels[currentState.currentLevel];
        
        if (currentState.currentQuestionIndex < level.questions.length - 1) {
            this.gameState.nextQuestion();
            this.loadQuestion();
        } else {
            // Level completed
            this.gameState.completeLevel(currentState.currentLevel);
            this.showFeedback(`🏆 Level completed! Great job mastering ${level.title}!`, 'success');
            
            setTimeout(() => {
                this.goBack();
            }, 2000);
        }
    }

    // Go back to level selection
    goBack() {
        document.getElementById('levelSelector').style.display = 'grid';
        document.getElementById('gameArea').classList.remove('active');
        this.renderLevelSelector();
    }

    // Reset progress
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.gameState.resetProgress();
            this.goBack();
        }
    }

    // Utility methods
    normalizeQuery(query) {
        return query.toLowerCase()
                   .replace(/\s+/g, ' ')
                   .replace(/;/g, '')
                   .trim();
    }

    checkQueryCorrectness(userQuery, solutionQuery, question) {
        // Remove extra whitespace and semicolons for comparison
        const cleanUser = userQuery.replace(/\s+/g, ' ').replace(/;+$/, '').trim();
        const cleanSolution = solutionQuery.replace(/\s+/g, ' ').replace(/;+$/, '').trim();
        
        // Exact match (most accurate)
        if (cleanUser === cleanSolution) {
            return true;
        }
        
        // Check for key components based on question type
        return this.checkQueryComponents(cleanUser, cleanSolution, question);
    }

    checkQueryComponents(userQuery, solutionQuery, question) {
        const questionText = question.question.toLowerCase();
        
        // Basic SELECT queries
        if (questionText.includes('retrieve all') || questionText.includes('get all')) {
            return userQuery.includes('select * from') || 
                   (userQuery.includes('select') && userQuery.includes('from'));
        }
        
        // WHERE clause queries
        if (questionText.includes('where') || questionText.includes('filter') || 
            questionText.includes('department_id') || questionText.includes('salary >')) {
            return userQuery.includes('where') && 
                   this.checkConditionPresence(userQuery, solutionQuery);
        }
        
        // Default: require basic SELECT structure
        return userQuery.includes('select') && userQuery.includes('from');
    }

    checkConditionPresence(userQuery, solutionQuery) {
        // Extract comparison operators and values
        const operators = ['=', '>', '<', '>=', '<=', '!=', '<>', 'like', 'in', 'between'];
        const userHasOperator = operators.some(op => userQuery.includes(op));
        const solutionHasOperator = operators.some(op => solutionQuery.includes(op));
        
        return userHasOperator === solutionHasOperator;
    }

    showFeedback(message, type) {
        const resultArea = document.getElementById('resultArea');
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        resultArea.appendChild(feedback);
    }

    showQueryResults(result, expectedQuery) {
        const resultArea = document.getElementById('resultArea');
        
        // Show query execution info
        const info = document.createElement('div');
        info.className = 'feedback info';
        info.innerHTML = `<strong>Query Results:</strong> ${result.rowCount} rows returned`;
        resultArea.appendChild(info);
        
        // Create results table
        if (result.results && result.results.length > 0) {
            const table = document.createElement('table');
            table.className = 'result-table';
            
            // Create header row
            const headers = Object.keys(result.results[0]);
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            
            // Create data rows
            result.results.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header] || '';
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            
            resultArea.appendChild(table);
        }
        
        // Show comparison if available
        if (result.comparison) {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.className = `feedback ${result.comparison.matches ? 'success' : 'warning'}`;
            
            if (result.comparison.matches) {
                comparisonDiv.innerHTML = '✅ <strong>Perfect Match!</strong> Your result matches the expected output exactly.';
            } else {
                comparisonDiv.innerHTML = '⚠️ <strong>Result Analysis:</strong> Your query executed successfully but the results differ from expected:';
                if (result.comparison.differences.length > 0) {
                    const diffList = document.createElement('ul');
                    result.comparison.differences.forEach(diff => {
                        const li = document.createElement('li');
                        li.textContent = diff;
                        diffList.appendChild(li);
                    });
                    comparisonDiv.appendChild(diffList);
                }
            }
            resultArea.appendChild(comparisonDiv);
        }

        // Authentic Knowledge note
        if (window.KnowledgeGuard && window.KnowledgeGuard.enforce && result.comparison) {
            const authDiv = document.createElement('div');
            const ok = window.KnowledgeGuard.isSqlAnswerVerified(result);
            authDiv.className = `feedback ${ok ? 'info' : 'warning'}`;
            authDiv.textContent = ok
                ? '🔎 Authentic Knowledge: Verified by canonical execution.'
                : '🔎 Authentic Knowledge: Not verified — revise your query and compare again.';
            resultArea.appendChild(authDiv);
        }
    }

    checkAchievements() {
        const currentState = this.gameState.getCurrentState();
        
        if (currentState.streak === 3 && !currentState.achievements.includes('streak_3')) {
            this.showAchievement('🔥 Hot Streak! 3 correct answers in a row!');
            this.gameState.addAchievement('streak_3');
        }
        
        if (currentState.score >= 100 && !currentState.achievements.includes('score_100')) {
            this.showAchievement('💯 Century! You reached 100 points!');
            this.gameState.addAchievement('score_100');
        }
        
        if (currentState.completedLevels.size === 3 && !currentState.achievements.includes('level_3')) {
            this.showAchievement('🎓 SQL Student! Completed 3 levels!');
            this.gameState.addAchievement('level_3');
        }
    }

    showAchievement(message) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement';
        achievement.textContent = message;
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            achievement.remove();
        }, 4000);
    }
}

// Intentionally no auto-init here. index.html initializes the app once on DOMContentLoaded.
