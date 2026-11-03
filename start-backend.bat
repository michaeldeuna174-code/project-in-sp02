@echo off
title CyberSafe Backend Server
cd /d "%~dp0backend"
echo ===================================================
echo   CyberSafe: Node.js + Express Backend Server
echo ===================================================
echo.
"C:\Program Files\nodejs\node.exe" src/server.js
if %errorlevel% neq 0 (
  node src/server.js
)
pause
