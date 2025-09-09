@echo off
title JSReport - Restart Docker
setlocal ENABLEDELAYEDEXPANSION
color 0A

echo ================================================================================
echo  JSREPORT - SOLO REINICIO DOCKER
echo  docker-compose down / up -d + espera
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

node ".\scripts\jsreport-restart.js"
set "EXITCODE=%ERRORLEVEL%"

echo.
if "%EXITCODE%"=="0" (
  echo ✅ Docker reiniciado correctamente.
) else (
  echo ❌ Error reiniciando Docker (c=%EXITCODE%).
)

popd
echo.
pause
exit /b %EXITCODE%
