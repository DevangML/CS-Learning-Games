// Blog System for Theory Topics and Quizzes
class BlogSystem {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentTopic = null;
        this.currentQuiz = null;
        this.quizState = {
            currentQuestion: 0,
            score: 0,
            answers: [],
            startTime: null,
            timeRemaining: 0
        };
        this.init();
    }

    init() {
        this.setupRoutes();
        this.bindEvents();
    }

    setupRoutes() {
        // Add blog routes to the global router
        if (window.router) {
            window.router
                .route('/blog', this.showBlogHome.bind(this), {
                    title: 'SQL Theory Hub - SQL Mastery Quest'
                })
                .route('/blog/topic/:topicId', this.showTopic.bind(this), {
                    title: 'SQL Theory - SQL Mastery Quest'
                })
                .route('/blog/quiz/:quizId', this.showQuiz.bind(this), {
                    title: 'Theory Quiz - SQL Mastery Quest'
                })
                .route('/blog/quiz/:quizId/results', this.showQuizResults.bind(this), {
                    title: 'Quiz Results - SQL Mastery Quest'
                });
        }
    }

    bindEvents() {
        // Make functions globally accessible
        window.startQuiz = (quizId) => this.startQuiz(quizId);
        window.answerQuestion = (answerIndex) => this.answerQuestion(answerIndex);
        window.nextQuestion = () => this.nextQuestion();
        window.finishQuiz = () => this.finishQuiz();
        window.restartQuiz = () => this.restartQuiz();
    }

    // Show blog homepage with topic list
    async showBlogHome(context) {
        const mainContent = this.getMainContent();
        if (!mainContent) return;

        // Ensure theory-specific nav links are visible
        if (window.gameRouter && typeof window.gameRouter.setTheoryNavVisible === 'function') {
            window.gameRouter.setTheoryNavVisible(true);
        }

        const categories = this.groupTopicsByCategory();
        
        mainContent.innerHTML = `
            <div class="blog-container">
                <header class="blog-header">
                    <h1>📚 SQL Theory Hub</h1>
                    <p>Master DBMS concepts with interactive theory and quizzes</p>
                    <div class="blog-nav">
                        <button class="nav-btn active" data-section="theory">📖 Theory Topics</button>
                        <button class="nav-btn" data-section="quizzes">🎯 Practice Quizzes</button>
                        <a href="/game" class="nav-btn" data-route="/game">🎮 Back to Game</a>
                    </div>
                </header>

                <div class="blog-content">
                    <section id="theory-section" class="content-section active">
                        <h2>💡 Theory Topics</h2>
                        <div class="topic-grid">
                            ${Object.keys(categories).map(category => `
                                <div class="category-section">
                                    <h3>${category}</h3>
                                    <div class="topic-cards">
                                        ${categories[category].map(topic => `
                                            <div class="topic-card" onclick="window.router.navigate('/blog/topic/${topic.id}')">
                                                <div class="topic-header">
                                                    <h4>${topic.title}</h4>
                                                    <span class="difficulty-badge ${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
                                                </div>
                                                <p>${topic.description}</p>
                                                <div class="topic-meta">
                                                    <span>⏱️ ${topic.estimatedTime}</span>
                                                    <span>📝 ${topic.quiz.length} quiz questions</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section id="quizzes-section" class="content-section">
                        <h2>🎯 Practice Quizzes</h2>
                        <div class="quiz-grid">
                            ${Object.entries(window.THEORY_QUIZZES).map(([id, quiz]) => `
                                <div class="quiz-card" onclick="window.router.navigate('/blog/quiz/${id}')">
                                    <div class="quiz-header">
                                        <h4>${quiz.title}</h4>
                                        <span class="difficulty-badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
                                    </div>
                                    <div class="quiz-meta">
                                        <span>❓ ${quiz.questions.length} questions</span>
                                        <span>⏱️ ${Math.floor(quiz.timeLimit / 60)} min</span>
                                    </div>
                                    <div class="quiz-description">
                                        Test your knowledge on database design, ACID properties, normalization, and indexing.
                                    </div>
                                    <button class="start-quiz-btn" onclick="window.router.navigate('/blog/quiz/${id}')">Start Quiz</button>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `;

        // Add navigation functionality
        this.setupBlogNavigation();
    }

    // Show individual topic
    async showTopic(context) {
        const topicId = context.params.topicId;
        const topic = window.THEORY_TOPICS[Object.keys(window.THEORY_TOPICS).find(key => 
            window.THEORY_TOPICS[key].id === topicId
        )];
        
        if (!topic) {
            this.show404();
            return;
        }

        this.currentTopic = topic;
        const mainContent = this.getMainContent();
        if (!mainContent) return;

        if (window.gameRouter && typeof window.gameRouter.setTheoryNavVisible === 'function') {
            window.gameRouter.setTheoryNavVisible(true);
        }

        mainContent.innerHTML = `
            <div class="topic-container">
                <header class="topic-header">
                    <div class="breadcrumb">
                        <a href="/blog" data-route="/blog">📚 Theory Hub</a> / ${topic.title}
                    </div>
                    <div class="topic-title-section">
                        <h1>${topic.title}</h1>
                        <div class="topic-badges">
                            <span class="difficulty-badge ${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
                            <span class="category-badge">${topic.category}</span>
                            <span class="time-badge">⏱️ ${topic.estimatedTime}</span>
                        </div>
                    </div>
                </header>

                <div class="topic-content">
                    <div class="content-wrapper">
                        ${topic.content}
                    </div>
                    
                    <div class="topic-actions">
                        <button class="btn-primary quiz-btn" onclick="startTopicQuiz('${topicId}')">
                            🎯 Take Quiz (${topic.quiz.length} questions)
                        </button>
                        <a href="/blog" class="btn-secondary">← Back to Topics</a>
                    </div>
                </div>

                <!-- Embedded Topic Quiz -->
                <div id="topic-quiz" class="topic-quiz-section" style="display: none;">
                    <h3>🎯 Test Your Knowledge</h3>
                    <div id="quiz-content"></div>
                </div>
            </div>
        `;

        // Add topic-specific quiz functionality
        window.startTopicQuiz = (topicId) => this.startTopicQuiz(topicId);
    }

    // Show standalone quiz
    async showQuiz(context) {
        const quizId = context.params.quizId;
        const quiz = window.THEORY_QUIZZES[quizId];
        
        if (!quiz) {
            this.show404();
            return;
        }

        this.currentQuiz = quiz;
        const mainContent = this.getMainContent();
        if (!mainContent) return;

        if (window.gameRouter && typeof window.gameRouter.setTheoryNavVisible === 'function') {
            window.gameRouter.setTheoryNavVisible(true);
        }

        mainContent.innerHTML = `
            <div class="quiz-container">
                <header class="quiz-header">
                    <div class="breadcrumb">
                        <a href="/blog" data-route="/blog">📚 Theory Hub</a> / Quiz
                    </div>
                    <h1>${quiz.title}</h1>
                </header>

                <div class="quiz-start-screen" id="quiz-start">
                    <div class="quiz-info">
                        <div class="quiz-stats">
                            <div class="stat">
                                <span class="stat-number">${quiz.questions.length}</span>
                                <span class="stat-label">Questions</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">${Math.floor(quiz.timeLimit / 60)}</span>
                                <span class="stat-label">Minutes</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">${quiz.difficulty}</span>
                                <span class="stat-label">Difficulty</span>
                            </div>
                        </div>
                        
                        <div class="quiz-instructions">
                            <h3>Instructions:</h3>
                            <ul>
                                <li>Answer all questions within the time limit</li>
                                <li>Each question has one correct answer</li>
                                <li>You can review explanations after completion</li>
                                <li>Your progress will be saved</li>
                            </ul>
                        </div>
                        
                        <button class="btn-primary start-quiz-btn" onclick="startQuiz('${quizId}')">
                            🚀 Start Quiz
                        </button>
                    </div>
                </div>

                <div class="quiz-screen" id="quiz-active" style="display: none;">
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="quiz-progress-fill"></div>
                        </div>
                        <div class="quiz-meta">
                            <span id="question-counter">1 of ${quiz.questions.length}</span>
                            <span id="time-remaining">${Math.floor(quiz.timeLimit / 60)}:00</span>
                        </div>
                    </div>
                    
                    <div class="question-content" id="question-content">
                        <!-- Question will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    // Show quiz results
    async showQuizResults(context) {
        const mainContent = this.getMainContent();
        if (!mainContent || !this.quizState.answers.length) return;

        const totalQuestions = this.quizState.answers.length;
        const correctAnswers = this.quizState.score;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const grade = this.calculateGrade(percentage);

        mainContent.innerHTML = `
            <div class="quiz-results-container">
                <header class="results-header">
                    <div class="breadcrumb">
                        <a href="/blog" data-route="/blog">📚 Theory Hub</a> / Quiz Results
                    </div>
                    <h1>🎯 Quiz Results</h1>
                </header>

                <div class="results-summary">
                    <div class="score-circle">
                        <div class="score-number">${percentage}%</div>
                        <div class="score-label">${grade}</div>
                    </div>
                    
                    <div class="results-stats">
                        <div class="stat">
                            <span class="stat-number">${correctAnswers}</span>
                            <span class="stat-label">Correct</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${totalQuestions - correctAnswers}</span>
                            <span class="stat-label">Incorrect</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${totalQuestions}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                </div>

                <div class="question-review">
                    <h3>📋 Question Review</h3>
                    ${this.renderQuestionReview()}
                </div>

                <div class="results-actions">
                    <button class="btn-primary" onclick="restartQuiz()">🔄 Retake Quiz</button>
                    <a href="/blog" class="btn-secondary">← Back to Topics</a>
                </div>
            </div>
        `;
    }

    // Start a quiz
    startQuiz(quizId) {
        const quiz = window.THEORY_QUIZZES[quizId];
        if (!quiz) return;

        this.currentQuiz = quiz;
        this.quizState = {
            currentQuestion: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            timeRemaining: quiz.timeLimit
        };

        document.getElementById('quiz-start').style.display = 'none';
        document.getElementById('quiz-active').style.display = 'block';

        this.startQuizTimer();
        this.showQuestion();
    }

    // Start topic-specific quiz
    startTopicQuiz(topicId) {
        const topicKey = Object.keys(window.THEORY_TOPICS).find(key => 
            window.THEORY_TOPICS[key].id === topicId
        );
        const topic = window.THEORY_TOPICS[topicKey];
        
        if (!topic) return;

        // Create temporary quiz from topic questions
        this.currentQuiz = {
            title: `${topic.title} Quiz`,
            difficulty: topic.difficulty,
            timeLimit: topic.quiz.length * 60, // 1 minute per question
            questions: topic.quiz
        };

        this.quizState = {
            currentQuestion: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            timeRemaining: this.currentQuiz.timeLimit
        };

        document.getElementById('topic-quiz').style.display = 'block';
        document.getElementById('quiz-content').innerHTML = `
            <div class="quiz-active-content">
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="topic-quiz-progress-fill"></div>
                    </div>
                    <div class="quiz-meta">
                        <span id="topic-question-counter">1 of ${this.currentQuiz.questions.length}</span>
                        <span id="topic-time-remaining">${Math.floor(this.currentQuiz.timeLimit / 60)}:00</span>
                    </div>
                </div>
                <div class="question-content" id="topic-question-content">
                    <!-- Question will be populated here -->
                </div>
            </div>
        `;

        this.startQuizTimer(true);
        this.showQuestion(true);
    }

    // Show current question
    showQuestion(isTopicQuiz = false) {
        const question = this.currentQuiz.questions[this.quizState.currentQuestion];
        const contentId = isTopicQuiz ? 'topic-question-content' : 'question-content';
        const counterSelector = isTopicQuiz ? '#topic-question-counter' : '#question-counter';
        const progressSelector = isTopicQuiz ? '#topic-quiz-progress-fill' : '#quiz-progress-fill';
        
        const questionContent = document.getElementById(contentId);
        if (!questionContent) return;

        questionContent.innerHTML = `
            <div class="question">
                <h3>Question ${this.quizState.currentQuestion + 1}</h3>
                <p class="question-text">${question.question}</p>
                
                <div class="answer-options">
                    ${question.options.map((option, index) => `
                        <button class="answer-option" onclick="answerQuestion(${index})">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Update progress
        const progress = ((this.quizState.currentQuestion + 1) / this.currentQuiz.questions.length) * 100;
        const progressFill = document.querySelector(progressSelector);
        if (progressFill) progressFill.style.width = `${progress}%`;

        // Update counter
        const counter = document.querySelector(counterSelector);
        if (counter) counter.textContent = `${this.quizState.currentQuestion + 1} of ${this.currentQuiz.questions.length}`;
    }

    // Handle answer selection
    answerQuestion(answerIndex) {
        const question = this.currentQuiz.questions[this.quizState.currentQuestion];
        const isCorrect = answerIndex === question.correct;
        
        this.quizState.answers.push({
            questionIndex: this.quizState.currentQuestion,
            selectedAnswer: answerIndex,
            correct: isCorrect,
            explanation: question.explanation
        });

        if (isCorrect) {
            this.quizState.score++;
        }

        // Show feedback
        this.showAnswerFeedback(answerIndex, question);

        // Auto-advance after 2 seconds
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    // Show answer feedback
    showAnswerFeedback(selectedIndex, question) {
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            option.disabled = true;
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex) {
                option.classList.add('incorrect');
            } else {
                option.classList.add('disabled');
            }
        });

        // Show explanation
        const questionDiv = document.querySelector('.question');
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'answer-explanation';
        explanationDiv.innerHTML = `
            <p><strong>Explanation:</strong> ${question.explanation}</p>
        `;
        questionDiv.appendChild(explanationDiv);
    }

    // Move to next question or finish quiz
    nextQuestion() {
        this.quizState.currentQuestion++;
        
        if (this.quizState.currentQuestion < this.currentQuiz.questions.length) {
            this.showQuestion();
        } else {
            this.finishQuiz();
        }
    }

    // Finish quiz and show results
    finishQuiz() {
        clearInterval(this.timerInterval);
        
        // Navigate to results or show inline results for topic quizzes
        if (document.getElementById('topic-quiz-progress-fill')) {
            this.showInlineResults();
        } else {
            window.router.navigate('/blog/quiz/results');
        }
    }

    // Show inline results for topic quizzes
    showInlineResults() {
        const totalQuestions = this.quizState.answers.length;
        const correctAnswers = this.quizState.score;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const grade = this.calculateGrade(percentage);

        document.getElementById('quiz-content').innerHTML = `
            <div class="inline-results">
                <div class="results-header">
                    <h3>🎯 Quiz Complete!</h3>
                </div>
                
                <div class="results-summary-inline">
                    <div class="score-display">
                        <span class="score-large">${percentage}%</span>
                        <span class="grade-label">${grade}</span>
                    </div>
                    
                    <div class="score-breakdown">
                        <span>✅ ${correctAnswers} correct</span>
                        <span>❌ ${totalQuestions - correctAnswers} incorrect</span>
                    </div>
                </div>

                <div class="results-actions-inline">
                    <button class="btn-primary" onclick="location.reload()">🔄 Retake Quiz</button>
                    <button class="btn-secondary" onclick="document.getElementById('topic-quiz').style.display='none'">✨ Continue Reading</button>
                </div>
            </div>
        `;
    }

    // Start quiz timer
    startQuizTimer(isTopicQuiz = false) {
        const timerSelector = isTopicQuiz ? '#topic-time-remaining' : '#time-remaining';
        
        this.timerInterval = setInterval(() => {
            this.quizState.timeRemaining--;
            
            const minutes = Math.floor(this.quizState.timeRemaining / 60);
            const seconds = this.quizState.timeRemaining % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const timerElement = document.querySelector(timerSelector);
            if (timerElement) timerElement.textContent = timeStr;
            
            if (this.quizState.timeRemaining <= 0) {
                this.finishQuiz();
            }
        }, 1000);
    }

    // Calculate grade based on percentage
    calculateGrade(percentage) {
        if (percentage >= 90) return '🏆 Excellent';
        if (percentage >= 80) return '⭐ Great';
        if (percentage >= 70) return '👍 Good';
        if (percentage >= 60) return '📖 Fair';
        return '🔄 Needs Review';
    }

    // Render question review for results page
    renderQuestionReview() {
        return this.quizState.answers.map((answer, index) => {
            const question = this.currentQuiz.questions[answer.questionIndex];
            return `
                <div class="review-item ${answer.correct ? 'correct' : 'incorrect'}">
                    <div class="review-header">
                        <span class="question-number">Q${index + 1}</span>
                        <span class="result-icon">${answer.correct ? '✅' : '❌'}</span>
                    </div>
                    <div class="review-content">
                        <p class="review-question">${question.question}</p>
                        <p class="review-answer">
                            <strong>Your answer:</strong> ${question.options[answer.selectedAnswer]}
                        </p>
                        ${!answer.correct ? `
                            <p class="review-correct">
                                <strong>Correct answer:</strong> ${question.options[question.correct]}
                            </p>
                        ` : ''}
                        <p class="review-explanation">
                            <strong>Explanation:</strong> ${answer.explanation}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Setup blog navigation
    setupBlogNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn[data-section]');
        const sections = document.querySelectorAll('.content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.dataset.section;
                
                // Update active nav button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show corresponding section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${sectionId}-section`) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    // Group topics by category
    groupTopicsByCategory() {
        const categories = {};
        Object.values(window.THEORY_TOPICS).forEach(topic => {
            if (!categories[topic.category]) {
                categories[topic.category] = [];
            }
            categories[topic.category].push(topic);
        });
        return categories;
    }

    // Get main content area
    getMainContent() {
        // Hide game interface
        const gameArea = document.getElementById('gameArea');
        const levelSelector = document.getElementById('levelSelector');
        const dailyMissions = document.getElementById('dailyMissions');
        const roadmapHeader = document.getElementById('roadmapHeader');
        const modeSelector = document.querySelector('.mode-selector');
        const gameStats = document.getElementById('gameStats');
        const userProfile = document.getElementById('userProfile');
        
        if (gameArea) gameArea.style.display = 'none';
        if (levelSelector) levelSelector.style.display = 'none';
        if (dailyMissions) dailyMissions.style.display = 'none';
        if (roadmapHeader) roadmapHeader.style.display = 'none';
        if (modeSelector) modeSelector.style.display = 'none';
        if (gameStats) gameStats.style.display = 'none';
        if (userProfile) userProfile.style.display = 'none';

        // Ensure top navigation is visible in theory/practice hub
        const mainNav = document.querySelector('.main-navigation');
        if (mainNav) mainNav.style.display = 'block';

        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === '/blog' || 
                link.getAttribute('href') === '/blog' ||
                window.location.pathname.startsWith('/blog')) {
                link.classList.add('active');
            }
        });

        // Show or create blog container
        let blogContainer = document.getElementById('blog-main');
        if (!blogContainer) {
            blogContainer = document.createElement('div');
            blogContainer.id = 'blog-main';
            blogContainer.className = 'blog-main-content';
            document.querySelector('.container').appendChild(blogContainer);
        }
        
        blogContainer.style.display = 'block';
        return blogContainer;
    }

    // Show 404 page
    show404() {
        const mainContent = this.getMainContent();
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="error-page">
                <h1>404 - Topic Not Found</h1>
                <p>The requested theory topic could not be found.</p>
                <a href="/blog" class="btn-primary" data-route="/blog">← Back to Theory Hub</a>
            </div>
        `;
    }

    // Restart current quiz
    restartQuiz() {
        if (this.currentQuiz) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/blog/quiz/')) {
                const quizId = currentPath.split('/')[3];
                window.router.navigate(`/blog/quiz/${quizId}`);
            }
        }
    }
}

// Initialize blog system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth manager to be available
    const initBlog = () => {
        if (window.authManager) {
            window.blogSystem = new BlogSystem(window.authManager);
        } else {
            setTimeout(initBlog, 100);
        }
    };
    initBlog();
});

// Export for global access
window.BlogSystem = BlogSystem;
