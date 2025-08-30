// Game Router - Handle navigation between game modes and blog
class GameRouter {
    constructor() {
        this.setupGameRoutes();
        this.bindNavigationEvents();
    }

    // Show/hide Theory nav links in top bar
    setTheoryNavVisible(visible) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const route = link.getAttribute('data-route') || link.getAttribute('href') || '';
            if (route.startsWith('/blog')) {
                link.style.display = visible ? '' : 'none';
            }
        });
    }

    setupGameRoutes() {
        // Add game-specific routes
        if (window.router) {
            window.router
                .route('/', this.showGame.bind(this), {
                    title: 'SQL Mastery Quest - Interactive SQL Learning'
                })
                .route('/game', this.showGame.bind(this), {
                    title: 'SQL Mastery Quest - Practice Levels'
                });
        }
    }

    bindNavigationEvents() {
        // Handle navigation link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route') || link.getAttribute('href');
                this.navigate(route);
            }
        });
    }

    // Show main game interface
    async showGame(context = {}) {
        // Hide blog content
        const blogContainer = document.getElementById('blog-main');
        if (blogContainer) blogContainer.style.display = 'none';

        // Show game interface
        const gameArea = document.getElementById('gameArea');
        const levelSelector = document.getElementById('levelSelector');
        const dailyMissions = document.getElementById('dailyMissions');
        const roadmapHeader = document.getElementById('roadmapHeader');
        const modeSelector = document.querySelector('.mode-selector');
        const gameStats = document.getElementById('gameStats');
        const userProfile = document.getElementById('userProfile');

        if (levelSelector) levelSelector.style.display = 'grid';
        if (dailyMissions) dailyMissions.style.display = 'block';
        if (roadmapHeader) roadmapHeader.style.display = 'block';
        if (modeSelector) modeSelector.style.display = 'block';
        if (gameStats) gameStats.style.display = 'block';
        if (userProfile) userProfile.style.display = 'block';
        if (gameArea && gameArea.classList.contains('active')) {
            gameArea.style.display = 'block';
        } else if (gameArea) {
            gameArea.style.display = 'none';
        }

        // Update navigation active state
        this.updateNavigation('/');

        // Hide theory-specific nav links in practice modes
        this.setTheoryNavVisible(false);

        // Ensure game is initialized
        if (window.app) {
            window.app.renderLevelSelector();
        }
    }

    // Navigate to route
    navigate(route) {
        if (route === '/' || route === '/game') {
            this.showGame();
        } else if (window.router) {
            window.router.navigate(route);
        }
    }

    // Update navigation active states
    updateNavigation(activeRoute) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('data-route') || link.getAttribute('href');
            if (linkRoute === activeRoute || 
                (activeRoute === '/' && (linkRoute === '/' || linkRoute === '/game'))) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize game router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameRouter = new GameRouter();
});

// Export for global access
window.GameRouter = GameRouter;
// moved to public/src for Next.js
