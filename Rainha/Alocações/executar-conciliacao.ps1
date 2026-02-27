# ============================================================================
# Sistema Avançado de Conciliação de Funcionários - PowerShell Launcher
# Versão: 2.0.0
# Autor: Sistema Automatizado
# ============================================================================

param(
    [string]$Mode = "auto",
    [switch]$Silent,
    [switch]$Debug,
    [switch]$Force
)

# Configurações
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Variáveis globais
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MainApp = "app-conciliacao-funcionarios.tsx"
$LogFile = Join-Path $ProjectDir "execucao.log"
$ConfigFile = Join-Path $ProjectDir "config.env"

# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logEntry
    
    if (-not $Silent) {
        switch ($Level) {
            "ERROR" { Write-Host $logEntry -ForegroundColor Red }
            "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
            default { Write-Host $logEntry -ForegroundColor Cyan }
        }
    }
}

# Função para verificar pré-requisitos
function Test-Prerequisites {
    Write-Log "Verificando pré-requisitos do sistema..."
    
    $checks = @{
        "MainApp" = Test-Path (Join-Path $ProjectDir $MainApp)
        "PowerShell" = $PSVersionTable.PSVersion.Major -ge 5
        "Internet" = Test-NetConnection -ComputerName "google.com" -Port 80 -InformationLevel Quiet -ErrorAction SilentlyContinue
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Log "✅ $($check.Key): OK" "SUCCESS"
        } else {
            Write-Log "❌ $($check.Key): FALHOU" "ERROR"
        }
    }
    
    return $checks
}

# Função para detectar Node.js
function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "✅ Node.js detectado: $nodeVersion" "SUCCESS"
            return @{ Available = $true; Version = $nodeVersion }
        }
    } catch {
        Write-Log "⚠️ Node.js não encontrado" "WARN"
    }
    return @{ Available = $false; Version = $null }
}

# Função para detectar Python
function Test-Python {
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            Write-Log "✅ Python detectado: $pythonVersion" "SUCCESS"
            return @{ Available = $true; Version = $pythonVersion }
        }
    } catch {
        Write-Log "⚠️ Python não encontrado" "WARN"
    }
    return @{ Available = $false; Version = $null }
}

# Função para instalar dependências via Chocolatey
function Install-Dependencies {
    Write-Log "Verificando Chocolatey..." "INFO"
    
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "Instalando Chocolatey..." "INFO"
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    $node = Test-NodeJS
    if (-not $node.Available) {
        Write-Log "Instalando Node.js via Chocolatey..." "INFO"
        choco install nodejs -y
        refreshenv
    }
    
    $python = Test-Python
    if (-not $python.Available) {
        Write-Log "Instalando Python via Chocolatey..." "INFO"
        choco install python -y
        refreshenv
    }
}

# Função para criar package.json
function New-PackageJson {
    $packagePath = Join-Path $ProjectDir "package.json"
    
    if (-not (Test-Path $packagePath)) {
        Write-Log "Criando package.json..." "INFO"
        
        $packageContent = @{
            name = "sistema-conciliacao-funcionarios"
            version = "2.0.0"
            private = $true
            dependencies = @{
                "react" = "^18.2.0"
                "react-dom" = "^18.2.0"
                "react-scripts" = "5.0.1"
                "lucide-react" = "^0.263.1"
                "@babel/standalone" = "^7.23.0"
            }
            scripts = @{
                start = "react-scripts start"
                build = "react-scripts build"
                test = "react-scripts test"
                eject = "react-scripts eject"
            }
            eslintConfig = @{
                extends = @("react-app", "react-app/jest")
            }
            browserslist = @{
                production = @("^0.2%", "not dead", "not op_mini all")
                development = @("last 1 chrome version", "last 1 firefox version", "last 1 safari version")
            }
        }
        
        $packageContent | ConvertTo-Json -Depth 10 | Set-Content $packagePath -Encoding UTF8
        Write-Log "✅ package.json criado com sucesso" "SUCCESS"
    }
}

# Função para criar arquivo HTML
function New-HtmlFile {
    $htmlPath = Join-Path $ProjectDir "index.html"
    
    if (-not (Test-Path $htmlPath)) {
        Write-Log "Criando arquivo HTML..." "INFO"
        
        $htmlContent = @"
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema Avançado de Conciliação de Funcionários</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="$MainApp"></script>
</body>
</html>
"@
        
        Set-Content $htmlPath $htmlContent -Encoding UTF8
        Write-Log "✅ Arquivo HTML criado com sucesso" "SUCCESS"
    }
}

