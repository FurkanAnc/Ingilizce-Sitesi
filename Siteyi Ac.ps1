$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:5173/"
$outLog = Join-Path $projectDir "vite-output.log"
$errLog = Join-Path $projectDir "vite-error.log"

function Test-Site {
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

Set-Location $projectDir

$pathKeys = [Environment]::GetEnvironmentVariables("Process").Keys | Where-Object { $_ -ieq "Path" }
if (($pathKeys | Measure-Object).Count -gt 1) {
    $pathValue = [Environment]::GetEnvironmentVariable("Path", "Process")
    $upperPathValue = [Environment]::GetEnvironmentVariable("PATH", "Process")
    if (-not $pathValue -and $upperPathValue) {
        [Environment]::SetEnvironmentVariable("Path", $upperPathValue, "Process")
    }
    [Environment]::SetEnvironmentVariable("PATH", $null, "Process")
}

$nodeCandidates = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Users\asusl\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
    (Get-Command node -ErrorAction SilentlyContinue).Source
) | Where-Object { $_ -and (Test-Path $_) }

$nodeExe = $nodeCandidates | Select-Object -First 1
$npmExe = Join-Path $projectDir ".codex-tools\package\bin\npm.cmd"
$npmCli = Join-Path $projectDir ".codex-tools\package\bin\npm-cli.js"
$viteScript = Join-Path $projectDir "node_modules\vite\bin\vite.js"

if (Test-Site) {
    Start-Process $url
    exit
}

if (-not $nodeExe) {
    Write-Host "Node.js bulunamadi. Once Node.js kurulu olmali."
    Pause
    exit 1
}

if (-not (Test-Path (Join-Path $projectDir "node_modules"))) {
    Write-Host "Ilk acilis hazirlaniyor, bu birkac dakika surebilir..."
    if (Test-Path $npmCli) {
        & $nodeExe $npmCli install
    } elseif (Test-Path $npmExe) {
        & $npmExe install
    } else {
        Write-Host "Gerekli paketler eksik. Bu klasorde 'npm install' calistirilmali."
        Pause
        exit 1
    }
}

if (-not (Test-Path $viteScript)) {
    Write-Host "Site baslatma dosyalari eksik. Bu klasorde 'npm install' calistirilmali."
    Pause
    exit 1
}

if (Test-Path $outLog) { Clear-Content $outLog }
if (Test-Path $errLog) { Clear-Content $errLog }

$serverArgs = @($viteScript, "--host", "127.0.0.1", "--port", "5173", "--strictPort")
$server = Start-Process -FilePath $nodeExe `
    -ArgumentList $serverArgs `
    -WorkingDirectory $projectDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -PassThru

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-Site) {
        Start-Process $url
        exit
    }
}

Write-Host "Site baslatildi ama tarayiciya hazir sinyali gelmedi."
Write-Host "Hata ayrintisi icin vite-error.log ve vite-output.log dosyalarina bakabilirsin."
Pause
