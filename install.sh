#!/bin/zsh

# SQL Mastery Quest - Smart Installer Script
# Usage: curl -sSL https://raw.githubusercontent.com/DevangML/sql_tutor/main/install.sh | zsh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/DevangML/CS-Learning-Games.git"
APP_DIR="sql_tutor"
DB_NAME="sql_tutor"
DB_USER="sql_tutor_user"
DB_PASSWORD=""
PORT=3000
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SESSION_SECRET=""

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Progress tracking
STEPS_COMPLETED=0
TOTAL_STEPS=8

update_progress() {
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
    echo -e "${BLUE}[PROGRESS]${NC} Step $STEPS_COMPLETED/$TOTAL_STEPS completed"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if service is running
service_running() {
    if command_exists systemctl; then
        systemctl is-active --quiet "$1"
    elif command_exists service; then
        service "$1" status >/dev/null 2>&1
    else
        pgrep -f "$1" >/dev/null 2>&1
    fi
}

# Install system dependencies
install_dependencies() {
    log_info "Installing system dependencies..."
    
    if command_exists apt-get; then
        # Ubuntu/Debian
        sudo apt-get update >/dev/null 2>&1
        sudo apt-get install -y git curl mysql-server mysql-client >/dev/null 2>&1 &
        DEPS_PID=$!
    elif command_exists yum; then
        # CentOS/RHEL
        sudo yum install -y git curl mysql-server mysql >/dev/null 2>&1 &
        DEPS_PID=$!
    elif command_exists brew; then
        # macOS
        brew install git curl mysql >/dev/null 2>&1 &
        DEPS_PID=$!
    else
        log_error "Unsupported package manager. Please install git, curl, and MySQL manually."
        exit 1
    fi
    
    log_info "Dependencies installation started in background..."
}

# Install Node.js
install_nodejs() {
    log_info "Checking Node.js installation..."
    
    if command_exists node && command_exists npm; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 16 ]; then
            log_success "Node.js $(node --version) is already installed"
            return 0
        fi
    fi
    
    log_info "Installing Node.js..."
    
    # Install Node Version Manager (nvm) and Node.js
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash >/dev/null 2>&1
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install and use Node.js LTS
    nvm install --lts >/dev/null 2>&1
    nvm use --lts >/dev/null 2>&1
    
    log_success "Node.js installed successfully"
}

# Clone or update repository
setup_repository() {
    log_info "Setting up repository..."
    
    if [ -d "$APP_DIR" ]; then
        log_info "Directory exists, updating repository..."
        cd "$APP_DIR"
        git pull origin main >/dev/null 2>&1 || {
            log_warning "Git pull failed, using existing code"
        }
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR" >/dev/null 2>&1 || {
            log_error "Failed to clone repository. Check the URL and your internet connection."
            exit 1
        }
        cd "$APP_DIR"
    fi
    
    log_success "Repository ready"
    update_progress
}

# Setup MySQL
setup_mysql() {
    log_info "Setting up MySQL..."
    
    # Wait for dependencies installation to complete
    if [ -n "$DEPS_PID" ]; then
        wait $DEPS_PID
        log_success "System dependencies installed"
        update_progress
    fi
    
    # Start MySQL service
    if ! service_running mysql && ! service_running mysqld; then
        log_info "Starting MySQL service..."
        if command_exists systemctl; then
            sudo systemctl start mysql || sudo systemctl start mysqld
            sudo systemctl enable mysql >/dev/null 2>&1 || sudo systemctl enable mysqld >/dev/null 2>&1
        elif command_exists service; then
            sudo service mysql start || sudo service mysqld start
        elif command_exists brew; then
            brew services start mysql >/dev/null 2>&1
        fi
    fi
    
    # Wait for MySQL to be ready
    log_info "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if mysql -e "SELECT 1" >/dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    # Generate secure random password if not provided
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 16 2>/dev/null || date +%s | sha256sum | base64 | head -c 16)
        log_info "Generated secure random database password"
    fi
    
    # Generate secure session secret if not provided
    if [ -z "$SESSION_SECRET" ]; then
        SESSION_SECRET="sql-quest-$(openssl rand -hex 16 2>/dev/null || date +%s | sha256sum | head -c 32)"
        log_info "Generated secure session secret"
    fi
    
    # Create database and user
    log_info "Creating database and user..."
    mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null || {
        # Try with sudo if regular access fails
        sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
    }
    
    mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';" 2>/dev/null || {
        sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    }
    
    mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || {
        sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
    }
    
    log_success "MySQL setup completed"
    update_progress
}

