@echo off
call npm run tsc
call npm run lint
call npm run build
pause
