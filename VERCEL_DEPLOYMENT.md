# 🚀 Vercel Deployment Guide for SQL Mastery Quest

This guide will help you deploy your SQL tutor application to Vercel with MySQL and Google OAuth support.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MySQL Database**: You'll need a cloud MySQL database (PlanetScale, Railway, AWS RDS, etc.)
3. **Google OAuth**: Configure Google OAuth credentials
4. **GitHub Repository**: Your code should be in a GitHub repository

## 🔧 Step 1: Prepare Your Database

### Option A: PlanetScale (Recommended)
1. Go to [planetscale.com](https://planetscale.com) and create an account
2. Create a new database
3. Get your connection details from the dashboard
4. **Run the setup script**: `npm run setup-mysql` (for local development)

### Option B: Railway
1. Go to [railway.app](https://railway.app) and create an account
2. Create a new MySQL database
3. Get your connection details from the dashboard
4. **Run the setup script**: `npm run setup-mysql` (for local development)

### Option C: AWS RDS
1. Create a MySQL RDS instance in AWS
2. Configure security groups to allow connections
3. Get your connection details
4. **Run the setup script**: `npm run setup-mysql` (for local development)

### Option D: Local MySQL Setup (Development)
1. Install MySQL locally
2. **Run the automated setup**: `npm run setup-mysql`
3. The script will:
   - Create database and user
   - Set up all tables with sample data
   - Generate environment variables
   - Test the connection

## 🔐 Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add these authorized redirect URIs:
   - `https://your-app-name.vercel.app/auth/google/callback`
   - `http://localhost:3000/auth/google/callback` (for local development)
4. Copy your Client ID and Client Secret

## 🚀 Step 3: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy your project**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add SESSION_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add MYSQL_HOST
   vercel env add MYSQL_USER
   vercel env add MYSQL_PASSWORD
   vercel env add MYSQL_DATABASE
   ```

### Method 2: Using Vercel Dashboard

1. **Connect your GitHub repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure the project**:
   - Framework Preset: `Node.js`
   - Root Directory: `./` (default)
   - Install Command: `npm install`
   - Build Command: `npm run vercel-build`
   - Output Directory: `./` (default)

3. **Set environment variables** in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable from the list below

## 🔧 Step 4: Build Configuration

Your project is configured with the following build settings in `vercel.json`:

```json
{
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "installCommand": "npm install",
        "buildCommand": "npm run vercel-build",
        "outputDirectory": "."
      }
    }
  ]
}
```

- **Install Command**: `npm install` - Installs all dependencies
- **Build Command**: `npm run vercel-build` - Runs the build process and validates content
- **Output Directory**: `.` - Serves files from the root directory
- **Node.js Version**: `>=18.0.0` (specified in package.json)

## 🔧 Step 5: Environment Variables

Set these environment variables in your Vercel project:

### Required Variables:
```bash
SESSION_SECRET=your-super-secret-session-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-mysql-database
```

### Optional Variables:
```bash
MYSQL_PORT=3306
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/google/callback
CORS_ORIGIN=https://your-app.vercel.app
```

## 🔄 Step 6: Update Google OAuth Redirect URI

After deployment, update your Google OAuth redirect URI to match your Vercel URL:
- Go to Google Cloud Console
- Update the redirect URI to: `https://your-app-name.vercel.app/auth/google/callback`

## 🧪 Step 7: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app-name.vercel.app`
2. **Test MySQL connection**: Use the setup card in the app
3. **Test Google OAuth**: Try logging in with Google
4. **Test SQL queries**: Try some basic SQL queries

## 🔧 Automated MySQL Setup

For local development, you can use the automated setup script:

```bash
# Run the interactive MySQL setup
npm run setup-mysql
```

This script will:
- ✅ Connect to MySQL as root
- ✅ Create database and application user
- ✅ Set up all tables with sample data
- ✅ Generate environment variables
- ✅ Test the connection
- ✅ Optionally save to .env file

**Perfect for**: Local development, testing, and quick setup

## 🔍 Troubleshooting

### Common Issues:

1. **"MySQL connection failed"**:
   - Check your MySQL credentials
   - Ensure your database allows external connections
   - Verify the database exists

2. **"Google OAuth not working"**:
   - Verify redirect URI matches exactly
   - Check Client ID and Secret
   - Ensure OAuth consent screen is configured

3. **"Session not persisting"**:
   - Check SESSION_SECRET is set
   - Verify cookie settings in production

4. **"Build failed"**:
   - Check package.json dependencies
   - Verify Node.js version compatibility (requires >=18.0.0)
   - Check if all required files are present
   - Review build logs for specific errors

### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Redeploy with debug info
vercel --debug

# Check environment variables
vercel env ls
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to your repository
2. **Database Security**: Use strong passwords and restrict access
3. **HTTPS**: Vercel provides HTTPS by default
4. **Session Security**: Use a strong SESSION_SECRET

## 📈 Monitoring

1. **Vercel Analytics**: Monitor performance in Vercel dashboard
2. **Database Monitoring**: Use your database provider's monitoring tools
3. **Error Tracking**: Consider adding error tracking (Sentry, etc.)

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push to your main branch:
```bash
git add .
git commit -m "Update app"
git push origin main
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connectivity
4. Check Google OAuth configuration

## 🎉 Success!

Your SQL Mastery Quest app should now be live on Vercel with:
- ✅ MySQL database connectivity
- ✅ Google OAuth authentication
- ✅ Secure session management
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments
