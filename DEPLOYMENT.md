# Deployment Guide for CarMarket

## GitHub Deployment

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `car-dealership` or similar
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### Step 2: Push to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## HostPinnacle Production Deployment

### Prerequisites
- HostPinnacle hosting account with Node.js support
- PostgreSQL database (recommended) or MySQL
- Domain name configured

### Step 1: Prepare Environment
1. Copy `.env.production.example` to `.env.production`
2. Fill in all production values:

```env
# Database - Use your HostPinnacle database URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Domain - Your actual domain
NEXTAUTH_URL="https://yourdomain.com"

# Generate secure secrets
NEXTAUTH_SECRET="your-32-character-random-string"
JWT_SECRET="your-32-character-random-string"

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Email configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Step 2: Database Setup
1. Create a PostgreSQL database in HostPinnacle control panel
2. Note down the connection details
3. Update `DATABASE_URL` in `.env.production`

### Step 3: Upload Files
1. **Option A: Git Clone (Recommended)**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Option B: FTP Upload**
   - Upload all files except:
     - `node_modules/`
     - `.next/`
     - `.env.local`
     - `prisma/dev.db`

### Step 4: Install Dependencies
```bash
# Install production dependencies
npm ci --production

# Or if you need dev dependencies for build
npm install
```

### Step 5: Build Application
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Build the application
npm run build
```

### Step 6: Create Upload Directories
```bash
mkdir -p public/uploads/avatars
chmod 755 public/uploads
chmod 755 public/uploads/avatars
```

### Step 7: Configure Web Server

#### For Apache (.htaccess)
Create `.htaccess` in your domain root:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

#### For Nginx
Add to your nginx configuration:
```nginx
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
}
```

### Step 8: Start Application
```bash
# Start in production mode
npm start

# Or use PM2 for process management (recommended)
npm install -g pm2
pm2 start npm --name "carmarket" -- start
pm2 save
pm2 startup
```

### Step 9: SSL Certificate
1. Enable SSL in HostPinnacle control panel
2. Or use Let's Encrypt if available
3. Update `NEXTAUTH_URL` to use `https://`

## Environment Variables Reference

### Required
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_URL`: Your domain with protocol
- `NEXTAUTH_SECRET`: Random 32+ character string
- `JWT_SECRET`: Random 32+ character string

### Optional but Recommended
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth
- `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET`: Facebook OAuth
- Email server configuration for notifications
- Twilio configuration for SMS verification

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` format
   - Check database server is running
   - Ensure database exists

2. **Build Errors**
   - Run `npm run type-check` to check TypeScript errors
   - Ensure all environment variables are set

3. **OAuth Not Working**
   - Verify OAuth app settings in Google/Facebook console
   - Check redirect URLs match your domain
   - Ensure `NEXTAUTH_URL` is correct

4. **File Upload Issues**
   - Check `public/uploads/` directory permissions
   - Ensure directory exists and is writable

### Logs
```bash
# View application logs
pm2 logs carmarket

# Or if running directly
npm start 2>&1 | tee app.log
```

## Maintenance

### Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart carmarket
```

### Database Backups
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitoring
- Monitor application logs regularly
- Set up uptime monitoring
- Monitor database performance
- Check disk space for uploads

## Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables
3. Test database connectivity
4. Check file permissions
5. Review web server configuration