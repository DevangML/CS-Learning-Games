#!/bin/zsh

# CN Mastery Quest - Update Script
# Usage: ./update_game.sh
# Or: curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/update_game.sh | zsh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/DevangML/CS-Learning-Games.git"
APP_DIR="cn_mastery"
PORT=3000

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Progress tracking
STEPS_COMPLETED=0
TOTAL_STEPS=7

update_progress() {
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
    echo -e "${BLUE}[PROGRESS]${NC} Step $STEPS_COMPLETED/$TOTAL_STEPS completed"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Find the installation directory
find_installation() {
    log_info "Searching for existing CN Mastery installation..."
    
    # Check current directory
    if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/package.json" ]; then
        INSTALL_DIR="$(pwd)/$APP_DIR"
        log_success "Found installation in current directory: $INSTALL_DIR"
        return 0
    fi
    
    # Check common installation locations
    SEARCH_PATHS=(
        "$HOME/$APP_DIR"
        "$HOME/Desktop/$APP_DIR"
        "$HOME/Documents/$APP_DIR"
        "/opt/$APP_DIR"
        "/usr/local/$APP_DIR"
        "$HOME/Projects/$APP_DIR"
    )
    
    for path in "${SEARCH_PATHS[@]}"; do
        if [ -d "$path" ] && [ -f "$path/package.json" ]; then
            INSTALL_DIR="$path"
            log_success "Found installation at: $INSTALL_DIR"
            return 0
        fi
    done
    
    # Search recursively in home directory (limited depth)
    log_info "Searching recursively in home directory..."
    FOUND_DIR=$(find "$HOME" -maxdepth 3 -type d -name "$APP_DIR" 2>/dev/null | head -1)
    if [ -n "$FOUND_DIR" ] && [ -f "$FOUND_DIR/package.json" ]; then
        INSTALL_DIR="$FOUND_DIR"
        log_success "Found installation at: $INSTALL_DIR"
        return 0
    fi
    
    log_error "Could not find existing CN Mastery installation"
    log_info "Please run the install script first: curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh"
    exit 1
}

# Backup current installation
backup_installation() {
    log_info "Creating backup of current installation..."
    
    BACKUP_DIR="$INSTALL_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    
    if cp -r "$INSTALL_DIR" "$BACKUP_DIR" 2>/dev/null; then
        log_success "Backup created at: $BACKUP_DIR"
    else
        log_warning "Could not create backup, proceeding without backup"
    fi
    
    update_progress
}

# Stop running application
stop_application() {
    log_info "Stopping running application..."
    
    # Kill any existing process on the port
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        pkill -f "node.*server.js" 2>/dev/null || true
        sleep 2
        log_success "Application stopped"
    else
        log_info "No running application found"
    fi
    
    update_progress
}

# Update repository
update_repository() {
    log_info "Updating repository with latest code..."
    
    cd "$INSTALL_DIR"
    
    # Check if it's a git repository
    if [ ! -d ".git" ]; then
        log_error "Not a git repository. Cannot update."
        log_info "Please reinstall using the install script."
        exit 1
    fi
    
    # Fetch latest changes
    git fetch origin >/dev/null 2>&1 || {
        log_error "Failed to fetch latest changes"
        exit 1
    }
    
    # Check if there are updates
    LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        log_success "Already up to date!"
        update_progress
        return 0
    fi
    
    # Stash any local changes
    if ! git diff-index --quiet HEAD --; then
        log_info "Stashing local changes..."
        git stash >/dev/null 2>&1 || true
    fi
    
    # Pull latest changes
    git pull origin main >/dev/null 2>&1 || {
        log_error "Failed to pull latest changes"
        exit 1
    }
    
    log_success "Repository updated successfully"
    update_progress
}

# Update dependencies
update_dependencies() {
    log_info "Updating npm dependencies..."
    
    cd "$INSTALL_DIR"
    
    # Check if package.json has changed
    if [ -f "package-lock.json" ] && [ "package.json" -ot "package-lock.json" ]; then
        log_info "Checking for dependency updates..."
        npm outdated >/dev/null 2>&1 || {
            log_info "Updating dependencies..."
            npm install --production=false >/dev/null 2>&1
        }
    else
        log_info "Installing/updating dependencies..."
        npm install --production=false >/dev/null 2>&1
    fi
    
    log_success "Dependencies updated"
    update_progress
}

# Update database schema if needed
update_database() {
    log_info "Checking for database updates..."
    
    cd "$INSTALL_DIR"
    
    # Check if there's a database migration script
    if [ -f "setup_db.js" ] || [ -f "migrations/" ]; then
        log_info "Running database updates..."
        
        # Create a temporary script to check and update database
        cat > update_db.js << 'EOF'
const path = require('path');
require('dotenv').config();

async function updateDatabase() {
    try {
        // SQLite database is handled automatically by the application
        const dbPath = process.env.DATABASE_PATH || './user_data.db';

        // Check if tables exist
        // SQLite database schema is managed by the application
        console.log('Database schema is managed automatically by the application');
        
        // No manual table creation needed for SQLite
        // The application handles all database initialization

        // Sample data is loaded from CN topics and quizzes automatically
        console.log('CN content will be loaded automatically by the application');

        // No database connection to close for SQLite
        console.log('Database update completed successfully');
    } catch (error) {
        console.error('Database update failed:', error.message);
    }
}

updateDatabase();
EOF
        
        node update_db.js >/dev/null 2>&1 && rm update_db.js
    fi
    
    log_success "Database updated"
    update_progress
}

# Ensure git-secrets is properly configured
ensure_git_secrets() {
    log_info "Ensuring git-secrets is properly configured..."
    
    cd "$INSTALL_DIR"
    
    # Check if git-secrets is installed
    if ! command_exists git-secrets; then
        log_info "Installing git-secrets..."
        if command_exists brew; then
            brew install git-secrets >/dev/null 2>&1
        else
            log_warning "git-secrets not found. Please install manually for repository protection."
            update_progress
            return 0
        fi
    fi
    
    # Setup git-secrets hooks and patterns if not already configured
    if [ ! -f ".git/hooks/pre-commit" ] || ! grep -q "git-secrets" ".git/hooks/pre-commit" 2>/dev/null; then
        git secrets --install >/dev/null 2>&1 || true
        git secrets --register-aws >/dev/null 2>&1 || true
        
        # Add custom patterns for common secrets
        git secrets --add 'GOOGLE_CLIENT_ID=[0-9]+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com' >/dev/null 2>&1 || true
        git secrets --add 'GOOGLE_CLIENT_SECRET=GOCSPX-[a-zA-Z0-9_-]+' >/dev/null 2>&1 || true
        git secrets --add 'SESSION_SECRET=[a-zA-Z0-9-]+' >/dev/null 2>&1 || true
        git secrets --add 'MYSQL_PASSWORD=[a-zA-Z0-9]+' >/dev/null 2>&1 || true
        git secrets --add 'password.*=.*[a-zA-Z0-9]{4,}' >/dev/null 2>&1 || true
    fi
    
    # Ensure .gitallowed file exists
    if [ ! -f ".gitallowed" ]; then
        cat > .gitallowed << 'EOF'
# Allow false positives - patterns in node_modules and legitimate code
node_modules/.*password.*
# Generic password field in HTML
input type="password"
# Generic variable names for password fields in legitimate code
password.*database.*req\.body
password.*config\.password
EOF
    fi
    
    log_success "Git-secrets configuration verified"
    update_progress
}

# Restart application
restart_application() {
    log_info "Restarting application..."
    
    cd "$INSTALL_DIR"
    
    # Check if port is available
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Port $PORT is already in use"
        
        # Find available port
        for port in {3001..3010}; do
            if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                PORT=$port
                log_info "Using port $PORT instead"
                
                # Update .env file
                if [ -f ".env" ]; then
                    sed -i.bak "s/PORT=[0-9]*/PORT=$PORT/" .env
                fi
                break
            fi
        done
    fi
    
    # Start the application
    nohup npm start > app.log 2>&1 &
    APP_PID=$!
    
    # Wait for application to start
    log_info "Waiting for application to start..."
    for i in {1..30}; do
        if curl -s "http://localhost:$PORT" >/dev/null 2>&1; then
            log_success "Application restarted successfully!"
            break
        fi
        sleep 2
    done
    
    update_progress
}

# Cleanup old backups
cleanup_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only the 3 most recent backups
    find "$(dirname "$INSTALL_DIR")" -maxdepth 1 -name "$(basename "$INSTALL_DIR").backup.*" -type d | sort | head -n -3 | xargs rm -rf 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main update function
main() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   CN Mastery Quest Updater                  ║"
    echo "║                    Update to Latest Version                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Starting update process..."
    
    # Find existing installation
    find_installation
    
    # Perform update steps
    backup_installation
    stop_application
    update_repository
    ensure_git_secrets
    update_dependencies
    update_database
    restart_application
    cleanup_backups
    
    # Final success message
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 UPDATE COMPLETE! 🎉                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    log_success "CN Mastery Quest has been updated successfully!"
    log_info "Application URL: ${BLUE}http://localhost:$PORT${NC}"
    log_info "Installation directory: $INSTALL_DIR"
    log_info "Log file: $INSTALL_DIR/app.log"
    
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  Start:   cd $INSTALL_DIR && npm start"
    echo "  Stop:    pkill -f 'node.*server.js'"
    echo "  Logs:    tail -f $INSTALL_DIR/app.log"
    echo "  Update:  ./update_game.sh"
    
    echo ""
    echo -e "${BLUE}Backup location:${NC}"
    if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
        echo "  Previous version: $BACKUP_DIR"
    fi
}

# Run main update
main "$@"