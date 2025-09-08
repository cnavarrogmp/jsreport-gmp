@echo off
title JSReport Pipeline Test
cls

echo ================================================================================
echo                      JSREPORT PIPELINE AUTOMATIZADO                            
echo ================================================================================
echo.
echo Este script ejecuta:
echo   1. Commit y push en carpeta Docker
echo   2. Reinicio de Docker
echo   3. Generacion de PDF via API
echo.
echo ================================================================================
echo.

REM Verificar si Node.js está instalado
where node > NUL 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no encontrado. Por favor instala Node.js
    pause
    exit /b 1
)

REM Verificar si Docker está corriendo
docker info > NUL 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta corriendo. Por favor inicia Docker Desktop
    pause
    exit /b 1
)

echo [OK] Prerequisitos verificados
echo.

REM Ejecutar pipeline
echo Ejecutando pipeline...
echo.

node deploy-test-pipeline.js

echo.
echo ================================================================================
echo Pipeline completado. Revisa los archivos generados en:
echo D:\Carmen\Escritorio\PRUEBAS DOCUMENTOS API
echo ================================================================================
echo.

pause