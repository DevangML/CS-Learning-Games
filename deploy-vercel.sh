#!/bin/bash

# 🚀 Vercel Deployment Script for SQL Mastery Quest
# This script helps you deploy your app to Vercel

set -e

echo "🚀 Starting Vercel deployment for SQL Mastery Quest..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Check if .env file exists and warn about environment variables
if [ -f ".env" ]; then
    echo "⚠️  Found .env file. Make sure to set these environment variables in Vercel:"
    echo "   - SESSION_SECRET"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - MYSQL_HOST"
    echo "   - MYSQL_USER"
    echo "   - MYSQL_PASSWORD"
    echo "   - MYSQL_DATABASE"
    echo ""
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
else
    echo "⚠️  No .env file found. You'll need to set environment variables in Vercel dashboard."
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update Google OAuth redirect URI to your Vercel URL"
echo "3. Test your application"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
