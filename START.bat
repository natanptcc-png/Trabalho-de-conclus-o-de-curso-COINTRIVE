@echo off

echo ====================================================
echo   Iniciando o ecossistema Cointrive (Projeto TCC)
echo ====================================================

:: Inicia o Frontend em uma nova janela de forma independente
echo [+] Inicializando o servidor do Frontend...
start "Cointrive - Frontend" cmd /k "cd /d frontend && npm run dev"

:: Inicia o Backend em outra nova janela de forma independente
echo [+] Inicializando o servidor do Backend...
start "Cointrive - Backend" cmd /k "cd /d backend && node server.js"

echo ====================================================
echo   Ambos os servidores foram iniciados com sucesso!
echo   Nao feche esta janela para manter o log limpo.
echo =====