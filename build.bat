@echo off
echo ================================
echo   Fodinha - Build Script
echo ================================
echo.

echo Building Backend...
cd backend
call npm install
call npm run build
echo Backend build complete!
echo.

echo Building Frontend...
cd ..\frontend
call npm install
call npm run build
echo Frontend build complete!
echo.

echo ================================
echo   Build finalizado!
echo ================================
echo.
echo Arquivos prontos para deploy:
echo   Backend: backend\dist\
echo   Frontend: frontend\dist\
echo.
echo Consulte DEPLOY.md para instrucoes de deploy
echo.
pause
