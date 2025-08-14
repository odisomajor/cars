#!/bin/bash

# Production Deployment Script for CarDealership on Ubuntu Server
# Server IP: 146.190.112.240
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting CarDealership Production Deployment"
echo "📍 Target Server: 146.190.112.240"
echo "⏰ Started at: $(date)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js installed: $node_version"
print_success "npm installed: $npm_version"

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Git if not present
print_status "Installing Git..."
sudo apt install -y git

# Install UFW firewall
print_status "Installing UFW firewall..."
sudo apt install -y ufw

# Configure UFW
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application directory
APP_DIR="/var/www/cardealership"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone the repository
print_status "Cloning repository from GitHub..."
cd $APP_DIR
git clone https://github.com/odisomajor/cars.git .

# Create .env.production file
print_status "Creating production environment file..."
cp .env.production.example .env.production

print_warning "IMPORTANT: You need to edit .env.production with your actual values!"
print_warning "Run: nano .env.production"

# Install dependencies
print_status "Installing Node.js dependencies..."
npm ci --production=false

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p public/uploads/avatars
chmod 755 public/uploads
chmod 755 public/uploads/avatars

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres createuser --interactive --pwprompt cardealership || true
sudo -u postgres createdb -O cardealership cardealership || true

print_warning "Database created. Update DATABASE_URL in .env.production"
print_warning "Format: postgresql://cardealership:password@localhost:5432/cardealership"

# Generate Prisma client (will be done after env setup)
print_status "Prisma client generation will be done after environment setup..."

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/cardealership > /dev/null <<EOF
server {
    listen 80;
    server_name 146.190.112.240;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images and uploads
    location /uploads {
        alias $APP_DIR/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/cardealership /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'cardealership',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$APP_DIR/logs/err.log',
    out_file: '$APP_DIR/logs/out.log',
    log_file: '$APP_DIR/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Install Fail2Ban for security
print_status "Installing Fail2Ban for security..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

print_success "🎉 Base system setup completed!"
print_warning "⚠️  NEXT STEPS REQUIRED:"
echo ""
echo "1. Edit environment variables:"
echo "   nano .env.production"
echo ""
echo "2. Update these key values:"
echo "   - DATABASE_URL (use the PostgreSQL credentials you created)"
echo "   - NEXTAUTH_URL (your domain or http://146.190.112.240)"
echo "   - NEXTAUTH_SECRET (generate a random 32+ character string)"
echo "   - JWT_SECRET (generate a random 32+ character string)"
echo ""
echo "3. After updating .env.production, run:"
echo "   npm run db:generate"
echo "   npm run db:push"
echo "   npm run build"
echo ""
echo "4. Start the application:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. Your site will be available at: http://146.190.112.240"
echo ""
print_warning "📝 Don't forget to:"
echo "   - Point your domain's A record to 146.190.112.240"
echo "   - Set up SSL certificate (Let's Encrypt recommended)"
echo "   - Configure OAuth apps (Google, Facebook) with your domain"
echo ""
print_success "🚀 Deployment script completed at: $(date)"