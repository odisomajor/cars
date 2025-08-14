# Ubuntu Server Deployment Guide
## CarDealership Production Setup on 146.190.112.240

---

## 🚀 Quick Deployment Overview

**Server Details:**
- **IP Address:** 146.190.112.240
- **OS:** Ubuntu Server
- **Hosting:** HostPinnacle
- **Repository:** https://github.com/odisomajor/cars.git

---

## 📋 Pre-Deployment Checklist

### Required Information Still Needed:
- [ ] **SSH Access Details**
  - Username (usually `root` or `ubuntu`)
  - SSH private key file OR password
  - SSH port (usually 22)

- [ ] **Domain Configuration**
  - Your domain name
  - DNS A record pointing to 146.190.112.240

- [ ] **Database Credentials** (will be created during setup)
  - Database name: `cardealership`
  - Database user: `cardealership`
  - Database password: (you'll set this)

---

## 🛠️ Deployment Methods

### Method 1: Automated Script (Recommended)

1. **Upload the deployment script to your server:**
   ```bash
   scp production-deploy.sh user@146.190.112.240:~/
   ```

2. **SSH into your server:**
   ```bash
   ssh user@146.190.112.240
   ```

3. **Make script executable and run:**
   ```bash
   chmod +x production-deploy.sh
   ./production-deploy.sh
   ```

### Method 2: Manual Step-by-Step

If you prefer manual control, follow these steps:

#### Step 1: Connect to Server
```bash
ssh user@78.159.111.235
```

#### Step 2: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 3: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 4: Install Required Software
```bash
# Install PM2, PostgreSQL, Nginx, Git
sudo npm install -g pm2
sudo apt install -y postgresql postgresql-contrib nginx git ufw
```

#### Step 5: Configure Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

#### Step 6: Setup Application Directory
```bash
sudo mkdir -p /var/www/cardealership
sudo chown -R $USER:$USER /var/www/cardealership
cd /var/www/cardealership
```

#### Step 7: Clone Repository
```bash
git clone https://github.com/odisomajor/cars.git .
```

#### Step 8: Install Dependencies
```bash
npm ci --production=false
```

---

## 🗄️ Database Setup

### Create PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER cardealership WITH PASSWORD 'your_secure_password';
CREATE DATABASE cardealership OWNER cardealership;
GRANT ALL PRIVILEGES ON DATABASE cardealership TO cardealership;
\q
```

---

## ⚙️ Environment Configuration

### Create Production Environment File
```bash
cp .env.production.example .env.production
nano .env.production
```

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://cardealership:your_secure_password@localhost:5432/cardealership"

# Application URLs
NEXTAUTH_URL="http://146.190.112.240"  # Change to your domain later
NEXTAUTH_SECRET="your-32-character-random-secret-here"
JWT_SECRET="your-32-character-random-secret-here"

# OAuth (Optional - configure later)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"

# AdSense (Optional)
NEXT_PUBLIC_ADSENSE_ID="ca-pub-your-adsense-id"
```

### Generate Secure Secrets
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏗️ Build and Deploy Application

### Generate Database Schema
```bash
npm run db:generate
npm run db:push
```

### Build Application
```bash
npm run build
```

### Create Upload Directories
```bash
mkdir -p public/uploads/avatars
chmod 755 public/uploads public/uploads/avatars
```

---

## 🌐 Nginx Configuration

### Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/cardealership
```

### Nginx Configuration Content
```nginx
server {
    listen 80;
    server_name 146.190.112.240 yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;

    # File upload limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Upload files
    location /uploads {
        alias /var/www/cardealership/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/cardealership /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 Process Management with PM2

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

### PM2 Configuration
```javascript
module.exports = {
  apps: [{
    name: 'cardealership',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cardealership',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/cardealership/logs/err.log',
    out_file: '/var/www/cardealership/logs/out.log',
    log_file: '/var/www/cardealership/logs/combined.log',
    time: true
  }]
};
```

### Start Application
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 SSL Certificate Setup (Recommended)

### Install Certbot
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Get SSL Certificate
```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Update Environment for HTTPS
```bash
nano .env.production
# Change NEXTAUTH_URL to https://yourdomain.com
```

---

## 🔧 Post-Deployment Configuration

### 1. OAuth Setup (Optional)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://146.190.112.240/api/auth/callback/google`

#### Facebook OAuth:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs

### 2. Email Configuration

#### Gmail Setup:
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in `EMAIL_SERVER_PASSWORD`

### 3. SMS Configuration (Optional)

#### Twilio Setup:
1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase phone number
4. Update environment variables

---

## 📊 Monitoring and Maintenance

### View Application Logs
```bash
# PM2 logs
pm2 logs cardealership

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Application Management
```bash
# Restart application
pm2 restart cardealership

# Stop application
pm2 stop cardealership

# View status
pm2 status

# Monitor resources
pm2 monit
```

### Updates and Maintenance
```bash
# Pull latest changes
cd /var/www/cardealership
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart cardealership
```

### Database Backup
```bash
# Create backup
pg_dump -U cardealership -h localhost cardealership > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U cardealership -h localhost cardealership < backup_file.sql
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   # Check logs
   pm2 logs cardealership
   
   # Check environment variables
   cat .env.production
   
   # Test database connection
   npm run db:generate
   ```

2. **Nginx errors:**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Database connection issues:**
   ```bash
   # Test PostgreSQL connection
   psql -U cardealership -h localhost -d cardealership
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

4. **Port conflicts:**
   ```bash
   # Check what's using port 3000
   sudo netstat -tlnp | grep :3000
   
   # Kill process if needed
   sudo kill -9 PID
   ```

### Security Checklist

- [ ] UFW firewall enabled
- [ ] Fail2Ban installed and configured
- [ ] SSH key-based authentication (disable password auth)
- [ ] Regular security updates
- [ ] SSL certificate installed
- [ ] Strong database passwords
- [ ] Environment variables secured

---

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs first** (PM2, Nginx, system)
2. **Verify environment variables** are correctly set
3. **Test database connectivity**
4. **Check firewall rules**
5. **Verify DNS settings** for your domain

---

## 🎉 Success!

Once deployed, your CarDealership platform will be available at:
- **IP Access:** http://146.190.112.240
- **Domain Access:** https://yourdomain.com (after DNS setup)

**Features Available:**
- ✅ Car listing management
- ✅ User authentication
- ✅ Search and filtering
- ✅ Image uploads
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ SEO optimized

---

*Last updated: $(date)*