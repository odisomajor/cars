@echo off
echo ========================================
echo CarDealership Automated Deployment
echo ========================================
echo.
echo Server: 146.190.112.240
echo Username: root
echo.

REM Check if plink is available
plink -V >nul 2>&1
if %errorlevel% == 0 (
    echo PuTTY plink found! Starting automated deployment...
    goto :automated
) else (
    echo PuTTY plink not found. Checking for OpenSSH...
    ssh -V 2>nul
    if %errorlevel% == 0 (
        echo OpenSSH found! Using alternative method...
        goto :openssh
    ) else (
        echo Neither PuTTY nor OpenSSH found.
        echo Please install PuTTY first by running: install-putty.bat
        pause
        exit /b 1
    )
)

:automated
echo.
echo Executing deployment commands via plink...
echo.

REM System update
echo [1/10] Updating system packages...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "apt update && apt upgrade -y"

REM Install Node.js
echo [2/10] Installing Node.js 20.x...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"

REM Install packages
echo [3/10] Installing required packages...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "apt install -y nodejs postgresql postgresql-contrib nginx git ufw fail2ban"

REM Install PM2
echo [4/10] Installing PM2...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "npm install -g pm2"

REM Configure firewall
echo [5/10] Configuring firewall...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable"

REM Create app directory
echo [6/10] Setting up application directory...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "mkdir -p /var/www/cardealership"

REM Clone repository (Note: Update the GitHub URL)
echo [7/10] Cloning repository...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "cd /var/www/cardealership && git clone https://github.com/yourusername/cardealership.git ."

REM Set permissions
echo [8/10] Setting permissions...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "chown -R www-data:www-data /var/www/cardealership"

REM Install dependencies
echo [9/10] Installing Node.js dependencies...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "cd /var/www/cardealership && npm install"

REM Create uploads directory
echo [10/10] Creating uploads directory...
echo y | .\plink -ssh -i cardealership_key_new root@146.190.112.240 "cd /var/www/cardealership && mkdir -p public/uploads && chown -R www-data:www-data public/uploads"

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
goto :finish

:openssh
echo.
echo Using OpenSSH for deployment...
echo Note: You may need to manually accept host keys and enter passwords
echo.

REM Create a temporary script file
echo apt update ^&^& apt upgrade -y > temp_deploy.sh
echo curl -fsSL https://deb.nodesource.com/setup_20.x ^| sudo -E bash - >> temp_deploy.sh
echo apt install -y nodejs postgresql postgresql-contrib nginx git ufw fail2ban >> temp_deploy.sh
echo npm install -g pm2 >> temp_deploy.sh
echo ufw allow ssh ^&^& ufw allow 'Nginx Full' ^&^& ufw --force enable >> temp_deploy.sh
echo mkdir -p /var/www/cardealership >> temp_deploy.sh
echo cd /var/www/cardealership >> temp_deploy.sh
echo git clone https://github.com/yourusername/CarDealership.git . >> temp_deploy.sh
echo chown -R www-data:www-data /var/www/cardealership >> temp_deploy.sh
echo cd /var/www/cardealership >> temp_deploy.sh
echo npm install >> temp_deploy.sh
echo mkdir -p public/uploads >> temp_deploy.sh
echo chown -R www-data:www-data public/uploads >> temp_deploy.sh

echo Connecting to server and executing deployment script...
scp -o StrictHostKeyChecking=no -i cardealership_key_new temp_deploy.sh root@146.190.112.240:/tmp/
ssh -o StrictHostKeyChecking=no -i cardealership_key_new root@146.190.112.240 "chmod +x /tmp/temp_deploy.sh && /tmp/temp_deploy.sh"

del temp_deploy.sh

:finish
echo.
echo Next steps:
echo 1. Configure environment variables (.env.production)
echo 2. Setup PostgreSQL database
echo 3. Run Prisma migrations
echo 4. Build and start the application
echo.
echo Your application will be available at: http://146.190.112.240
echo.
pause
