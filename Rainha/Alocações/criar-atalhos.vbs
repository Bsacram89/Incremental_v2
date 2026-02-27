' ============================================================================
' Script VBS para criar atalho do Sistema de Conciliação
' ============================================================================

Set WshShell = WScript.CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obter diretório atual
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")

' Criar atalho para o .bat
Set batShortcut = WshShell.CreateShortcut(desktopPath & "\Sistema de Conciliação - Executar.lnk")
batShortcut.TargetPath = currentDir & "\executar-conciliacao-avancada.bat"
batShortcut.WorkingDirectory = currentDir
batShortcut.Description = "Sistema Avançado de Conciliação de Funcionários"
batShortcut.IconLocation = "shell32.dll,277"
batShortcut.Save

' Criar atalho para o PowerShell
Set ps1Shortcut = WshShell.CreateShortcut(desktopPath & "\Sistema de Conciliação - PowerShell.lnk")
ps1Shortcut.TargetPath = "powershell.exe"
ps1Shortcut.Arguments = "-ExecutionPolicy Bypass -File """ & currentDir & "\executar-conciliacao.ps1"""
ps1Shortcut.WorkingDirectory = currentDir
ps1Shortcut.Description = "Sistema de Conciliação - Modo PowerShell"
ps1Shortcut.IconLocation = "powershell.exe,0"
ps1Shortcut.Save

WScript.Echo "✅ Atalhos criados na área de trabalho com sucesso!" & vbCrLf & _
             "- Sistema de Conciliação - Executar.lnk" & vbCrLf & _
             "- Sistema de Conciliação - PowerShell.lnk"
