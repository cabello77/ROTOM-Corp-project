# Plotline Development Server Startup Script
# This script starts both frontend and backend servers in separate terminal windows

Write-Host "Starting Plotline development servers..." -ForegroundColor Green
Write-Host ""

# Get the script directory (project root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Frontend Server in a new terminal window
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait a moment before starting backend
Start-Sleep -Seconds 2

# Start Backend Server in a new terminal window
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; node server.js"

Write-Host ""
Write-Host "Both servers are starting in separate terminal windows." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173 (or the port shown in the terminal)" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3000 (or the port shown in the terminal)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

