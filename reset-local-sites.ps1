$ErrorActionPreference = "Continue"

$sites = @(
    @{
        Name = "MandarinOS.app"
        Path = "C:\Users\drryo\OneDrive\Documents\GitHub\Website\MandarinOS.app"
        Port = 3000
    },
    @{
        Name = "GetToKnow.You"
        Path = "C:\Users\drryo\OneDrive\Documents\GitHub\Website\gettoknow-you"
        Port = 3001
    }
)

Write-Host "Stopping stale localhost processes..." -ForegroundColor Cyan

foreach ($port in 3000,3001) {
    $processIds = Get-NetTCPConnection `
        -LocalPort $port `
        -State Listen `
        -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $processIds) {
        if ($processId -and $processId -ne $PID) {
            Write-Host "Stopping process $processId on port $port"
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Clearing Next.js caches..." -ForegroundColor Cyan

foreach ($site in $sites) {
    if (-not (Test-Path -LiteralPath $site.Path)) {
        Write-Warning "Repository not found: $($site.Path)"
        continue
    }

    $nextPath = Join-Path $site.Path ".next"
    if (Test-Path -LiteralPath $nextPath) {
        Remove-Item -LiteralPath $nextPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Removed $nextPath"
    }
}

Start-Sleep -Seconds 1

Write-Host "Starting fresh development servers..." -ForegroundColor Cyan

foreach ($site in $sites) {
    if (-not (Test-Path -LiteralPath $site.Path)) {
        continue
    }

    $command = @"
Set-Location -LiteralPath '$($site.Path)'
Write-Host ''
Write-Host 'Starting $($site.Name) on port $($site.Port)...' -ForegroundColor Cyan
Write-Host 'Keep this window open while using the site.' -ForegroundColor Yellow
npm run dev -- --port $($site.Port)
"@

    Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $command
    )
}

Write-Host ""
Write-Host "Reset complete." -ForegroundColor Green
Write-Host "MandarinOS.app:    http://localhost:3000"
Write-Host "MandarinOS editor: http://localhost:3000/keystatic"
Write-Host "GetToKnow.You:     http://localhost:3001"
Write-Host "GetToKnow editor:  http://localhost:3001/keystatic"
Write-Host ""
Write-Host "Allow each server window to report Ready before opening the pages."
