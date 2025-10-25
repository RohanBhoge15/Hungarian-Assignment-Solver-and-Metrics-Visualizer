@echo off
echo Hungarian Method Visualizer - Windows Startup
echo =============================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "app.py" (
    echo Error: app.py not found
    echo Please run this script from the hungarian_visualizer directory
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Warning: Some dependencies may not have installed correctly
    )
)

REM Start the application
echo.
echo Starting Hungarian Method Visualizer...
echo Open your browser and go to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python run.py

pause