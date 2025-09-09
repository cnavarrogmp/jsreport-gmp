@echo off
title JSReport - Sync (Git) + Restart Docker
setlocal ENABLEDELAYEDEXPANSION
color 0A

echo ================================================================================
echo  JSREPORT - GIT SYNC + DOCKER RESTART
echo  1) git pull/add/commit/push en la rama actual
echo  2) docker-compose down/up
echo ================================================================================

where node >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en PATH.
  pause & exit /b 1
)

docker info >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Docker Desktop no esta corriendo.
  pause & exit /b 1
)

pushd "%~dp0"

node ".\scripts\jsreport-sync-and-restart.js"
set "EXITCODE=%ERRORLEVEL%"

echo.
if "%EXITCODE%"=="0" (
  echo ✅ Sync+Restart finalizado correctamente.
) else (
  echo ❌ Sync+Restart finalizado con errores (c=%EXITCODE%).
)

popd
echo.
pause
exit /b %EXITCODE%