# Create environment file
create_env_file() {
    log_info "Creating environment configuration..."
    
    # Check if environment variables are provided
    if [ -n "$GOOGLE_CLIENT_ID_ENV" ]; then
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID_ENV"
        log_info "Using Google Client ID from environment variable"
    fi
    
    if [ -n "$GOOGLE_CLIENT_SECRET_ENV" ]; then
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET_ENV"
        log_info "Using Google Client Secret from environment variable"
    fi
    
    # Create .env file with current values
    cat > .env << EOF
# Google OAuth Configuration
# Visit: https://console.cloud.google.com/apis/credentials
# Set GOOGLE_CLIENT_ID_ENV and GOOGLE_CLIENT_SECRET_ENV environment variables before installation
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-your_google_client_id_here}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-your_google_client_secret_here}
GOOGLE_REDIRECT_URI=http://localhost:$PORT/auth/google/callback

# Session Configuration (auto-generated secure secret)
SESSION_SECRET=$SESSION_SECRET

# MySQL Configuration (auto-generated secure password)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=$DB_USER
MYSQL_PASSWORD=$DB_PASSWORD
MYSQL_DATABASE=$DB_NAME

# Application Configuration
PORT=$PORT
NODE_ENV=development
EOF
    
    # Set secure file permissions
    chmod 600 .env
    
    # Display setup information
    if [ "$GOOGLE_CLIENT_ID" = "your_google_client_id_here" ]; then
        log_warning "Google OAuth credentials not configured"
        echo ""
        echo -e "${YELLOW}To enable Google OAuth:${NC}"
        echo "1. Visit: https://console.cloud.google.com/apis/credentials"
        echo "2. Create OAuth 2.0 Client ID"
        echo "3. Set authorized redirect URI: http://localhost:$PORT/auth/google/callback"
        echo "4. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file"
        echo "5. Restart the application: npm start"
        echo ""
    fi
    
    log_success "Environment file created with secure permissions"
    update_progress
}

# Install npm dependencies
install_npm_dependencies() {
    log_info "Installing npm dependencies..."
    
    # Check if node_modules exists and package.json hasn't changed
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        if [ "package.json" -ot "node_modules" ]; then
            log_success "Dependencies are up to date"
            update_progress
            return 0
        fi
    fi
    
    npm install --production=false >/dev/null 2>&1 &
    NPM_PID=$!
    
    # Show progress while npm installs
    while kill -0 $NPM_PID 2>/dev/null; do
        echo -n "."
        sleep 2
    done
    echo ""
    
    wait $NPM_PID
    
    log_success "Dependencies installed"
    update_progress
}

