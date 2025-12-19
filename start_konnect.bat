@echo off
echo Starting Konnect Application...

start "Konnect Backend" cmd /k "cd backend && node server.js"
start "Konnect Frontend" cmd /k "cd frontend && npm run dev"

echo Servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000 (or similar)
pause
