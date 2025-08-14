# SSH Deployment Script for CarDealership
$serverIP = "146.190.112.240"
$username = "root"
$password = "uSGZFp9Hmyu43Y282rjq"

# Convert password to secure string
$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Connecting to server $serverIP..." -ForegroundColor Green

# Deployment commands
$commands = @(
    "apt update && apt upgrade -y",
    "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
    "apt install -y nodejs postgresql postgresql-contrib nginx git ufw fail2ban",
    "npm install -g pm2",
    "ufw allow ssh && ufw allow 'Nginx Full' && ufw --force enable",
    "mkdir -p /var/www/cardealership && cd /var/www/cardealership",
    "git clone https://github.com/yourusername/CarDealership.git .",
    "chown -R www-data:www-data /var/www/cardealership",
    "npm install",
    "mkdir -p public/uploads && chown -R www-data:www-data public/uploads"
)

# Try to execute commands via SSH
foreach ($command in $commands) {
    Write-Host "Executing: $command" -ForegroundColor Yellow
    try {
        # Use plink if available, otherwise fall back to manual execution
        if (Get-Command plink -ErrorAction SilentlyContinue) {
            $result = & plink -ssh -batch -pw $password $username@$serverIP $command
            Write-Host "Result: $result" -ForegroundColor Cyan
        } else {
            Write-Host "Please install PuTTY (plink) or execute manually:" -ForegroundColor Red
            Write-Host "ssh $username@$serverIP" -ForegroundColor White
            Write-Host "Password: $password" -ForegroundColor White
            Write-Host "Then run: $command" -ForegroundColor White
            Read-Host "Press Enter after executing the command above"
        }
    } catch {
        Write-Host "Error executing command: $_" -ForegroundColor Red
        Write-Host "Please execute manually: $command" -ForegroundColor Yellow
        Read-Host "Press Enter after executing manually"
    }
}

Write-Host "Deployment commands completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH to server: ssh $username@$serverIP" -ForegroundColor White
Write-Host "2. Edit .env.production file" -ForegroundColor White
Write-Host "3. Setup database and run Prisma migrations" -ForegroundColor White
Write-Host "4. Build and start the application" -ForegroundColor White