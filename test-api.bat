@echo off
REM ========================================
REM SCRIPT TEST-API
REM Llamada independiente a la API JSReport
REM ========================================

echo.
echo ================================================
echo         TEST DE API JSREPORT
echo ================================================
echo.

REM Variables de configuración
set JSREPORT_URL=http://localhost:5488
set OUTPUT_DIR=D:\WorkingGMPCarmen\WorkCarmGMPGit\GPMCarmenGit\jsreport-gmp\output
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM Crear directorio de salida si no existe
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo URL JSReport: %JSREPORT_URL%
echo Plantilla: informeInteligente
echo Datos: datos-estructura-real.json
echo.

REM ====== VERIFICAR CONECTIVIDAD ======
echo [1/3] Verificando conectividad con JSReport...
curl -s -o nul -w "Estado HTTP: %%{http_code}\n" %JSREPORT_URL%/api/ping
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se puede conectar con JSReport
    echo Ejecutar primero: sync-and-restart.bat
    pause
    exit /b 1
)
echo [OK] Conexion establecida
echo.

REM ====== VERIFICAR ARCHIVO DE DATOS ======
echo [2/3] Verificando archivo de datos...
if not exist "datos-estructura-real.json" (
    echo [ERROR] No se encuentra datos-estructura-real.json
    pause
    exit /b 1
)
echo [OK] Archivo de datos encontrado
echo.

REM ====== EJECUTAR LLAMADA API ======
echo [3/3] Generando PDF...
echo -----------------------------------------------------

REM Crear petición JSON temporal
(
echo {
echo   "template": {
echo     "name": "informeInteligente"
echo   },
echo   "data": 
type datos-estructura-real.json
echo }
) > temp_request.json

REM Ejecutar llamada con curl
curl -X POST ^
  %JSREPORT_URL%/api/report ^
  -H "Content-Type: application/json" ^
  -d @temp_request.json ^
  --output "%OUTPUT_DIR%\informe_%TIMESTAMP%.pdf" ^
  -w "\nEstado HTTP: %%{http_code}\nTiempo: %%{time_total}s\nTamaño: %%{size_download} bytes\n"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo en la generacion del PDF
    del temp_request.json 2>nul
    pause
    exit /b 1
)

REM Limpiar archivo temporal
del temp_request.json 2>nul

echo.
echo ================================================
echo           PDF GENERADO CON EXITO
echo ================================================
echo.
echo Archivo: %OUTPUT_DIR%\informe_%TIMESTAMP%.pdf
echo.

REM Preguntar si abrir el PDF
choice /C SN /M "¿Abrir el PDF generado? (S/N)"
if errorlevel 2 (
    echo.
    echo PDF guardado en:
    echo %OUTPUT_DIR%\informe_%TIMESTAMP%.pdf
) else (
    start "" "%OUTPUT_DIR%\informe_%TIMESTAMP%.pdf"
)

echo.
pause