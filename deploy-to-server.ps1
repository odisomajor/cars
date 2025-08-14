# CarDealership Production Deployment Script
# Target Server: 146.190.112.240 (HostPinnacle Ubuntu)

Write-Host "CarDealership Production Deployment" -ForegroundColor Green
Write-Host "Target Server: 146.190.112.240" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Server connection details
$SERVER_IP = "146.190.112.240"
$SSH_USER = "root"
$SSH_PASS = "uSGZFp9Hmyu43Y282rjq"
$REPO_URL = "https://github.com/odisomajor/cars.git"

# Check if SSH client is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "SSH client not found. Please install OpenSSH client." -ForegroundColor Red
    Write-Host "Run: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    exit 1
}

Write-Host "SSH client found" -ForegroundColor Green

# Create deployment commands
$updateSystem = "apt update && apt upgrade -y"
$installNode = "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt-get install -y nodejs"
$installPackages = "apt install -y postgresql postgresql-contrib nginx git ufw fail2ban"
$installPM2 = "npm install -g pm2"
$configureFirewall = "ufw --force enable && ufw allow ssh && ufw allow 'Nginx Full'"
$setupApp = "mkdir -p /var/www/cardealership && cd /var/www/cardealership && git clone $REPO_URL . && chown -R www-data:www-data /var/www/cardealership"
$installDeps = "cd /var/www/cardealership && npm install"
$createUploads = "mkdir -p /var/www/cardealership/public/uploads && chown -R www-data:www-data /var/www/cardealership/public/uploads"
$setupDB = "sudo -u postgres createuser --createdb cardealership_user && sudo -u postgres createdb -O cardealership_user cardealership_db"
$copyEnv = "cd /var/www/cardealership && cp .env.production.example .env.production"

Write-Host "`nDeployment Commands Ready" -ForegroundColor Cyan
Write-Host "`nIMPORTANT: You'll need to manually execute these commands on the server" -ForegroundColor Yellow
Write-Host "`nSSH Connection Details:" -ForegroundColor Cyan
Write-Host "Server: $SSH_USER@$SERVER_IP" -ForegroundColor White
Write-Host "Password: $SSH_PASS" -ForegroundColor White

Write-Host "`nCopy and paste these commands one by one:" -ForegroundColor Green

Write-Host "`n1. Update System:" -ForegroundColor Yellow
Write-Host $updateSystem -ForegroundColor White

Write-Host "`n2. Install Node.js 20.x:" -ForegroundColor Yellow
Write-Host $installNode -ForegroundColor White

Write-Host "`n3. Install Required Packages:" -ForegroundColor Yellow
Write-Host $installPackages -ForegroundColor White

Write-Host "`n4. Install PM2:" -ForegroundColor Yellow
Write-Host $installPM2 -ForegroundColor White

Write-Host "`n5. Configure Firewall:" -ForegroundColor Yellow
Write-Host $configureFirewall -ForegroundColor White

Write-Host "`n6. Setup Application:" -ForegroundColor Yellow
Write-Host $setupApp -ForegroundColor White

Write-Host "`n7. Install Dependencies:" -ForegroundColor Yellow
Write-Host $installDeps -ForegroundColor White

Write-Host "`n8. Create Uploads Directory:" -ForegroundColor Yellow
Write-Host $createUploads -ForegroundColor White

Write-Host "`n9. Setup Database (will prompt for password):" -ForegroundColor Yellow
Write-Host $setupDB -ForegroundColor White
Write-Host "Suggested password: CarDealer2024!" -ForegroundColor Cyan

Write-Host "`n10. Copy Environment File:" -ForegroundColor Yellow
Write-Host $copyEnv -ForegroundColor White

Write-Host "`nQuick SSH Connection:" -ForegroundColor Green
Write-Host "ssh $SSH_USER@$SERVER_IP" -ForegroundColor White
Write-Host "Password: $SSH_PASS" -ForegroundColor Cyan

Write-Host "`nAfter running all commands above, you'll need to:" -ForegroundColor Yellow
Write-Host "1. Edit /var/www/cardealership/.env.production" -ForegroundColor White
Write-Host "2. Update DATABASE_URL with your database password" -ForegroundColor White
Write-Host "3. Run: cd /var/www/cardealership && npx prisma generate && npx prisma db push" -ForegroundColor White
Write-Host "4. Run: npm run build" -ForegroundColor White
Write-Host "5. Run: pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "6. Configure Nginx (see UBUNTU_DEPLOYMENT_GUIDE.md)" -ForegroundColor White

Write-Host "`nYour app will be available at: http://146.190.112.240" -ForegroundColor Green
Write-Host "Server management: https://server-78-159-111-235.da.direct:2222/" -ForegroundColor Green

Write-Host "`nNeed automated deployment? I can help you set up the server step by step!" -ForegroundColor Cyan