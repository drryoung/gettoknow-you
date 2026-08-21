# GetToKnow.You publishing helper.
# Commits and pushes ordinary Keystatic content/media only.
# Never force-pushes, never stages unrelated application code, never touches secrets.

param(
    [string]$Message = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root
$ExpectedBranch = "main"
$ExpectedRemote = "origin"

function Write-Ok([string]$Text) {
    Write-Host ("[ok] " + $Text) -ForegroundColor Green
}

function Write-Fail([string]$Text) {
    Write-Host ""
    Write-Host $Text -ForegroundColor Red
    Write-Host ""
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($GitArgs -join ' ')"
    }
}

function Test-Repo {
    $packagePath = Join-Path $Root "package.json"
    if (-not (Test-Path -LiteralPath $packagePath)) {
        Write-Fail "This command must be run from the GetToKnow.You folder."
        exit 1
    }
    $pkg = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
    if ($pkg.name -ne "gettoknow-you") {
        Write-Fail "This command must be run from the GetToKnow.You folder."
        exit 1
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Fail "Git is not installed or not on PATH."
        exit 1
    }
    if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Fail "Node.js / npm is not installed or not on PATH."
        exit 1
    }
}

function Get-Decision {
    param(
        [string]$Branch,
        [int]$RemoteAhead,
        [int]$LocalAhead,
        [string]$StatusFile,
        [string]$CommitMessage
    )

    $argList = @(
        "--import", "./scripts/register-ts-loader.mjs",
        "./scripts/classify-publish.mjs",
        "--branch", $Branch,
        "--expected-branch", $ExpectedBranch,
        "--remote-ahead", "$RemoteAhead",
        "--local-ahead", "$LocalAhead",
        "--status-file", $StatusFile
    )
    if ($CommitMessage) {
        $argList += @("--message", $CommitMessage)
    }

    $env:NODE_NO_WARNINGS = "1"
    $json = & node @argList
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($json)) {
        throw "Could not classify the files that would be published."
    }
    $start = $json.IndexOf("{")
    $end = $json.LastIndexOf("}")
    if ($start -lt 0 -or $end -le $start) {
        throw "Could not classify the files that would be published."
    }
    $json = $json.Substring($start, $end - $start + 1)
    return $json | ConvertFrom-Json
}

function Invoke-Validation {
    Write-Host ""
    Write-Host "Checking that the site still builds correctly..."
    cmd.exe /c "npm run typecheck"
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Type check failed. Nothing was committed or pushed."
        exit 1
    }
    Write-Ok "Type check passed"

    cmd.exe /c "npm test"
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Tests failed. Nothing was committed or pushed."
        exit 1
    }
    Write-Ok "Tests passed"

    cmd.exe /c "npm run build"
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Site build failed. Nothing was committed or pushed."
        exit 1
    }
    Write-Ok "Site build passed"
}

Test-Repo

Write-Host ""
Write-Host "GetToKnow.You publish" -ForegroundColor Cyan
Write-Host ""

$branch = (git rev-parse --abbrev-ref HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    Write-Fail "This folder is not a Git repository."
    exit 1
}

$remote = git remote 2>$null
if ($remote -notcontains $ExpectedRemote) {
    Write-Fail "The expected remote '$ExpectedRemote' is not configured."
    exit 1
}

Write-Host "Checking the remote copy of $ExpectedBranch..."
try {
    Invoke-Git fetch $ExpectedRemote
} catch {
    Write-Fail "Could not reach $ExpectedRemote. Check your internet connection, then try again. Nothing was committed or pushed."
    exit 1
}

$remoteRef = "$ExpectedRemote/$ExpectedBranch"
git rev-parse --verify $remoteRef 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Could not find $remoteRef."
    exit 1
}

$remoteAhead = [int](git rev-list --count "HEAD..$remoteRef")
$localAhead = [int](git rev-list --count "$remoteRef..HEAD")
$statusLines = @(git -c core.quotepath=false status --porcelain=v1 -uall)
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Could not read the Git working tree."
    exit 1
}
$statusFile = Join-Path $env:TEMP "gettoknow-you-status.txt"
$utf8Status = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($statusFile, $statusLines, $utf8Status)

try {
    $decision = Get-Decision -Branch $branch.Trim() -RemoteAhead $remoteAhead -LocalAhead $localAhead -StatusFile $statusFile -CommitMessage $Message
} catch {
    Write-Fail $_.Exception.Message
    exit 1
} finally {
    Remove-Item -LiteralPath $statusFile -Force -ErrorAction SilentlyContinue
}

if ($decision.action -eq "stop") {
    Write-Fail $decision.reason
    if ($decision.details) {
        foreach ($item in $decision.details) {
            Write-Host "  $item"
        }
        Write-Host ""
        Write-Host "Review or commit these separately before publishing."
        Write-Host ""
    }
    exit 1
}

if ($decision.action -eq "nothing") {
    Write-Host "Nothing new to publish."
    exit 0
}