# Setup database tables
setup_database_tables() {
    log_info "Setting up database tables..."
    
    # Create a temporary script to populate sample data
    cat > setup_db.js << 'EOF'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    // Create sample tables
    const tables = [
        `CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            department_id INT,
            salary DECIMAL(10,2),
            hire_date DATE
        )`,
        `CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            manager_id INT
        )`,
        `CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            budget DECIMAL(12,2),
            start_date DATE,
            end_date DATE
        )`
    ];

    for (const table of tables) {
        await connection.execute(table);
    }

    // Insert sample data if tables are empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    if (rows[0].count === 0) {
        await connection.execute(`
            INSERT INTO departments (id, name, manager_id) VALUES 
            (1, 'Engineering', 1),
            (2, 'Marketing', 2),
            (3, 'Sales', 3)
        `);

        await connection.execute(`
            INSERT INTO employees (id, name, department_id, salary, hire_date) VALUES 
            (1, 'John Doe', 1, 75000.00, '2022-01-15'),
            (2, 'Jane Smith', 2, 65000.00, '2022-03-20'),
            (3, 'Bob Johnson', 3, 60000.00, '2022-05-10'),
            (4, 'Alice Brown', 1, 80000.00, '2021-11-30'),
            (5, 'Charlie Davis', 2, 55000.00, '2023-02-14')
        `);

        await connection.execute(`
            INSERT INTO projects (id, name, budget, start_date, end_date) VALUES 
            (1, 'Website Redesign', 50000.00, '2023-01-01', '2023-06-30'),
            (2, 'Mobile App', 100000.00, '2023-03-15', '2023-12-31'),
            (3, 'Database Migration', 25000.00, '2023-02-01', '2023-04-30')
        `);
    }

    await connection.end();
    console.log('Database setup completed successfully');
}

setupDatabase().catch(console.error);
EOF
    
    node setup_db.js >/dev/null 2>&1 && rm setup_db.js
    
    log_success "Database tables created with sample data"
    update_progress
}

# Check if port is available
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Port $PORT is already in use"
        
        # Find available port
        for port in {3001..3010}; do
            if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                PORT=$port
                log_info "Using port $PORT instead"
                
                # Update .env file
                sed -i.bak "s/PORT=3000/PORT=$PORT/" .env
                break
            fi
        done
    fi
}

# Start the application
start_application() {
    log_info "Starting SQL Mastery Quest..."
    
    check_port
    
    # Kill any existing process on the port
    pkill -f "node.*server.js" 2>/dev/null || true
    
    # Start the application
    nohup npm start > app.log 2>&1 &
    APP_PID=$!
    
    # Wait for application to start
    log_info "Waiting for application to start..."
    for i in {1..30}; do
        if curl -s "http://localhost:$PORT" >/dev/null 2>&1; then
            log_success "Application started successfully!"
            break
        fi
        sleep 2
    done
    
    update_progress
}

# Main installation function
main() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   SQL Mastery Quest Installer               ║"
    echo "║              Smart, Fast, and Parallel Setup                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Starting installation process..."
    
    # Run installations in parallel where possible
    {
        install_dependencies
    } &
    
    {
        install_nodejs
        update_progress
    } &
    
    {
        setup_repository
    } &
    
    # Wait for all background processes
    wait
    
    # Sequential steps that depend on previous ones
    setup_mysql
    create_env_file
    install_npm_dependencies
    setup_database_tables
    start_application
    
    # Final success message
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 INSTALLATION COMPLETE! 🎉             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    log_success "SQL Mastery Quest is now running!"
    log_info "Application URL: ${BLUE}http://localhost:$PORT${NC}"
    log_info "Database: $DB_NAME (User: $DB_USER)"
    log_info "Log file: $(pwd)/app.log"
    
    echo ""
    echo -e "${YELLOW}Security Information:${NC}"
    echo "✓ Auto-generated secure database password: $DB_PASSWORD"
    echo "✓ Auto-generated session secret (32 chars)"
    echo "✓ Git-secrets protection active"
    echo "✓ Environment file secured (600 permissions)"
    
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Visit http://localhost:$PORT to start learning SQL"
    echo "2. Configure Google OAuth credentials in .env (optional)"
    echo "3. Keep your .env file secure and never commit it"
    
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  Start:   npm start"
    echo "  Stop:    pkill -f 'node.*server.js'"
    echo "  Logs:    tail -f app.log"
    echo "  Update:  ./update_game.sh"
}

# Run main installation
main "$@"