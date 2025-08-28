# 🚀 SQL Mastery Quest - Quick Install Guide

## One-Line Installation

```bash
curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/sql_mastery/install.sh | zsh
```

Or for zsh users:
```zsh
curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/sql_mastery/install.sh | zsh
```

## What the installer does:

✅ **Smart Dependency Management**
- Automatically detects your OS (macOS/Linux/Ubuntu)
- Installs Node.js, MySQL, and other dependencies in parallel
- Skips already installed components

✅ **Database Setup**
- Creates MySQL database and user automatically
- Populates sample data for learning
- Handles permissions and security

✅ **Application Configuration**
- Sets up environment variables
- Configures Google OAuth (optional)
- Creates secure session secrets

✅ **Performance Optimized**
- Runs multiple installation steps in parallel
- Detects existing installations to avoid duplicates
- Provides real-time progress updates

## Manual Installation

If you prefer manual setup:

### 1. Clone Repository
```bash
git clone https://github.com/DevangML/CS-Learning-Games.git
cd sql_tutor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL
```bash
# Create database and user
mysql -u root -p
CREATE DATABASE sql_tutor;
CREATE USER 'sql_tutor_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON sql_tutor.* TO 'sql_tutor_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 5. Start Application
```bash
npm start
```

## Features

🎮 **Multi-Page Application**
- Modern client-side routing
- Smooth page transitions
- Mobile-responsive design

🔐 **Authentication System**
- Google OAuth integration
- Demo mode for instant access
- Persistent user progress

🎯 **Learning Features**
- 23 levels of SQL challenges
- Real MySQL query execution
- Gamification with XP and streaks

📊 **Progress Tracking**
- Database-persistent progress
- Cross-device synchronization
- Detailed analytics

## Requirements

- **Node.js**: 16+ (automatically installed)
- **MySQL**: 5.7+ (automatically installed)
- **OS**: macOS, Ubuntu/Debian, or CentOS/RHEL

## Troubleshooting

### Port Already in Use
The installer automatically finds an available port (3000-3010)

### MySQL Connection Issues
Run the built-in database setup:
```bash
npm run setup-db
```

### Permission Issues
On Linux, you may need sudo for MySQL installation:
```bash
sudo ./install.sh
```

## Post-Installation

1. **Access the Application**: http://localhost:3000
2. **Sign in with Google** (optional) or **Try Demo Mode**
3. **Choose Learning Path**: Essentials (11 levels) or Complete (23 levels)
4. **Start Learning SQL** with interactive challenges!

## Development

```bash
# Start in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Support

- **Issues**: [GitHub Issues](https://github.com/DevangML/CS-Learning-Games/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DevangML/CS-Learning-Games/discussions)

---

**Ready to master SQL? Run the installer and start your journey!** 🎯