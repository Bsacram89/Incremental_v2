@echo off
REM — Caminho do Power Automate Desktop
set PAD_PATH="C:\Program Files (x86)\Power Automate Desktop\PAD.Console.Host.exe"

REM — Caminho do seu fluxo (.flow)
set FLOW_PATH="G:\Drives compartilhados\Incremental\Clientes Atuais\Jaguare\PIRAS\2025\Cópia_de_Main.flow"

REM — Executa o fluxo
%PAD_PATH% -f %FLOW_PATH%
