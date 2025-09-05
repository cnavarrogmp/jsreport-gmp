@echo off
REM ========================================
REM SCRIPT 2: TEST-API
REM Ejecuta llamada a la API de JSReport
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

echo [INFO] URL JSReport: %JSREPORT_URL%
echo [INFO] Directorio salida: %OUTPUT_DIR%
echo [INFO] Timestamp: %TIMESTAMP%
echo.

REM ====== PASO 1: VERIFICAR CONECTIVIDAD ======
echo [1/4] Verificando conectividad con JSReport...
echo -----------------------------------------------------
curl -s -o nul -w "HTTP Status: %%{http_code}\n" %JSREPORT_URL%/api/ping
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se puede conectar con JSReport
    echo.
    echo Posibles soluciones:
    echo   1. Verificar que Docker este ejecutandose
    echo   2. Ejecutar: docker ps
    echo   3. Verificar logs: docker-compose logs jsreport
    echo   4. Ejecutar sync-and-restart.bat
    echo.
    pause
    exit /b 1
)
echo [OK] Conexion establecida con JSReport
echo.

REM ====== PASO 2: PREPARAR DATOS DE PRUEBA ======
echo [2/4] Usando datos de prueba...
echo -----------------------------------------------------

REM Verificar que existe el archivo de datos
if not exist "datos-estructura-real.json" (
    echo [ERROR] No se encuentra datos-estructura-real.json
    pause
    exit /b 1
)

echo [OK] Archivo de datos encontrado
echo.

REM ====== PASO 3: EJECUTAR LLAMADA API ======
echo [3/4] Ejecutando llamada a la API...
echo -----------------------------------------------------
echo.
echo Enviando peticion POST a JSReport...
echo Template: informeInteligente
echo.

REM Crear archivo temporal con la petición
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
  -w "\n\nDetalles de la respuesta:\n  HTTP Status: %%{http_code}\n  Tiempo total: %%{time_total}s\n  Tamaño descargado: %%{size_download} bytes\n"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo en la generacion del PDF
    echo.
    echo Verificar:
    echo   1. Logs de JSReport: docker-compose logs jsreport
    echo   2. Estructura del JSON de datos
    echo   3. Que la plantilla InformeSeleccion05 existe
    echo.
    del temp_request.json 2>nul
    pause
    exit /b 1
)

REM Limpiar archivo temporal
del temp_request.json 2>nul

echo.
echo [OK] PDF generado exitosamente
echo.

REM ====== PASO 4: VERIFICAR Y MOSTRAR RESULTADO ======
echo [4/4] Verificando resultado...
echo -----------------------------------------------------

REM Verificar que el PDF se generó
if exist "%OUTPUT_DIR%\informe_%TIMESTAMP%.pdf" (
    echo [OK] PDF guardado en: %OUTPUT_DIR%\informe_%TIMESTAMP%.pdf
    
    REM Obtener tamaño del archivo
    for %%A in ("%OUTPUT_DIR%\informe_%TIMESTAMP%.pdf") do (
        echo [INFO] Tamaño del archivo: %%~zA bytes
    )
    
    echo.
    echo ================================================
    echo         TEST COMPLETADO CON EXITO
    echo ================================================
    echo.
    
    REM Preguntar si abrir el PDF
    choice /C SN /M "¿Desea abrir el PDF generado? (S/N)"
    if errorlevel 2 (
        echo.
        echo PDF no abierto. Puede encontrarlo en:
        echo %OUTPUT_DIR%\informe_%TIMESTAMP%.pdf
    ) else (
        echo.
        echo Abriendo PDF...
        start "" "%OUTPUT_DIR%\informe_%TIMESTAMP%.pdf"
    )
) else (
    echo.
    echo [ERROR] El PDF no se genero correctamente
    echo Verificar logs de JSReport para mas detalles
)

echo.
echo ================================================
echo            RESUMEN DE LA PRUEBA
echo ================================================
echo.
echo Timestamp: %TIMESTAMP%
echo Plantilla: informeInteligente
echo Datos: datos-estructura-real.json
echo Salida: %OUTPUT_DIR%\informe_%TIMESTAMP%.pdf
echo.
echo Para ver logs detallados ejecutar:
echo   docker-compose logs jsreport
echo.

pause