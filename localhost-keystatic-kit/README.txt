LOCALHOST + KEYSTATIC KIT

Files:
- LOCALHOST_AND_KEYSTATIC_GUIDE.md — full repeatable checklist
- start-local-sites.ps1 — starts both repositories on fixed ports
- reset-local-sites.ps1 — kills stale port processes, clears .next, and restarts both

Configured paths:
- C:\Users\drryo\OneDrive\Documents\GitHub\Website\MandarinOS.app
- C:\Users\drryo\OneDrive\Documents\GitHub\Website\gettoknow-you

Run from PowerShell:
powershell -ExecutionPolicy Bypass -File ".\start-local-sites.ps1"

Full recovery:
powershell -ExecutionPolicy Bypass -File ".\reset-local-sites.ps1"
