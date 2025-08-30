// Smooth User Onboarding Experience
class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isFirstTime = false;
    }

    async init() {
        // Check if user is first-time visitor
        this.isFirstTime = !localStorage.getItem('sql_quest_visited');
        
        if (this.isFirstTime) {
            await this.startOnboarding();
        }
    }

    async startOnboarding() {
        // Mark as visited
        localStorage.setItem('sql_quest_visited', 'true');
        
        // Create onboarding overlay
        this.createOnboardingOverlay();
        
        // Start with welcome step
        this.showStep(0);
    }

    createOnboardingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'onboardingOverlay';
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-modal">
                <div class="onboarding-progress">
                    <div class="progress-dots">
                        ${Array.from({length: this.totalSteps}, (_, i) => 
                            `<div class="dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="onboarding-content" id="onboardingContent">
                    <!-- Dynamic content will be inserted here -->
                </div>
                <div class="onboarding-controls">
                    <button id="skipOnboarding" class="btn-skip">Skip Tour</button>
                    <div class="nav-buttons">
                        <button id="prevStep" class="btn-nav" disabled>Previous</button>
                        <button id="nextStep" class="btn-nav btn-primary">Next</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.bindOnboardingEvents();
    }

    bindOnboardingEvents() {
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());
        document.getElementById('skipOnboarding').addEventListener('click', () => this.skipOnboarding());
    }

    showStep(stepIndex) {
        this.currentStep = stepIndex;
        const content = document.getElementById('onboardingContent');
        const steps = this.getOnboardingSteps();
        
        // Update progress dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === stepIndex);
            dot.classList.toggle('completed', index < stepIndex);
        });
        
        // Update navigation buttons
        document.getElementById('prevStep').disabled = stepIndex === 0;
        const nextButton = document.getElementById('nextStep');
        nextButton.textContent = stepIndex === this.totalSteps - 1 ? 'Get Started!' : 'Next';
        
        // Animate content change
        content.style.opacity = '0';
        content.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            content.innerHTML = steps[stepIndex];
            content.style.opacity = '1';
            content.style.transform = 'translateX(0)';
        }, 200);
    }

    getOnboardingSteps() {
        return [
            `<div class="onboarding-step">
                <div class="step-icon">🚀</div>
                <h2>Welcome to SQL Mastery Quest!</h2>
                <p>Embark on an epic journey to master SQL through interactive challenges, daily missions, and gamified learning.</p>
                <div class="feature-highlights">
                    <div class="highlight">✨ Interactive SQL Challenges</div>
                    <div class="highlight">🏆 XP & Level Progression</div>
                    <div class="highlight">🎯 Daily Missions</div>
                    <div class="highlight">🔥 Streak System</div>
                </div>
            </div>`,
            
            `<div class="onboarding-step">
                <div class="step-icon">🔐</div>
                <h2>Sign In for Progress Tracking</h2>
                <p>Sign in with Google to save your progress, maintain streaks, and compete on leaderboards!</p>
                <div class="onboarding-demo">
                    <div class="demo-auth-button">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
                        Sign in with Google
                    </div>
                    <div class="demo-arrow">↓</div>
                    <div class="demo-features">
                        <div class="demo-item">📊 Progress Saved</div>
                        <div class="demo-item">🔥 Streaks Maintained</div>
                        <div class="demo-item">🎮 Achievements Unlocked</div>
                    </div>
                </div>
            </div>`,
            
            `<div class="onboarding-step">
                <div class="step-icon">🎯</div>
                <h2>Daily Missions & Streaks</h2>
                <p>Complete 3 daily missions to build your streak and earn rewards. Use streak shields to protect your progress!</p>
                <div class="missions-preview">
                    <div class="mission-item-demo">📝 Query Basic SELECT statements</div>
                    <div class="mission-item-demo">📝 Practice JOIN operations</div>
                    <div class="mission-item-demo">📝 Master aggregate functions</div>
                    <div class="streak-demo">
                        <span class="streak-number">7</span>
                        <span class="streak-fire">🔥</span>
                        <span class="shield-count">🛡️ x1</span>
                    </div>
                </div>
            </div>`,
            
            `<div class="onboarding-step">
                <div class="step-icon">📚</div>
                <h2>Choose Your Learning Path</h2>
                <p>Select between Essentials (11 levels) for quick mastery or Complete (23 levels) for comprehensive learning.</p>
                <div class="path-preview">
                    <div class="path-option">
                        <div class="path-icon">📚</div>
                        <div class="path-name">Essentials</div>
                        <div class="path-desc">Core concepts, 11 levels</div>
                    </div>
                    <div class="path-vs">VS</div>
                    <div class="path-option">
                        <div class="path-icon">🎓</div>
                        <div class="path-name">Complete</div>
                        <div class="path-desc">Full mastery, 23 levels</div>
                    </div>
                </div>
            </div>`
        ];
    }

    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeOnboarding();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    skipOnboarding() {
        this.completeOnboarding();
    }

    completeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            this.showWelcomeAnimation();
        }, 300);
    }

    showWelcomeAnimation() {
        // Create welcome animation
        const welcome = document.createElement('div');
        welcome.className = 'welcome-animation';
        welcome.innerHTML = `
            <div class="welcome-content">
                <h1>🎮 Ready to Master SQL?</h1>
                <p>Your journey begins now!</p>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        // Remove after animation
        setTimeout(() => {
            welcome.style.opacity = '0';
            setTimeout(() => document.body.removeChild(welcome), 500);
        }, 2500);
    }

    // Progressive enhancement for user experience
    static enhanceElements() {
        // Add smooth transitions to all interactive elements
        document.querySelectorAll('button, .level-card, .mission-item').forEach(el => {
            el.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });

        // Add hover effects to cards
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });

        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}

// Auto-start onboarding when page loads
document.addEventListener('DOMContentLoaded', () => {
    const onboarding = new OnboardingManager();
    
    // Delay onboarding slightly to let auth check complete
    setTimeout(() => {
        onboarding.init();
        OnboardingManager.enhanceElements();
    }, 1000);
});

window.onboardingManager = new OnboardingManager();
// moved to public/src for Next.js
