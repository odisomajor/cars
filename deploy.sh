#!/bin/bash

# Production Deployment Script for CarMarket
# This script helps deploy the application to production

echo "🚀 Starting CarMarket deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and fill in your values."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma db push

# Build the application
echo "🏗️  Building application..."
npm run build

# Create uploads directory if it doesn't exist
echo "📁 Setting up upload directories..."
mkdir -p public/uploads/avatars

echo "✅ Deployment completed successfully!"
echo "🌐 You can now start the application with: npm start"
echo "📝 Make sure to set up your web server to proxy requests to the Next.js application."