@echo off
REM ========================================
REM SCRIPT 1: SYNC-AND-RESTART
REM Sincroniza repositorios y reinicia Docker
REM ========================================

echo.
echo ================================================
echo      SINCRONIZACION Y REINICIO DE DOCKER
echo ================================================
echo.

REM Variables de configuración
set REPO_LOCAL=D:\WorkingGMPCarmen\WorkCarmGMPGit\GPMCarmenGit\jsreport-gmp
set REPO_DOCKER=D:\WorkingGMPCarmen\GMP-JsReport
set BRANCH_NAME=SPRINTS/SPRINT10/623CarmenJsReport
set COMMIT_MSG=Auto-sync: Updates from development [%date:~-4,4%-%date:~-7,2%-%date:~-10,2%T%time:~0,2%-%time:~3,2%-%time:~6,2%]

REM ====== PASO 1: COMMIT Y PUSH DESDE REPO LOCAL ======
echo [1/5] Haciendo commit y push en repositorio local...
echo -----------------------------------------------------
cd /d %REPO_LOCAL%

REM Agregar todos los cambios
git add .

REM Hacer commit con mensaje automático
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] No hay cambios para hacer commit o hubo un error
    echo.
) else (
    echo.
    echo [OK] Commit realizado exitosamente
    echo.
)

REM Push al repositorio remoto
echo.
echo Subiendo cambios a GitHub...
git push origin %BRANCH_NAME%
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo hacer push. Verificar conexion y credenciales
    pause
    exit /b 1
) else (
    echo [OK] Push completado exitosamente
    echo.
)

REM ====== PASO 2: PULL Y MERGE EN REPO DOCKER ======
echo [2/5] Actualizando repositorio Docker...
echo -----------------------------------------------------
cd /d %REPO_DOCKER%

REM Fetch para obtener últimos cambios
echo Obteniendo ultimos cambios del remoto...
git fetch origin
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo hacer fetch del repositorio
    pause
    exit /b 1
)

REM Cambiar a main si no estamos ahí
echo.
echo Cambiando a rama main...
git checkout main
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo cambiar a rama main
    pause
    exit /b 1
)

REM Pull de main para actualizar
echo.
echo Actualizando rama main...
git pull origin main
if %errorlevel% neq 0 (
    echo [AVISO] Posibles conflictos al actualizar main
)

REM Merge de la rama de desarrollo
echo.
echo [3/5] Haciendo merge de rama %BRANCH_NAME%...
echo -----------------------------------------------------
git merge origin/%BRANCH_NAME% -m "Merge: Sync from development branch"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Conflictos en el merge. Resolver manualmente
    echo.
    echo Ejecutar en el directorio Docker:
    echo   git status  (para ver conflictos)
    echo   git merge --abort  (para cancelar merge)
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Merge completado exitosamente
    echo.
)

REM ====== PASO 3: DETENER DOCKER ======
echo [4/5] Deteniendo contenedores Docker...
echo -----------------------------------------------------
docker-compose down
if %errorlevel% neq 0 (
    echo [AVISO] Docker ya estaba detenido o hubo un problema
) else (
    echo [OK] Contenedores detenidos
)

REM Limpiar contenedores y volúmenes huérfanos
echo.
echo Limpiando recursos Docker...
docker system prune -f
echo.

REM ====== PASO 4: REINICIAR DOCKER ======
echo [5/5] Iniciando contenedores Docker...
echo -----------------------------------------------------
docker-compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudieron iniciar los contenedores
    echo Verificar docker-compose.yml y logs con: docker-compose logs
    pause
    exit /b 1
)

echo.
echo Esperando que JSReport inicie completamente (30 segundos)...
timeout /t 30 /nobreak > nul

REM ====== VERIFICACION FINAL ======
echo.
echo ================================================
echo           VERIFICANDO ESTADO FINAL
echo ================================================
echo.

echo Estado de contenedores:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Estado del repositorio Docker:
cd /d %REPO_DOCKER%
git log --oneline -n 3

echo.
echo ================================================
echo      SINCRONIZACION COMPLETADA CON EXITO
echo ================================================
echo.
echo JSReport deberia estar disponible en:
echo   http://localhost:5488
echo.
echo Siguientes pasos:
echo   1. Verificar JSReport en navegador
echo   2. Ejecutar test-api.bat para probar API
echo.

pause