if ($decision.action -eq "push-only") {
    Write-Host "Nothing new to commit."
    Write-Host "There are already $($decision.localAhead) local commit(s) waiting to be sent."
    if ($DryRun) {
        Write-Host "Dry run: would validate, then push to $ExpectedRemote/$ExpectedBranch."
        exit 0
    }
    Invoke-Validation
    try {
        Invoke-Git push $ExpectedRemote HEAD:$ExpectedBranch
    } catch {
        Write-Fail "Push failed. Local commits are unchanged."
        Write-Host $_.Exception.Message
        Write-Host ""
        exit 1
    }
    $sha = git rev-parse --short HEAD
    Write-Host ""
    Write-Ok "Published successfully."
    Write-Host ""
    Write-Host "Commit: $sha"
    Write-Host "Pushed to: $ExpectedRemote/$ExpectedBranch"
    Write-Host ""
    Write-Host "Vercel should now deploy this commit automatically."
    Write-Host "This command does not wait to confirm that the public site has updated."
    Write-Host ""
    exit 0
}

$files = @($decision.files)
Write-Host "Ready to publish:"
Write-Host ""
$statusLines = @($statusLines | Where-Object { $_.Trim() -ne "" })
$newFiles = @()
$updatedFiles = @()
foreach ($file in $files) {
    $line = $statusLines | Where-Object { $_ -like "*$file" } | Select-Object -First 1
    if ($line -and $line.StartsWith("??")) {
        $newFiles += $file
    } else {
        $updatedFiles += $file
    }
}
if ($newFiles.Count -gt 0) {
    Write-Host "  New:"
    foreach ($file in $newFiles) { Write-Host "    $file" }
}
if ($updatedFiles.Count -gt 0) {
    Write-Host "  Updated:"
    foreach ($file in $updatedFiles) { Write-Host "    $file" }
}
Write-Host ""
Write-Host "Commit message:"
Write-Host "  $($decision.message)"
if ($decision.localAhead -gt 0) {
    Write-Host ""
    Write-Host "Note: $($decision.localAhead) already-committed local change(s) will also be pushed."
}

if ($DryRun) {
    Write-Host ""
    Write-Host "Dry run: no validation, commit, or push was performed."
    exit 0
}

Invoke-Validation

Write-Host ""
Write-Host "Saving the content changes..."

$alreadyStaged = @(git -c core.quotepath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Could not read staged files."
    exit 1
}
if ($alreadyStaged.Count -gt 0) {
    $approved = New-Object 'System.Collections.Generic.HashSet[string]'
    foreach ($file in $files) { [void]$approved.Add($file) }
    foreach ($staged in $alreadyStaged) {
        $normalized = ($staged -replace "\\", "/")
        if (-not $approved.Contains($normalized)) {
            Write-Fail "Publishing stopped. Git already had unrelated files staged."
            Write-Host "  $normalized"
            Write-Host "Unstage those files, then try again. Nothing was committed or pushed."
            Write-Host ""
            exit 1
        }
    }
}

try {
    Invoke-Git add -- @files
} catch {
    Write-Fail "Could not stage the content files."
    Write-Host $_.Exception.Message
    Write-Host ""
    exit 1
}

$stagedNow = @(git -c core.quotepath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Could not verify staged files. Nothing was committed or pushed."
    exit 1
}
$stagedNorm = @($stagedNow | ForEach-Object { $_ -replace "\\", "/" } | Sort-Object)
$approvedNorm = @($files | Sort-Object)
$stagedJoined = ($stagedNorm -join ';')
$approvedJoined = ($approvedNorm -join ';')
if ($stagedJoined -ne $approvedJoined) {
    Write-Fail "Publishing stopped because the staged files did not match the approved content files. Nothing was committed or pushed."
    Write-Host "Approved:"
    $approvedNorm | ForEach-Object { Write-Host "  $_" }
    Write-Host "Staged:"
    $stagedNorm | ForEach-Object { Write-Host "  $_" }
    exit 1
}

$messageFile = Join-Path $env:TEMP "gettoknow-you-commit-msg.txt"
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($messageFile, [string]$decision.message, $utf8)
try {
    Invoke-Git commit -F $messageFile
} catch {
    Write-Fail "Commit failed. Nothing was pushed."
    Write-Host $_.Exception.Message
    Write-Host ""
    exit 1
} finally {
    Remove-Item -LiteralPath $messageFile -Force -ErrorAction SilentlyContinue
}

Write-Ok "$($files.Count) file(s) committed"
$sha = git rev-parse --short HEAD

try {
    Invoke-Git push $ExpectedRemote HEAD:$ExpectedBranch
} catch {
    Write-Fail "Committed locally as $sha but the push did not succeed."
    Write-Host "Fix the connection, then run publish-site again. It will send the waiting commit."
    Write-Host $_.Exception.Message
    Write-Host ""
    exit 1
}

git fetch $ExpectedRemote 2>$null | Out-Null
$head = git rev-parse HEAD
$remoteHead = git rev-parse $remoteRef
if ($head -ne $remoteHead) {
    Write-Fail "Push finished, but $remoteRef does not yet match this computer. Check the remote before assuming the site will update."
    exit 1
}

Write-Host ""
Write-Ok "Published successfully."
Write-Host ""
Write-Host "Commit: $sha"
Write-Host "Pushed to: $ExpectedRemote/$ExpectedBranch"
Write-Host ""
Write-Host "Vercel should now deploy this commit automatically."
Write-Host "This command does not wait to confirm that the public site has updated."
Write-Host ""
