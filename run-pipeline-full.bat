@echo off
title JSReport - Pipeline completo (Git + Docker + Render)
setlocal ENABLEDELAYEDEXPANSION

REM ---- Colores bonitos (opcional)
color 0A

echo ================================================================================
echo  JSREPORT - PIPELINE COMPLETO
echo  1) git pull/add/commit/push en la rama actual
echo  2) docker-compose down/up
echo  3) seleccion de template y render por API
echo ================================================================================

REM ---- Verificar Node
where node >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en PATH.
  pause & exit /b 1
)

REM ---- Verificar Docker
docker info >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Docker Desktop no esta corriendo.
  pause & exit /b 1
)

REM ---- Movernos a la raiz de este repo (carpeta del .bat)
pushd "%~dp0"

echo [OK] Prerrequisitos verificados.
echo.

REM ---- Ejecutar script
node ".\scripts\jsreport-pipeline-full.js"
set "EXITCODE=%ERRORLEVEL%"

echo.
if "%EXITCODE%"=="0" (
  echo ✅ Pipeline finalizado correctamente.
) else (
  echo ❌ Pipeline finalizado con errores (c=%EXITCODE%).
)

popd
echo.
pause
exit /b %EXITCODE%
