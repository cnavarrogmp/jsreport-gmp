@echo off
REM ========================================
REM SCRIPT SYNC-AND-RESTART SIMPLIFICADO
REM Solo sync entre repos y restart Docker
REM ========================================

echo.
echo ================================================
echo      SINCRONIZACION Y REINICIO DE DOCKER
echo ================================================
echo.

REM Variables de configuración
set REPO_LOCAL=D:\WorkingGMPCarmen\WorkCarmGMPGit\GPMCarmenGit\jsreport-gmp
set REPO_DOCKER=D:\WorkingGMPCarmen\GMP-JsReport

REM Obtener rama actual automáticamente
cd /d %REPO_LOCAL%
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo Trabajando con rama: %CURRENT_BRANCH%
echo.

REM ====== PASO 1: COMMIT Y PUSH DESDE REPO LOCAL ======
echo [1/3] Haciendo commit y push en repositorio local...
echo -----------------------------------------------------
cd /d %REPO_LOCAL%

REM Agregar todos los cambios
git add .

REM Hacer commit con mensaje automático con timestamp
set TIMESTAMP=%date:~-4,4%-%date:~-7,2%-%date:~-10,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
git commit -m "Auto-sync: %TIMESTAMP%"

if %errorlevel% neq 0 (
    echo [INFO] No hay cambios para hacer commit
) else (
    echo [OK] Commit realizado
)

REM Push al repositorio remoto en la rama actual
echo.
echo Subiendo cambios a GitHub en rama %CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo hacer push
    pause
    exit /b 1
)
echo [OK] Push completado
echo.

REM ====== PASO 2: PULL Y MERGE EN REPO DOCKER ======
echo [2/3] Actualizando repositorio Docker...
echo -----------------------------------------------------
cd /d %REPO_DOCKER%

REM Fetch para obtener los últimos cambios
echo Obteniendo cambios del remoto...
git fetch origin

REM Pull y merge de la rama que acabamos de pushear
echo.
echo Haciendo merge de rama %CURRENT_BRANCH%...
git pull origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo [AVISO] Posibles conflictos. Revisar manualmente si es necesario
)
echo.

REM ====== PASO 3: REINICIAR DOCKER ======
echo [3/3] Reiniciando Docker...
echo -----------------------------------------------------

REM Detener contenedores
docker-compose down
echo [OK] Contenedores detenidos
echo.

REM Iniciar contenedores
echo Iniciando contenedores...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron iniciar los contenedores
    pause
    exit /b 1
)

echo.
echo Esperando que JSReport inicie (15 segundos)...
timeout /t 15 /nobreak > nul

REM ====== VERIFICACION FINAL ======
echo.
echo ================================================
echo           SINCRONIZACION COMPLETADA
echo ================================================
echo.
echo Estado de Docker:
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.
echo JSReport disponible en: http://localhost:5488
echo.
echo Siguiente paso: Ejecutar test-api.bat
echo.

pause