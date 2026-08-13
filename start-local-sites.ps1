$ErrorActionPreference = "Stop"

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

foreach ($site in $sites) {
    if (-not (Test-Path -LiteralPath $site.Path)) {
        Write-Warning "Repository not found: $($site.Path)"
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
Write-Host "Development servers launched." -ForegroundColor Green
Write-Host "MandarinOS.app:    http://localhost:3000"
Write-Host "MandarinOS editor: http://localhost:3000/keystatic"
Write-Host "GetToKnow.You:     http://localhost:3001"
Write-Host "GetToKnow editor:  http://localhost:3001/keystatic"
Write-Host ""
Write-Host "Do not close the two server PowerShell windows."
