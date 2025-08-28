# 🔐 Secrets Management Guide

This guide explains how to securely manage secrets when deploying the SQL Mastery Quest application.

## 🛡️ Security Features

- **Git-secrets protection**: Prevents accidental secret commits
- **Auto-generated secrets**: Database password and session secret are automatically generated
- **Secure file permissions**: `.env` file is created with `600` permissions (owner read/write only)
- **Environment variable support**: Secrets can be provided via environment variables

## 🚀 Installation Methods

### Method 1: Basic Installation (Recommended for Development)
```bash
# Run the installer - it will auto-generate secure secrets
curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh
```

**What happens:**
- ✅ Secure random database password generated
- ✅ Secure session secret generated  
- ✅ Google OAuth left as placeholders (configure manually if needed)

### Method 2: Pre-configured Installation (Production)
```bash
# Set your secrets as environment variables before installation
export GOOGLE_CLIENT_ID_ENV="your_actual_google_client_id"
export GOOGLE_CLIENT_SECRET_ENV="your_actual_google_client_secret"

# Run installer - it will use your provided secrets
curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh
```

### Method 3: Manual Configuration (After Installation)
```bash
# 1. Install normally
curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh

# 2. Edit .env file manually
cd sql_tutor
nano .env

# 3. Update these values:
# GOOGLE_CLIENT_ID=your_actual_client_id
# GOOGLE_CLIENT_SECRET=your_actual_client_secret

# 4. Restart the application
npm start
```

## 🔧 Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Create OAuth 2.0 Client ID**
3. **Set Authorized Redirect URI**: `http://localhost:3000/auth/google/callback`
4. **Copy Client ID and Secret** to your `.env` file

## 🏗️ Production Deployment

### Docker Environment Variables
```dockerfile
ENV GOOGLE_CLIENT_ID_ENV=your_client_id
ENV GOOGLE_CLIENT_SECRET_ENV=your_client_secret
RUN curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh
```

### CI/CD Pipeline
```yaml
env:
  GOOGLE_CLIENT_ID_ENV: ${{ secrets.GOOGLE_CLIENT_ID }}
  GOOGLE_CLIENT_SECRET_ENV: ${{ secrets.GOOGLE_CLIENT_SECRET }}
steps:
  - name: Install Application
    run: curl -sSL https://raw.githubusercontent.com/DevangML/CS-Learning-Games/cn_mastery/install.sh | zsh
```

## 🚫 What NOT to Do

❌ **Never commit secrets to git**
❌ **Never hardcode secrets in scripts** 
❌ **Never share .env files**
❌ **Never use weak passwords**

## ✅ Best Practices

✅ **Use environment variables for secrets**
✅ **Keep .env files in .gitignore** 
✅ **Use strong, auto-generated passwords**
✅ **Set proper file permissions (600)**
✅ **Regularly rotate secrets**
✅ **Use git-secrets for protection**

## 🔍 Verifying Security

Check that git-secrets is working:
```bash
cd sql_tutor
git secrets --scan
```

Check file permissions:
```bash
ls -la .env
# Should show: -rw------- (600 permissions)
```

## 🆘 Troubleshooting

### "Git-secrets blocked my commit"
This is working correctly! It's protecting your repository. Either:
1. Remove the secret and use environment variables instead
2. Add pattern to `.gitallowed` if it's a false positive

### "Google OAuth not working"
1. Verify your Client ID and Secret in `.env`
2. Check the redirect URI matches exactly
3. Ensure OAuth consent screen is configured

### "Application won't start"
1. Check if all required environment variables are set
2. Verify database connection
3. Check application logs: `tail -f app.log`

## 📞 Support

If you need help with secrets management:
1. Check this guide first
2. Review the application logs
3. Verify your OAuth configuration
4. Ensure git-secrets is properly configured