# Função para executar modo React
function Start-ReactMode {
    Write-Log "Iniciando modo React..." "INFO"
    
    $node = Test-NodeJS
    if (-not $node.Available) {
        Write-Log "Node.js é necessário para o modo React" "ERROR"
        return $false
    }
    
    Set-Location $ProjectDir
    
    New-PackageJson
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "Instalando dependências npm..." "INFO"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Erro na instalação das dependências" "ERROR"
            return $false
        }
    }
    
    Write-Log "Iniciando servidor React em http://localhost:3000" "SUCCESS"
    Start-Process "http://localhost:3000"
    npm start
    
    return $true
}

# Função para executar modo HTML estático
function Start-HtmlMode {
    Write-Log "Iniciando modo HTML estático..." "INFO"
    
    New-HtmlFile
    
    Set-Location $ProjectDir
    
    $python = Test-Python
    $node = Test-NodeJS
    
    if ($python.Available) {
        Write-Log "Usando Python para servidor HTTP na porta 8000" "INFO"
        Start-Process "http://localhost:8000"
        python -m http.server 8000
    } elseif ($node.Available) {
        Write-Log "Usando Node.js para servidor HTTP na porta 8080" "INFO"
        Start-Process "http://localhost:8080"
        npx http-server -p 8080
    } else {
        Write-Log "Abrindo arquivo diretamente no navegador" "INFO"
        Start-Process (Join-Path $ProjectDir "index.html")
    }
    
    return $true
}

# Função para criar backup
function New-Backup {
    $backupDir = Join-Path $ProjectDir "backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    Write-Log "Criando backup em: $backupDir" "INFO"
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    $filesToBackup = @("*.tsx", "*.js", "*.json", "*.html", "*.css", "*.xlsx", "*.csv", "*.md")
    foreach ($pattern in $filesToBackup) {
        Get-ChildItem -Path $ProjectDir -Filter $pattern | Copy-Item -Destination $backupDir -Force
    }
    
    Write-Log "✅ Backup criado com sucesso" "SUCCESS"
    return $backupDir
}

# Função para executar diagnóstico
function Invoke-Diagnostics {
    Write-Log "Executando diagnóstico completo..." "INFO"
    
    $diagnostics = @{
        "Data/Hora" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "Diretório" = $ProjectDir
        "PowerShell" = $PSVersionTable.PSVersion.ToString()
        "Sistema Operacional" = [System.Environment]::OSVersion.VersionString
        "Arquitetura" = [System.Environment]::Is64BitOperatingSystem
    }
    
    $node = Test-NodeJS
    $python = Test-Python
    
    if ($node.Available) { $diagnostics["Node.js"] = $node.Version }
    if ($python.Available) { $diagnostics["Python"] = $python.Version }
    
    # Verificar integridade dos arquivos
    $requiredFiles = @($MainApp, "reconciliationEngine.js", "stringUtils.js", "excelUtils.js")
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ProjectDir $file
        $diagnostics["Arquivo: $file"] = if (Test-Path $filePath) { "✅ Encontrado" } else { "❌ Ausente" }
    }
    
    Write-Log "=== DIAGNÓSTICO COMPLETO ===" "INFO"
    foreach ($item in $diagnostics.GetEnumerator()) {
        Write-Log "$($item.Key): $($item.Value)" "INFO"
    }
    
    return $diagnostics
}

# Função principal
function Start-ConciliationSystem {
    Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                 SISTEMA AVANÇADO DE CONCILIAÇÃO DE FUNCIONÁRIOS              ║
║                            PowerShell Launcher 2.0                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Log "Iniciando Sistema Avançado de Conciliação de Funcionários..." "INFO"
    
    # Verificar pré-requisitos
    $prereqs = Test-Prerequisites
    if (-not $prereqs.MainApp) {
        Write-Log "Arquivo principal não encontrado: $MainApp" "ERROR"
        return
    }
    
    # Executar baseado no modo
    switch ($Mode.ToLower()) {
        "react" {
            Start-ReactMode
        }
        "html" {
            Start-HtmlMode
        }
        "setup" {
            Install-Dependencies
        }
        "backup" {
            New-Backup
        }
        "diagnostic" {
            Invoke-Diagnostics
        }
        "auto" {
            $node = Test-NodeJS
            if ($node.Available) {
                Start-ReactMode
            } else {
                Start-HtmlMode
            }
        }
        default {
            Write-Log "Modo inválido: $Mode. Use: react, html, setup, backup, diagnostic, auto" "ERROR"
        }
    }
}

# Executar se não estiver sendo importado como módulo
if ($MyInvocation.InvocationName -ne '.') {
    Start-ConciliationSystem
}
