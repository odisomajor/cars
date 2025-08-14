@echo off
echo ========================================
echo PuTTY Installation Helper
echo ========================================
echo.
echo Please follow these steps to install PuTTY:
echo.
echo 1. Open your web browser
echo 2. Go to: https://www.putty.org/
echo 3. Click "Download PuTTY"
echo 4. Download the Windows installer (64-bit)
echo 5. Run the installer and follow the setup wizard
echo.
echo Alternative: Download portable version
echo 1. Go to: https://www.putty.org/
echo 2. Download "plink.exe" (command-line tool)
echo 3. Save it to: C:\Projects\CarDealership\
echo.
echo After installation, run: deploy-automated.bat
echo.
echo Opening PuTTY download page...
start https://www.putty.org/
echo.
echo Press any key to continue...
pause > nul