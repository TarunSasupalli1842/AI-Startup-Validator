@echo off
title ValiStart Launcher
echo ========================================================
echo       ValiStart - AI Startup Idea Validator Launcher
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend Server (FastAPI on Port 8000)...
start "ValiStart Backend" cmd /k "cd /d ""%~dp0backend"" && .\venv\Scripts\activate && python main.py"

echo [2/2] Starting Frontend Server (Vite React)...
start "ValiStart Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening ValiStart in your default browser...
start http://localhost:5174
start http://localhost:5173

echo.
echo ========================================================
echo ValiStart is now running!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5174 or http://localhost:5173
echo ========================================================
pause
