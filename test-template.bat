@echo off
title Probador Interactivo de Templates JSReport
cls

echo ================================================================================
echo                   PROBADOR INTERACTIVO DE TEMPLATES JSREPORT                   
echo ================================================================================
echo.
echo Este script te permite:
echo   - Elegir cualquier template de informeSeleccion
echo   - Seleccionar datos de prueba o usar datos minimos
echo   - Generar PDF sin reiniciar Docker
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

REM Ejecutar script interactivo
node test-template-interactive.js

echo.
echo ================================================================================
echo.
pause