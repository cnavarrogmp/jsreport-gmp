@echo off
REM Script simplificado para test API

echo Generando PDF con JSReport...

curl -X POST ^
  http://localhost:5488/api/report ^
  -u admin:admin ^
  -H "Content-Type: application/json" ^
  -d "{\"template\":{\"name\":\"informeInteligente\"},\"data\":$(cat datos-estructura-real.json)}" ^
  --output "D:\Carmen\Escritorio\PRUEBAS DOCUMENTOS API\test_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%.pdf" ^
  --max-time 60 ^
  -w "\nHTTP: %%{http_code}\nTiempo: %%{time_total}s\n"

pause