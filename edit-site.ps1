# GetToKnow.You local editor launcher.
# Starts the development site on port 3001 and opens Keystatic.
# Do not change Windows execution policy globally; use edit-site.cmd if needed.

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Port = 3001
$SiteUrl = "http://localhost:$Port"
$ProbeUrl = "http://127.0.0.1:$Port"
$EditorUrl = "http://localhost:$Port/keystatic"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

function Write-Info([string]$Text) {
    Write-Host $Text
}

function Write-Ok([string]$Text) {
    Write-Host ("[ok] " + $Text) -ForegroundColor Green
}

function Write-Fail([string]$Text) {
    Write-Host ""
    Write-Host $Text -ForegroundColor Red
    Write-Host ""
}

function Test-Repo {
    $packagePath = Join-Path $Root "package.json"
    $configPath = Join-Path $Root "keystatic.config.ts"
    if (-not (Test-Path -LiteralPath $packagePath) -or -not (Test-Path -LiteralPath $configPath)) {
        Write-Fail "This command must be run from the GetToKnow.You folder."
        exit 1
    }
    $pkg = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
    if ($pkg.name -ne "gettoknow-you") {
        Write-Fail "This command must be run from the GetToKnow.You folder."
        exit 1
    }
}

function Test-Tools {
    foreach ($commandName in @("node", "npm")) {
        if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
            Write-Fail "$commandName is not installed or not on PATH. Install Node.js, then try again."
            exit 1
        }
    }
    $modules = Join-Path $Root "node_modules"
    if (-not (Test-Path -LiteralPath $modules)) {
        Write-Fail "Project files are not installed yet. Run npm install in this folder, then try again."
        exit 1
    }
}

function Get-PortOwnerId {
    $ids = @()
    try {
        $ids = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
            Select-Object -ExpandProperty OwningProcess -Unique)
    } catch {
        $ids = @()
    }
    if ($ids.Count -eq 0) {
        $listenPattern = ':' + $Port + '\s+.+LISTENING\s+(\d+)$'
        $lines = netstat -ano | Select-String $listenPattern
        foreach ($line in $lines) {
            if ($line.Matches.Count -gt 0) {
                $ids += [int]$line.Matches[0].Groups[1].Value
            }
        }
        $ids = $ids | Select-Object -Unique
    }
    return $ids
}

function Get-SiteState {
    try {
        $response = Invoke-WebRequest -Uri $ProbeUrl -UseBasicParsing -TimeoutSec 3
        if ($response.Content -match 'GetToKnow\.You') {
            return "ours"
        }
        return "other"
    } catch {
        $owners = @(Get-PortOwnerId)
        if ($owners.Count -gt 0) {
            return "other"
        }
        return "down"
    }
}

function Test-NextCacheCorrupt {
    $packageFile = Join-Path $Root ".next\package.json"
    if (-not (Test-Path -LiteralPath $packageFile)) {
        return $false
    }
    try {
        $item = Get-Item -LiteralPath $packageFile -Force
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            Get-Content -LiteralPath $packageFile -TotalCount 1 -ErrorAction Stop | Out-Null
        }
        return $false
    } catch {
        return $true
    }
}

function Remove-NextCache {
    $nextPath = Join-Path $Root ".next"
    if (Test-Path -LiteralPath $nextPath) {
        Remove-Item -LiteralPath $nextPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Info "Cleared a damaged local cache and will try once more."
    }
}

function Wait-UntilReady([int]$Seconds = 90) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $ProbeUrl -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
            continue
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Start-EditorServer {
    $log = Join-Path $env:TEMP "gettoknow-you-edit.log"
    $err = Join-Path $env:TEMP "gettoknow-you-edit.err.log"
    if (Test-Path -LiteralPath $log) { Remove-Item -LiteralPath $log -Force }
    if (Test-Path -LiteralPath $err) { Remove-Item -LiteralPath $err -Force }

    $process = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @("/c", "npm run dev -- --port $Port") `
        -WorkingDirectory $Root `
        -WindowStyle Hidden `
        -PassThru `
        -RedirectStandardOutput $log `
        -RedirectStandardError $err
    return @{ Process = $process; Log = $log; Err = $err }
}

function Stop-EditorServer($process) {
    if (-not $process) { return }
    try {
        cmd.exe /c "taskkill /PID $($process.Id) /T /F" | Out-Null
    } catch {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}

function Show-LogTail($paths) {
    foreach ($path in $paths) {
        if (Test-Path -LiteralPath $path) {
            Get-Content -LiteralPath $path -Tail 20
        }
    }
}

function Open-Editor {
    Start-Process $EditorUrl | Out-Null
}

Test-Repo
Test-Tools

Write-Host ""
Write-Host "GetToKnow.You editor" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keystatic:"
Write-Host $EditorUrl
Write-Host ""

$state = Get-SiteState
if ($state -eq "ours") {
    Open-Editor
    Write-Ok "The editor is already running."
    Write-Info "You can close this window. Keep the existing server window open while editing."
    exit 0
}

if ($state -eq "other") {
    Write-Fail "Port $Port is already in use by another program."
    Write-Host "GetToKnow.You needs $SiteUrl."
    Write-Host "Close the other program using that port, or stop the extra Node window, then try again."
    Write-Host "Nothing was stopped automatically."
    Write-Host ""
    exit 1
}

if (Test-NextCacheCorrupt) {
    Remove-NextCache
}

$started = $null
$retried = $false
try {
    while ($true) {
        Write-Info "Starting the editor. Keep this window open while editing."
        Write-Info "Press Ctrl+C when finished."
        Write-Host ""
        $started = Start-EditorServer
        $ready = Wait-UntilReady 90
        if ($ready) {
            Open-Editor
            Write-Host ""
            Write-Ok "Editor is ready."
            Write-Host "Keystatic:"
            Write-Host $EditorUrl
            Write-Host ""
            Write-Host "Keep this window open while editing."
            Write-Host "Press Ctrl+C when finished."
            Write-Host ""
            Wait-Process -Id $started.Process.Id
            exit 0
        }

        $combined = ""
        foreach ($path in @($started.Log, $started.Err)) {
            if (Test-Path -LiteralPath $path) {
                $combined += Get-Content -LiteralPath $path -Raw
            }
        }
        Stop-EditorServer $started.Process

        $cacheProblem = ($combined -match 'EINVAL') -or ($combined -match 'readlink') -or ($combined -match [regex]::Escape('.next\package.json'))
        if ($cacheProblem -and -not $retried) {
            $retried = $true
            Remove-NextCache
            continue
        }

        Write-Fail "The editor did not start in time."
        Show-LogTail @($started.Log, $started.Err)
        Write-Host "If this keeps happening, close other Node windows and try again."
        exit 1
    }
} finally {
    if ($started -and $started.Process -and -not $started.Process.HasExited) {
        Stop-EditorServer $started.Process
    }
}
